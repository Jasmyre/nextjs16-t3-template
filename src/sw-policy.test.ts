import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  decideSwRequest,
  OFFLINE_FALLBACK_URL,
  SW_PRECACHED_URLS,
  SW_SCOPE,
  SW_URL,
  type SwRequestSnapshot,
  shouldServeOfflineFallback,
} from "@/sw-policy";

const ORIGIN = "http://localhost:3000";

const snapshot = (
  url: string,
  overrides: Partial<SwRequestSnapshot> = {}
): SwRequestSnapshot => ({
  destination: "",
  getHeader: () => null,
  method: "GET",
  mode: "cors",
  origin: ORIGIN,
  url,
  ...overrides,
});

const withHeader =
  (headers: Record<string, string>) =>
  (name: string): string | null =>
    headers[name.toLowerCase()] ?? null;

const documentSnapshot = (url: string): SwRequestSnapshot =>
  snapshot(url, { destination: "document", mode: "navigate" });

/**
 * Pins the assets-only offline policy (issue #43): every live trial call —
 * auth, typed transport, REST reads and writes, RSC payloads, prefetches,
 * Server Actions, document navigations — stays network-only, and only the
 * public deployment-versioned set serves from precache. Offline document
 * navigations receive the generic fallback only.
 */
describe("sw worker identity", () => {
  it("serves the worker at the root scope kept by the response headers", () => {
    expect(SW_URL).toBe("/sw.js");
    expect(SW_SCOPE).toBe("/");
  });

  it("falls back to the generic offline page", () => {
    expect(OFFLINE_FALLBACK_URL).toBe("/offline");
  });
});

describe("sw precache inventory", () => {
  it("holds only the public deployment-versioned set", () => {
    expect([...SW_PRECACHED_URLS].sort()).toEqual(
      [
        "/api/openapi.json",
        "/maintenance",
        "/manifest.webmanifest",
        "/offline",
        "/reference",
      ].sort()
    );
  });

  it("keeps the session-redirected landing page out of precache", () => {
    // The proxy redirects signed-in traffic on /landing, so its bytes are
    // not deployment-constant. Precaching it would store a signed-in
    // redirect under a public key.
    expect(SW_PRECACHED_URLS).not.toContain("/landing");
  });

  it("never precaches signed-in pages or api responses", () => {
    // Offline navigation failures receive the generic fallback — never a
    // cached signed-in page or cached API data (issue #44).
    for (const pathname of [
      "/",
      "/posts",
      "/posts/new",
      "/posts/1/edit",
      "/admin",
      "/auth",
      "/auth/error",
      "/api/auth/session",
      "/api/trpc/post.list,post.getById?batch=1&input={}",
      "/api/v1/posts",
      "/api/v1/posts/1",
      "/api/v1/dashboard/stats",
    ]) {
      expect(SW_PRECACHED_URLS).not.toContain(pathname);
    }
  });

  it("serves the precached set from cache instead of the network", () => {
    for (const url of SW_PRECACHED_URLS) {
      expect(decideSwRequest(snapshot(`${ORIGIN}${url}`))).toBe("precached");
    }
  });

  it("mirrors the precached set in the worker build config", () => {
    const config = readFileSync(
      path.join(process.cwd(), "serwist.config.js"),
      "utf8"
    );
    for (const url of SW_PRECACHED_URLS) {
      expect(config).toContain(`url: "${url}"`);
    }
    expect(config).toContain(`url: "${OFFLINE_FALLBACK_URL}"`);
  });
});

describe("sw network-only auth prefix", () => {
  it("keeps every NextAuth endpoint on the network", () => {
    const paths = [
      "/api/auth/session",
      "/api/auth/csrf",
      "/api/auth/signin",
      "/api/auth/signout",
      "/api/auth/callback/google",
      "/api/auth/callback/github",
    ];
    for (const pathname of paths) {
      expect(decideSwRequest(snapshot(`${ORIGIN}${pathname}`))).toBe(
        "network-only"
      );
    }
  });

  it("keeps auth writes on the network", () => {
    expect(
      decideSwRequest(snapshot(`${ORIGIN}/api/auth/signin`, { method: "POST" }))
    ).toBe("network-only");
  });
});

describe("sw network-only typed transport", () => {
  it("keeps batched queries on the network", () => {
    expect(
      decideSwRequest(
        snapshot(`${ORIGIN}/api/trpc/post.list,post.getById?batch=1&input={}`)
      )
    ).toBe("network-only");
  });

  it("keeps mutations on the network", () => {
    expect(
      decideSwRequest(
        snapshot(`${ORIGIN}/api/trpc/post.create?batch=1`, { method: "POST" })
      )
    ).toBe("network-only");
  });
});

describe("sw network-only rest mount", () => {
  it("keeps rest reads on the network", () => {
    const paths = [
      "/api/v1/greeting",
      "/api/v1/posts",
      "/api/v1/posts/1",
      "/api/v1/posts/latest",
      "/api/v1/dashboard/stats",
    ];
    for (const pathname of paths) {
      expect(decideSwRequest(snapshot(`${ORIGIN}${pathname}`))).toBe(
        "network-only"
      );
    }
  });

  it("keeps rest writes on the network", () => {
    const writes: [string, string][] = [
      ["POST", "/api/v1/posts"],
      ["PATCH", "/api/v1/posts/1"],
      ["PUT", "/api/v1/posts/1"],
      ["DELETE", "/api/v1/posts/1"],
    ];
    for (const [method, pathname] of writes) {
      expect(
        decideSwRequest(snapshot(`${ORIGIN}${pathname}`, { method }))
      ).toBe("network-only");
    }
  });
});

describe("sw network-only rsc payloads", () => {
  it("keeps session holes and role gates on the network", () => {
    const headers = ["rsc", "next-router-state-tree"];
    for (const header of headers) {
      expect(
        decideSwRequest(
          snapshot(`${ORIGIN}/`, {
            destination: "",
            getHeader: withHeader({ [header]: "1" }),
            mode: "cors",
          })
        )
      ).toBe("network-only");
    }
  });

  it("keeps router prefetches on the network", () => {
    expect(
      decideSwRequest(
        snapshot(`${ORIGIN}/posts`, {
          destination: "",
          getHeader: withHeader({
            "next-router-prefetch": "1",
            rsc: "1",
          }),
          mode: "cors",
        })
      )
    ).toBe("network-only");
  });

  it("keeps server actions on the network", () => {
    expect(
      decideSwRequest(
        snapshot(`${ORIGIN}/posts`, {
          destination: "",
          getHeader: withHeader({ "next-action": "abc123" }),
          method: "POST",
          mode: "cors",
        })
      )
    ).toBe("network-only");
  });
});

describe("sw network-only documents", () => {
  it("keeps authenticated html on the network", () => {
    for (const pathname of ["/", "/posts", "/posts/new", "/admin"]) {
      expect(decideSwRequest(documentSnapshot(`${ORIGIN}${pathname}`))).toBe(
        "network-only"
      );
    }
  });

  it("keeps auth pages on the network", () => {
    for (const pathname of ["/auth", "/auth/error", "/landing"]) {
      expect(decideSwRequest(documentSnapshot(`${ORIGIN}${pathname}`))).toBe(
        "network-only"
      );
    }
  });
});

describe("sw unknown routes default", () => {
  it("keeps unknown same-origin routes on the network", () => {
    for (const pathname of ["/future", "/api/public/ping", "/api/triumph"]) {
      expect(decideSwRequest(snapshot(`${ORIGIN}${pathname}`))).toBe(
        "network-only"
      );
    }
  });

  it("keeps cross-origin requests on the network", () => {
    expect(
      decideSwRequest(
        snapshot("https://fonts.gstatic.com/s/inter.woff2", {
          origin: ORIGIN,
        })
      )
    ).toBe("network-only");
  });

  it("fails closed on malformed urls", () => {
    expect(decideSwRequest(snapshot("::not-a-url::"))).toBe("network-only");
  });
});

describe("sw offline fallback", () => {
  it("serves the generic fallback for document navigations only", () => {
    expect(shouldServeOfflineFallback({ destination: "document" })).toBe(true);
  });

  it("never serves the fallback for subresources", () => {
    for (const destination of ["", "image", "script", "style", "font"]) {
      expect(shouldServeOfflineFallback({ destination })).toBe(false);
    }
  });
});

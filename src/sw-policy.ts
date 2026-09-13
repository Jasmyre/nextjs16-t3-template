/**
 * Service-worker routing policy (issue #43): the pure assets-only offline
 * decision. Every live trial call — document navigations, authenticated HTML
 * and RSC payloads, session holes, role gates, router prefetches, Server
 * Actions, the Procedure-backed typed transport, and every versioned REST
 * mount Operation over either auth scheme — stays network-only, with unknown
 * future routes network-only by default. Only the public
 * deployment-versioned set serves from precache; offline document
 * navigations receive the generic fallback only. The worker resolves no
 * identity and grants nothing.
 *
 * Pure by construction: no service-worker globals, no `server-only`, no
 * framework imports — so the unit suite pins it and the worker source plus
 * the build config consume it without bundler aliases.
 */

export const SW_URL = "/sw.js";

export const SW_SCOPE = "/";

export const OFFLINE_FALLBACK_URL = "/offline";

/**
 * Public deployment-versioned inventory for `additionalPrecacheEntries` in
 * `serwist.config.js` (kept in sync by `src/sw-policy.test.ts`): the
 * generic fallback, the redirect-free marketing page, the static Reference
 * UI, the served manifest, and the static Document. `/landing` is excluded
 * on purpose — the proxy redirects signed-in traffic there, so its bytes
 * are not deployment-constant and precaching it would store a signed-in
 * redirect under a public key.
 */
export const SW_PRECACHED_URLS: readonly string[] = [
  OFFLINE_FALLBACK_URL,
  "/maintenance",
  "/reference",
  "/manifest.webmanifest",
  "/api/openapi.json",
];

/** Network-only URL prefixes: NextAuth, typed transport, versioned REST. */
const NETWORK_ONLY_PREFIXES: readonly string[] = [
  "/api/auth",
  "/api/trpc",
  "/api/v1",
];

/** Request headers marking RSC payloads, prefetches, and Server Actions. */
const NETWORK_ONLY_HEADERS: readonly string[] = [
  "rsc",
  "next-router-prefetch",
  "next-router-state-tree",
  "next-action",
];

export type SwRequestDecision = "network-only" | "precached";

export interface SwRequestSnapshot {
  destination: string;
  getHeader: (name: string) => string | null;
  method: string;
  mode: string;
  origin: string;
  url: string;
}

const hasPrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const hasNetworkOnlyHeader = (snapshot: SwRequestSnapshot): boolean => {
  for (const header of NETWORK_ONLY_HEADERS) {
    if (snapshot.getHeader(header) !== null) {
      return true;
    }
  }
  return false;
};

const pathnameOf = (snapshot: SwRequestSnapshot): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(snapshot.url);
  } catch {
    return null;
  }
  if (parsed.origin !== snapshot.origin) {
    return null;
  }
  return parsed.pathname;
};

export function decideSwRequest(
  snapshot: SwRequestSnapshot
): SwRequestDecision {
  const pathname = pathnameOf(snapshot);
  if (pathname === null) {
    return "network-only";
  }
  if (hasNetworkOnlyHeader(snapshot)) {
    return "network-only";
  }
  for (const prefix of NETWORK_ONLY_PREFIXES) {
    if (hasPrefix(pathname, prefix)) {
      return "network-only";
    }
  }
  if ((SW_PRECACHED_URLS as readonly string[]).includes(pathname)) {
    return "precached";
  }
  return "network-only";
}

export function shouldServeOfflineFallback(request: {
  destination: string;
}): boolean {
  return request.destination === "document";
}

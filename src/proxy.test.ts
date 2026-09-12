import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PWA_APPLE_TOUCH_ICON,
  PWA_ICONS,
  PWA_MANIFEST_URL,
  PWA_STARTUP_IMAGES,
} from "@/pwa";
import { SW_URL } from "@/sw-policy";

const MATCHER_BLOCK_PATTERN = /matcher:\s*\[([\s\S]*?)\n\s*\],/;
const STRING_LITERAL_PATTERN = /"((?:[^"\\]|\\.)*)"/g;

/**
 * Reads the statically-parsed `config.matcher` from `src/proxy.ts`. The
 * matcher stays inline because Next.js requires it statically analyzable
 * at build time, so the test parses the source instead of importing the
 * module (which would pull `next-auth` into the unit suite).
 */
const proxyMatcherPatterns = (): string[] => {
  const source = readFileSync(
    path.join(process.cwd(), "src", "proxy.ts"),
    "utf8"
  );
  const block = MATCHER_BLOCK_PATTERN.exec(source);
  if (!block?.[1]) {
    throw new Error("proxy matcher block not found in src/proxy.ts");
  }
  const literals = block[1].match(STRING_LITERAL_PATTERN) ?? [];
  return literals.map((literal) => JSON.parse(literal) as string);
};

/**
 * Pins proxy reachability for the installed app (issue #44): the worker,
 * the manifest, and every generated asset bypass the proxy so they never
 * receive an auth redirect, while pages still run through the proxy so the
 * landing/auth/admin gating stays authoritative with the worker installed.
 * The matcher holds no named params, so plain RegExp evaluation is faithful.
 */
describe("proxy matcher reachability", () => {
  const patterns = proxyMatcherPatterns();

  const matchesProxy = (pathname: string): boolean =>
    patterns.some((pattern) => new RegExp(`^${pattern}$`).test(pathname));

  const pwaAssetUrls = [
    SW_URL,
    PWA_MANIFEST_URL,
    ...PWA_ICONS.map((icon) => icon.src),
    PWA_APPLE_TOUCH_ICON.url,
    ...PWA_STARTUP_IMAGES.map((image) => image.url),
  ];

  it("finds the matcher it pins", () => {
    expect(patterns.length).toBeGreaterThan(0);
    expect(pwaAssetUrls.length).toBeGreaterThan(0);
  });

  it("keeps the worker, manifest, and generated assets outside the proxy", () => {
    for (const url of pwaAssetUrls) {
      expect(matchesProxy(url)).toBe(false);
    }
  });

  it("keeps framework static assets outside the proxy", () => {
    expect(matchesProxy("/_next/static/chunks/app.js")).toBe(false);
  });

  it("still runs pages through the proxy so gating stays authoritative", () => {
    for (const pathname of [
      "/",
      "/posts",
      "/admin",
      "/auth",
      "/landing",
      "/offline",
      "/maintenance",
      "/reference",
    ]) {
      expect(matchesProxy(pathname)).toBe(true);
    }
  });
});

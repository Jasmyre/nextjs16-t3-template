// @ts-check
import { spawnSync } from "node:child_process";
import { serwist } from "@serwist/next/config";

/**
 * Service-worker build (issue #43): configurator mode, so Turbopack dev and
 * builds stay untouched — `next build && serwist build` emits the worker to
 * `public/sw.js`, served at `/sw.js` under the existing response headers.
 *
 * `precachePrerendered` stays off: only the public deployment-versioned set
 * below plus the build-globbed revisioned static assets and `public/`
 * files are precached. The page list must match `SW_PRECACHED_URLS` in
 * `src/sw-policy.ts` (pinned by `src/sw-policy.test.ts`); `/landing` is
 * excluded there because the proxy redirects signed-in traffic on it.
 */
const gitRevision = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf-8",
}).stdout?.trim();

const revision =
  gitRevision === "" || gitRevision === undefined
    ? crypto.randomUUID()
    : gitRevision;

export default serwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  precachePrerendered: false,
  additionalPrecacheEntries: [
    { url: "/offline", revision },
    { url: "/maintenance", revision },
    { url: "/reference", revision },
    { url: "/manifest.webmanifest", revision },
    { url: "/api/openapi.json", revision },
  ],
});

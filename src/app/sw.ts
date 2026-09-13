/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";
import {
  decideSwRequest,
  OFFLINE_FALLBACK_URL,
  shouldServeOfflineFallback,
} from "../sw-policy";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Service-worker shell (issue #43): Serwist with the assets-only policy
 * from `src/sw-policy.ts`. Built by `serwist build` (configurator mode, so
 * Turbopack dev and builds stay untouched) into `public/sw.js` and served
 * at `/sw.js` under the existing response headers.
 *
 * Update discipline: `skipWaiting` and `clientsClaim` stay off so a new
 * worker waits for tabs to close or reload — an active authenticated
 * session is never force-reloaded. There is no worker-level TTL layer;
 * obsolete precache entries are replaced by revision on worker update.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url, request }) =>
        decideSwRequest({
          destination: request.destination,
          getHeader: (name) => request.headers.get(name),
          method: request.method,
          mode: request.mode,
          origin: self.location.origin,
          url: url.href,
        }) === "network-only",
      handler: new NetworkOnly(),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: OFFLINE_FALLBACK_URL,
        matcher: ({ request }) =>
          shouldServeOfflineFallback({ destination: request.destination }),
      },
    ],
  },
});

serwist.addEventListeners();

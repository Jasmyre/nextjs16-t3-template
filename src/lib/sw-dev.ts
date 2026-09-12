/**
 * Service-worker registration gate.
 *
 * Production always registers the worker. Development stays worker-free by
 * default so the Turbopack dev loop never serves stale precache entries —
 * except when explicitly opted in via `NEXT_PUBLIC_SW_IN_DEV=1`, which is
 * what `npm run dev:https:lan:sw` sets for on-device installability testing
 * (Chrome only offers "Install app" over a plain shortcut when a worker
 * with a fetch handler is registered).
 */
export function isServiceWorkerEnabled({
  nodeEnv,
  optIn,
}: {
  nodeEnv: string | undefined;
  optIn: string | undefined;
}): boolean {
  if (nodeEnv === "development") {
    return optIn === "1";
  }
  return true;
}

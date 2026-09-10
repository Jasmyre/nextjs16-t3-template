import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

/**
 * Cross-request revalidation window for page-visit reads, in seconds.
 * Mutations invalidate by tag immediately, so this only bounds how long an
 * un-invalidated read can lag (stale-while-revalidate).
 */
export const CACHE_REVALIDATE_SECONDS = 10;

/**
 * Stale-while-revalidate profile for on-demand tag invalidation: serve the
 * cached result immediately while it refreshes in the background. This is the
 * recommended `revalidateTag` usage for Route Handlers (including tRPC
 * mutations) — immediate read-your-writes expiry (`updateTag`) is only
 * available inside Server Actions.
 */
export const STALE_WHILE_REVALIDATE_PROFILE = "max";

/**
 * Wraps a repository read in `unstable_cache` so repeat page visits share one
 * cached result instead of issuing a fresh Prisma query per visit.
 *
 * Cache keys are the `keyParts` plus the call arguments, so user-scoped reads
 * stay isolated per caller — never share one wrapper across users without a
 * per-user argument. In tests `next/cache` is stubbed to a passthrough, so
 * these wrappers execute their real query logic.
 */
export function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  tags: string[],
  revalidate: number = CACHE_REVALIDATE_SECONDS
): (...args: A) => Promise<R> {
  return unstable_cache(fn, keyParts, { revalidate, tags }) as (
    ...args: A
  ) => Promise<R>;
}

/**
 * Invalidates every cached read carrying `tag` with stale-while-revalidate
 * semantics. Prefer this over raw `revalidateTag` so the SWR profile stays
 * pinned in one place.
 */
export function revalidateCacheTag(tag: string): void {
  revalidateTag(tag, STALE_WHILE_REVALIDATE_PROFILE);
}

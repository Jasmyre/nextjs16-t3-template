import { vi } from "vitest";

/**
 * Test stub for `next/cache`.
 *
 * The real `next/cache` primitives (`unstable_cache`, `revalidateTag`, ...)
 * require a Next.js request/cache scope and throw outside of it, so both
 * Vitest projects alias `next/cache` to this file:
 * - `unstable_cache` is a transparent passthrough — cached repository reads
 *   execute their real query logic in tests (unit + integration).
 * - `revalidateTag` / `revalidatePath` are spies so router invalidation can
 *   be asserted at the caller seam.
 */
export const revalidateTag = vi.fn();
export const revalidatePath = vi.fn();

export function unstable_cache<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>
): (...args: A) => Promise<R> {
  return fn;
}

export const cacheTag = vi.fn();
export const cacheLife = vi.fn();

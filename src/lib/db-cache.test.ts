import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POSTS_LIST_TAG } from "@/lib/cache-tags";
import {
  CACHE_REVALIDATE_SECONDS,
  cached,
  revalidateCacheTag,
  STALE_WHILE_REVALIDATE_PROFILE,
} from "@/lib/db-cache";

describe("cached", () => {
  it("exposes the default revalidation window", () => {
    expect(CACHE_REVALIDATE_SECONDS).toBe(60);
  });

  it("returns a callable preserving arguments and result", async () => {
    const query = async (id: string, limit: number) => ({ id, limit });
    const cachedQuery = cached(query, ["test-query"], [POSTS_LIST_TAG]);

    await expect(cachedQuery("user-1", 5)).resolves.toEqual({
      id: "user-1",
      limit: 5,
    });
  });
});

describe("revalidateCacheTag", () => {
  beforeEach(() => {
    vi.mocked(revalidateTag).mockClear();
  });

  it("revalidates with the stale-while-revalidate profile", () => {
    expect(STALE_WHILE_REVALIDATE_PROFILE).toBe("max");

    revalidateCacheTag(POSTS_LIST_TAG);

    expect(revalidateTag).toHaveBeenCalledWith(
      POSTS_LIST_TAG,
      STALE_WHILE_REVALIDATE_PROFILE
    );
  });
});

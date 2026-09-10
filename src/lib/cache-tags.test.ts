import { describe, expect, it } from "vitest";
import {
  ADMIN_USERS_TAG,
  DASHBOARD_STATS_TAG,
  POSTS_ITEM_TAG,
  POSTS_LIST_TAG,
  USERS_BY_ID_TAG,
} from "@/lib/cache-tags";

describe("cache tags", () => {
  it("defines a non-empty tag for every cached page-visit read", () => {
    for (const tag of [
      POSTS_LIST_TAG,
      POSTS_ITEM_TAG,
      DASHBOARD_STATS_TAG,
      ADMIN_USERS_TAG,
      USERS_BY_ID_TAG,
    ]) {
      expect(tag.length).toBeGreaterThan(0);
    }
  });

  it("keeps every tag distinct so invalidation never over-clears", () => {
    const tags = [
      POSTS_LIST_TAG,
      POSTS_ITEM_TAG,
      DASHBOARD_STATS_TAG,
      ADMIN_USERS_TAG,
      USERS_BY_ID_TAG,
    ];
    expect(new Set(tags).size).toBe(tags.length);
  });
});

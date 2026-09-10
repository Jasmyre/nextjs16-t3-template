/**
 * Shared `unstable_cache` tag vocabulary for page-visit reads.
 *
 * Tags are static per cached function (`unstable_cache` options cannot vary
 * per call argument), so invalidation is intentionally coarse: any post write
 * clears every post-list-shaped read, and any role write clears the admin
 * list plus the session user lookups. Writes are rare; page visits are not.
 */
export const POSTS_LIST_TAG = "posts:list";
export const POSTS_ITEM_TAG = "posts:item";
export const DASHBOARD_STATS_TAG = "dashboard:stats";
export const ADMIN_USERS_TAG = "admin:users";
export const USERS_BY_ID_TAG = "users:by-id";

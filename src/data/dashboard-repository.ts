import "server-only";

import { DASHBOARD_STATS_TAG } from "@/lib/cache-tags";
import { cached } from "@/lib/db-cache";
import { db } from "@/server/db";

export const getDashboardStats = cached(
  async (
    userId: string
  ): Promise<{ totalUsers: number; totalPosts: number; myPosts: number }> => {
    const [totalUsers, totalPosts, myPosts] = await db.$transaction([
      db.user.count(),
      db.post.count(),
      db.post.count({ where: { authorId: userId } }),
    ]);

    return { totalUsers, totalPosts, myPosts };
  },
  ["dashboard-stats"],
  [DASHBOARD_STATS_TAG]
);

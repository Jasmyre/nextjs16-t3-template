import "server-only";

import { db } from "@/server/db";

export const getDashboardStats = async (
  userId: string
): Promise<{ totalUsers: number; totalPosts: number; myPosts: number }> => {
  const [totalUsers, totalPosts, myPosts] = await db.$transaction([
    db.user.count(),
    db.post.count(),
    db.post.count({ where: { authorId: userId } }),
  ]);

  return { totalUsers, totalPosts, myPosts };
};

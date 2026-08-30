import "server-only";

import type { Post } from "@prisma/client";
import { db } from "@/server/db";

export const createPost = async (name: string): Promise<Post> =>
  db.post.create({
    data: { name },
  });

export const getLatestPost = async (): Promise<Post | null> =>
  db.post.findFirst({
    orderBy: { createdAt: "desc" },
  });

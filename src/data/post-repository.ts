import "server-only";

import type { Post } from "@prisma/client";
import { db } from "@/server/db";

export const createPost = async (
  name: string,
  authorId: string
): Promise<Post> =>
  db.post.create({
    data: { name, authorId },
  });

export const getPostById = async (id: number): Promise<Post | null> =>
  db.post.findUnique({
    where: { id },
  });

export const getLatestPost = async (): Promise<Post | null> =>
  db.post.findFirst({
    orderBy: { createdAt: "desc" },
  });

export const updatePost = async (id: number, name: string): Promise<Post> =>
  db.post.update({
    where: { id },
    data: { name },
  });

export const deletePost = async (id: number): Promise<Post> =>
  db.post.delete({
    where: { id },
  });

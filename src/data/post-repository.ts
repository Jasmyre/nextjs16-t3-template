import "server-only";

import type { Post } from "@prisma/client";
import { db } from "@/server/db";

export type PostWithAuthor = Post & {
  author: { name: string };
};

const withAuthor = {
  author: { select: { name: true } },
} as const;

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

export const getPostByIdWithAuthor = async (
  id: number
): Promise<PostWithAuthor | null> =>
  db.post.findUnique({
    where: { id },
    include: withAuthor,
  });

export const listAllPosts = async (): Promise<PostWithAuthor[]> =>
  db.post.findMany({
    include: withAuthor,
    orderBy: { createdAt: "desc" },
  });

export const listPostsByAuthor = async (
  authorId: string
): Promise<PostWithAuthor[]> =>
  db.post.findMany({
    where: { authorId },
    include: withAuthor,
    orderBy: { createdAt: "desc" },
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

import "server-only";

import type { Post } from "@prisma/client";
import { POSTS_ITEM_TAG, POSTS_LIST_TAG } from "@/lib/cache-tags";
import { cached } from "@/lib/db-cache";
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

export const getPostByIdWithAuthor = cached(
  async (id: number): Promise<PostWithAuthor | null> =>
    db.post.findUnique({
      where: { id },
      include: withAuthor,
    }),
  ["post-by-id-with-author"],
  [POSTS_ITEM_TAG]
);

export const listAllPosts = cached(
  async (): Promise<PostWithAuthor[]> =>
    db.post.findMany({
      include: withAuthor,
      orderBy: { createdAt: "desc" },
    }),
  ["posts-all"],
  [POSTS_LIST_TAG]
);

export const listPostsByAuthor = cached(
  async (authorId: string): Promise<PostWithAuthor[]> =>
    db.post.findMany({
      where: { authorId },
      include: withAuthor,
      orderBy: { createdAt: "desc" },
    }),
  ["posts-by-author"],
  [POSTS_LIST_TAG]
);

export const getLatestPost = cached(
  async (): Promise<Post | null> =>
    db.post.findFirst({
      orderBy: { createdAt: "desc" },
    }),
  ["posts-latest"],
  [POSTS_LIST_TAG]
);

export const updatePost = async (id: number, name: string): Promise<Post> =>
  db.post.update({
    where: { id },
    data: { name },
  });

export const deletePost = async (id: number): Promise<Post> =>
  db.post.delete({
    where: { id },
  });

import "server-only";

import {
  createPost,
  deletePost,
  getLatestPost,
  getPostById,
  updatePost,
} from "@/data/post-repository";

export const greet = (text: string): string => `Hello ${text}`;

export const create = async (name: string, authorId: string) =>
  createPost(name, authorId);

export const getById = async (id: number) => getPostById(id);

export const getLatest = async () => getLatestPost();

export const update = async (id: number, name: string) => updatePost(id, name);

export const remove = async (id: number) => deletePost(id);

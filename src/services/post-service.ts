import "server-only";

import { RoleName } from "@prisma/client";
import {
  createPost,
  deletePost,
  getLatestPost,
  getPostById,
  getPostByIdWithAuthor,
  listAllPosts,
  listPostsByAuthor,
  updatePost,
} from "@/data/post-repository";
import type { PermissionUser } from "@/server/permissions";

export const greet = (text: string): string => `Hello ${text}`;

export const create = async (name: string, authorId: string) =>
  createPost(name, authorId);

export const getById = async (id: number) => getPostById(id);

export const getByIdWithAuthor = async (id: number) =>
  getPostByIdWithAuthor(id);

export const list = async (user: PermissionUser) =>
  user.roles.some(
    (role) => role === RoleName.ADMIN || role === RoleName.MODERATOR
  )
    ? listAllPosts()
    : listPostsByAuthor(user.id);

export const getLatest = async () => getLatestPost();

export const update = async (id: number, name: string) => updatePost(id, name);

export const remove = async (id: number) => deletePost(id);

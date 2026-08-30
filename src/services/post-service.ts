import "server-only";

import { createPost, getLatestPost } from "@/data/post-repository";

export const greet = (text: string): string => `Hello ${text}`;

export const create = async (name: string) => createPost(name);

export const getLatest = async () => getLatestPost();

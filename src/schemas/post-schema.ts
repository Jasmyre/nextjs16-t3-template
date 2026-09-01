import z from "zod";

export const postIdSchema = z.number().int().positive();

export const createPostSchema = z.object({
  name: z.string().min(1),
});

export const updatePostSchema = z.object({
  id: postIdSchema,
  name: z.string().min(1),
});

export const deletePostSchema = z.object({
  id: postIdSchema,
});

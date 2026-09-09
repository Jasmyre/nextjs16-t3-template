import { z } from "zod";

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

/**
 * Shared strict output contracts for the post collection.
 *
 * Date-bearing shapes pin ISO datetime strings (the REST wire shape) rather
 * than `Date` objects, so the same contract holds on tRPC itself and on the
 * future plain-JSON mount. Resolvers must serialize `Date`s before returning;
 * a raw `Date` fails output validation by design. Objects are strict so an
 * unexpected field fails loudly instead of drifting silently.
 */
export const postOutputSchema = z.strictObject({
  id: postIdSchema,
  name: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  authorId: z.string().min(1),
});

export const postWithAuthorOutputSchema = postOutputSchema.extend({
  author: z.strictObject({
    name: z.string().min(1),
  }),
});

export const postListOutputSchema = z.array(postWithAuthorOutputSchema);

export const helloOutputSchema = z.strictObject({
  greeting: z.string().min(1),
});

export const latestPostOutputSchema = postOutputSchema.nullable();

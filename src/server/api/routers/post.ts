import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createPostSchema,
  deletePostSchema,
  postIdSchema,
  updatePostSchema,
} from "@/schemas/post-schema";
import {
  createTRPCRouter,
  permissionProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { hasPermission } from "@/server/permissions";
import {
  create,
  getById,
  getByIdWithAuthor,
  getLatest,
  greet,
  list,
  remove,
  update,
} from "@/services/post-service";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => ({
      greeting: greet(input.text),
    })),

  create: permissionProcedure("Post", "create")
    .input(createPostSchema)
    .mutation(({ ctx, input }) => create(input.name, ctx.user.id)),

  list: permissionProcedure("Post", "view").query(async ({ ctx }) =>
    list(ctx.user)
  ),

  getById: permissionProcedure("Post", "view")
    .input(z.object({ id: postIdSchema }))
    .query(async ({ input }) => {
      const post = await getByIdWithAuthor(input.id);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found.",
        });
      }

      return post;
    }),

  update: permissionProcedure("Post", "update")
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await getById(input.id);

      if (!(post && hasPermission(ctx.user, "Post", "update", post))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this post.",
        });
      }

      return update(input.id, input.name);
    }),

  delete: permissionProcedure("Post", "delete")
    .input(deletePostSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await getById(input.id);

      if (!(post && hasPermission(ctx.user, "Post", "delete", post))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to delete this post.",
        });
      }

      return remove(input.id);
    }),

  getLatest: publicProcedure.query(() => getLatest()),
});

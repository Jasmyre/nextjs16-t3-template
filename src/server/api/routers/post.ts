import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createPostSchema,
  deletePostSchema,
  helloOutputSchema,
  latestPostOutputSchema,
  postIdSchema,
  postListOutputSchema,
  postOutputSchema,
  postWithAuthorOutputSchema,
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

type DateLike = Date | string;

const toIsoDateTime = (value: DateLike): string =>
  value instanceof Date ? value.toISOString() : value;

const toPostOutput = <T extends { createdAt: DateLike; updatedAt: DateLike }>(
  post: T
): Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
} => ({
  ...post,
  createdAt: toIsoDateTime(post.createdAt),
  updatedAt: toIsoDateTime(post.updatedAt),
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/api/v1/greeting",
        tags: ["posts"],
        summary: "Greet a caller by name",
        protect: false,
      },
    })
    .input(z.object({ text: z.string() }))
    .output(helloOutputSchema)
    .query(({ input }) => ({
      greeting: greet(input.text),
    })),

  create: permissionProcedure("Post", "create")
    .meta({
      openapi: {
        method: "POST",
        path: "/api/v1/posts",
        tags: ["posts"],
        summary: "Create a post",
        protect: true,
      },
    })
    .input(createPostSchema)
    .output(postOutputSchema)
    .mutation(async ({ ctx, input }) =>
      toPostOutput(await create(input.name, ctx.user.id))
    ),

  list: permissionProcedure("Post", "view")
    .meta({
      openapi: {
        method: "GET",
        path: "/api/v1/posts",
        tags: ["posts"],
        summary: "List posts visible to the caller",
        protect: true,
      },
    })
    .output(postListOutputSchema)
    .query(async ({ ctx }) =>
      (await list(ctx.user)).map((post) => toPostOutput(post))
    ),

  getById: permissionProcedure("Post", "view")
    .meta({
      openapi: {
        method: "GET",
        path: "/api/v1/posts/{id}",
        tags: ["posts"],
        summary: "Fetch a post by id",
        protect: true,
      },
    })
    .input(z.object({ id: postIdSchema }))
    .output(postWithAuthorOutputSchema)
    .query(async ({ input }) => {
      const post = await getByIdWithAuthor(input.id);

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found.",
        });
      }

      return toPostOutput(post);
    }),

  update: permissionProcedure("Post", "update")
    .meta({
      openapi: {
        method: "PATCH",
        path: "/api/v1/posts/{id}",
        tags: ["posts"],
        summary: "Rename a post",
        protect: true,
      },
    })
    .input(updatePostSchema)
    .output(postOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await getById(input.id);

      if (!(post && hasPermission(ctx.user, "Post", "update", post))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this post.",
        });
      }

      return toPostOutput(await update(input.id, input.name));
    }),

  delete: permissionProcedure("Post", "delete")
    .meta({
      openapi: {
        method: "DELETE",
        path: "/api/v1/posts/{id}",
        tags: ["posts"],
        summary: "Delete a post",
        protect: true,
      },
    })
    .input(deletePostSchema)
    .output(postOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await getById(input.id);

      if (!(post && hasPermission(ctx.user, "Post", "delete", post))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to delete this post.",
        });
      }

      return toPostOutput(await remove(input.id));
    }),

  getLatest: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/api/v1/posts/latest",
        tags: ["posts"],
        summary: "Fetch the latest post",
        protect: false,
      },
    })
    .output(latestPostOutputSchema)
    .query(async () => {
      const post = await getLatest();
      return post ? toPostOutput(post) : null;
    }),
});

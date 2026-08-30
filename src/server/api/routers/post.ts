import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { create, getLatest, greet } from "@/services/post-service";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => ({
      greeting: greet(input.text),
    })),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ input }) => create(input.name)),

  getLatest: publicProcedure.query(() => getLatest()),
});

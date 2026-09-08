import { createTokenSchema, revokeTokenSchema } from "@/schemas/token-schema";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { createToken, listTokens, revokeToken } from "@/services/token-service";

export const tokenRouter = createTRPCRouter({
  create: privateProcedure.input(createTokenSchema).mutation(({ ctx, input }) =>
    createToken({
      userId: ctx.user.id,
      name: input.name,
      expiresAt: input.expiresAt ?? null,
    })
  ),

  list: privateProcedure.query(({ ctx }) => listTokens(ctx.user.id)),

  revoke: privateProcedure
    .input(revokeTokenSchema)
    .mutation(({ ctx, input }) =>
      revokeToken({ userId: ctx.user.id, tokenId: input.tokenId })
    ),
});

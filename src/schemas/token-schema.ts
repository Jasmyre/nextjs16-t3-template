import { z } from "zod";

export const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: z.coerce.date().optional(),
});

export const revokeTokenSchema = z.object({
  tokenId: z.string().min(1),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type RevokeTokenInput = z.infer<typeof revokeTokenSchema>;

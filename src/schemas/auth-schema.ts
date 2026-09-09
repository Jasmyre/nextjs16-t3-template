import { z } from "zod";

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const SignUpSchema = z.object({
  name: z.string().min(6).max(32),
  email: z.email(),
  password: z.string().min(6),
});

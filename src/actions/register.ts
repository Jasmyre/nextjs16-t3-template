"use server";

import type * as z from "zod";

import { registerSchema } from "@/schemas/auth-schema";
import { registerUser } from "@/services/auth-service";

export const register = async (values: z.infer<typeof registerSchema>) => {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, email, password } = validatedFields.data as z.infer<
    typeof registerSchema
  >;

  const result = await registerUser({ name, email, password });

  if (!result.ok) {
    return { error: "User already exist!" };
  }

  // TODO: Send verification email

  return { success: "User created!" };
};

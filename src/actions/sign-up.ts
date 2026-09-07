"use server";

import type * as z from "zod";

import { SignUpSchema } from "@/schemas/auth-schema";
import { registerUser } from "@/services/auth-service";

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const result = await registerUser({ name, email, password });

    if (!result.ok) {
      switch (result.code) {
        case "EMAIL_IN_USE":
          return { error: "User already exists!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    // TODO: Send verification email

    return { success: "User created!" };
  } catch {
    return { error: "Something went wrong!" };
  }
};

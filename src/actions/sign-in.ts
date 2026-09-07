"use server";

import { AuthError } from "next-auth";
import type * as z from "zod";
import { signIn as authSignIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { SignInSchema } from "@/schemas/auth-schema";

export const signIn = async (
  values: z.infer<typeof SignInSchema>
): Promise<
  | {
      error: string;
      success?: undefined;
      resetValues?: () => void;
    }
  | {
      success: string;
      error?: undefined;
    }
> => {
  const validatedFields = SignInSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    await authSignIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }

  return { success: "Email sent!" };
};

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type * as z from "zod";
import { LogInSchema } from "@/schemas/auth-schema";
import { verifyCredentials } from "@/services/auth-service";
import { env } from "./env";

export const runtime = "nodejs";

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LogInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data as z.infer<
            typeof LogInSchema
          >;

          const user = await verifyCredentials(email, password);

          if (user) {
            return user;
          }
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

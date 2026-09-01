import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { getUserById, updateEmailVerification } from "@/data/user-repository";
import { db } from "@/server/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      if (!user.id) {
        return;
      }

      await updateEmailVerification(user.id);
    },
  },
  callbacks: {
    redirect({ baseUrl }) {
      return baseUrl;
    },
    session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      session.user.roles = token.roles ?? [];
      session.user.emailVerified = token.emailVerified as Date;

      if (token.userName && session.user) {
        session.user.userName = token.userName as string;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) {
        return token;
      }

      const existingUser = await getUserById(token.sub);

      if (!existingUser) {
        return token;
      }

      token.roles = existingUser.roles.map((role) => role.name);
      token.emailVerified = existingUser.emailVerified;
      token.userName = existingUser.userName;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});

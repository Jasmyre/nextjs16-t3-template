// src/types/next-auth.d.ts

import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      emailVerified: Date;
      role?: UserRole;
      userName: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    emailVerified: Date | null;
    role?: UserRole;
    userName: string | null;
  }
}

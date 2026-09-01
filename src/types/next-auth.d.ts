// src/types/next-auth.d.ts

import type { RoleName } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      emailVerified: Date;
      roles: RoleName[];
      userName: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    emailVerified: Date | null;
    roles?: RoleName[];
    userName: string | null;
  }
}

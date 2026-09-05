import type { NextAuthConfig } from "next-auth";

import {
  assignDefaultRole,
  updateEmailVerification,
} from "@/data/user-repository";

export const authEvents = {
  async linkAccount({ user }: { user: { id?: string | null } }) {
    if (!user.id) {
      return;
    }

    await updateEmailVerification(user.id);
  },
  async createUser({ user }: { user: { id?: string | null } }) {
    if (!user.id) {
      return;
    }

    await assignDefaultRole(user.id);
  },
} satisfies NonNullable<NextAuthConfig["events"]>;

import type { NextAuthConfig } from "next-auth";

import {
  assignDefaultRole,
  updateEmailVerification,
} from "@/data/user-repository";
import { ADMIN_USERS_TAG, DASHBOARD_STATS_TAG } from "@/lib/cache-tags";
import { revalidateCacheTag } from "@/lib/db-cache";

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
    revalidateCacheTag(ADMIN_USERS_TAG);
    revalidateCacheTag(DASHBOARD_STATS_TAG);
  },
} satisfies NonNullable<NextAuthConfig["events"]>;

import { PrismaAdapter } from "@auth/prisma-adapter";
import { describe, expect, it } from "vitest";
import { authEvents } from "@/auth-events";
import { getUserById } from "@/data/user-repository";
import { db } from "@/server/db";
import { integrationEnabled } from "./setup";

const describeDb = integrationEnabled ? describe : describe.skip;

describeDb("auth events integration", () => {
  it("assigns the USER role when a new OAuth user is created", async () => {
    const adapter = PrismaAdapter(db);
    if (!(adapter.createUser && authEvents.createUser)) {
      throw new Error("expected createUser to be wired");
    }

    const user = await adapter.createUser({
      id: "oauth-user-id",
      name: "OAuth User",
      email: "oauth-user@example.com",
      emailVerified: new Date(),
    });

    await authEvents.createUser({ user });

    const stored = await getUserById(user.id);
    expect(stored).not.toBeNull();
    if (stored) {
      expect(stored.roles.map((role) => role.name)).toEqual(["USER"]);
    }
  });
});

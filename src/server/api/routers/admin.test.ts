import type { RoleName } from "@prisma/client";
import { revalidateTag } from "next/cache";
import type { Session } from "next-auth";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_USERS_TAG, USERS_BY_ID_TAG } from "@/lib/cache-tags";
import { STALE_WHILE_REVALIDATE_PROFILE } from "@/lib/db-cache";
import { createCaller } from "@/server/api/root";

const { listUsersMock, updateRolesMock } = vi.hoisted(() => ({
  listUsersMock: vi.fn(),
  updateRolesMock: vi.fn(),
}));

vi.mock("@/services/admin-service", () => ({
  listUsers: listUsersMock,
  updateRoles: updateRolesMock,
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

const makeUser = (id: string, roles: RoleName[]): Session["user"] => ({
  id,
  roles,
  userName: `user-${id}`,
  emailVerified: new Date(),
});

const mockedUser = {
  id: "user-1",
  name: "User user-1",
  email: "user-1@example.com",
  createdAt: new Date(),
  roles: [{ id: 1, name: "USER" }],
};

describe("admin router", () => {
  let caller: ReturnType<typeof createCaller>;
  let userCaller: ReturnType<typeof createCaller>;
  let moderatorCaller: ReturnType<typeof createCaller>;
  let adminCaller: ReturnType<typeof createCaller>;

  beforeAll(() => {
    vi.stubEnv("NODE_ENV", "production");
    caller = createCaller({ headers: new Headers(), user: null });
    userCaller = createCaller({
      headers: new Headers(),
      user: makeUser("user-1", ["USER"]),
    });
    moderatorCaller = createCaller({
      headers: new Headers(),
      user: makeUser("user-4", ["MODERATOR"]),
    });
    adminCaller = createCaller({
      headers: new Headers(),
      user: makeUser("user-3", ["ADMIN"]),
    });
  });

  beforeEach(() => {
    listUsersMock.mockReset();
    updateRolesMock.mockReset();
    vi.mocked(revalidateTag).mockClear();
  });

  describe("listUsers", () => {
    it("returns all users for an admin", async () => {
      listUsersMock.mockResolvedValue([mockedUser]);
      const result = await adminCaller.admin.listUsers();
      expect(result).toEqual([mockedUser]);
      expect(listUsersMock).toHaveBeenCalledOnce();
    });

    it("rejects an unauthenticated caller", async () => {
      await expect(caller.admin.listUsers()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(listUsersMock).not.toHaveBeenCalled();
    });

    it("rejects a non-admin USER", async () => {
      await expect(userCaller.admin.listUsers()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(listUsersMock).not.toHaveBeenCalled();
    });

    it("rejects a MODERATOR", async () => {
      await expect(moderatorCaller.admin.listUsers()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(listUsersMock).not.toHaveBeenCalled();
    });
  });

  describe("updateRoles", () => {
    it("updates a target user's roles for an admin", async () => {
      const updated = { ...mockedUser, roles: [{ id: 2, name: "MODERATOR" }] };
      updateRolesMock.mockResolvedValue(updated);

      const result = await adminCaller.admin.updateRoles({
        userId: "user-1",
        roleNames: ["MODERATOR"],
      });

      expect(result).toEqual(updated);
      expect(updateRolesMock).toHaveBeenCalledWith({
        callerId: "user-3",
        callerRoles: ["ADMIN"],
        userId: "user-1",
        roleNames: ["MODERATOR"],
      });
    });

    it("rejects an unauthenticated caller", async () => {
      await expect(
        caller.admin.updateRoles({ userId: "user-1", roleNames: ["ADMIN"] })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(updateRolesMock).not.toHaveBeenCalled();
    });

    it("rejects a non-admin USER", async () => {
      await expect(
        userCaller.admin.updateRoles({ userId: "user-1", roleNames: ["ADMIN"] })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(updateRolesMock).not.toHaveBeenCalled();
    });

    it("rejects a MODERATOR", async () => {
      await expect(
        moderatorCaller.admin.updateRoles({
          userId: "user-1",
          roleNames: ["ADMIN"],
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(updateRolesMock).not.toHaveBeenCalled();
    });

    it("rejects an invalid role name", async () => {
      await expect(
        adminCaller.admin.updateRoles({
          userId: "user-1",
          // @ts-expect-error - testing invalid input shape
          roleNames: ["ROOT"],
        })
      ).rejects.toBeInstanceOf(Error);
      expect(updateRolesMock).not.toHaveBeenCalled();
    });

    it("rejects an empty roleNames array", async () => {
      await expect(
        adminCaller.admin.updateRoles({ userId: "user-1", roleNames: [] })
      ).rejects.toBeInstanceOf(Error);
      expect(updateRolesMock).not.toHaveBeenCalled();
    });
  });

  describe("cache invalidation", () => {
    it("revalidates the admin user list and session lookups on updateRoles", async () => {
      const updated = { ...mockedUser, roles: [{ id: 2, name: "MODERATOR" }] };
      updateRolesMock.mockResolvedValue(updated);

      await adminCaller.admin.updateRoles({
        userId: "user-1",
        roleNames: ["MODERATOR"],
      });

      expect(revalidateTag).toHaveBeenCalledWith(
        ADMIN_USERS_TAG,
        STALE_WHILE_REVALIDATE_PROFILE
      );
      expect(revalidateTag).toHaveBeenCalledWith(
        USERS_BY_ID_TAG,
        STALE_WHILE_REVALIDATE_PROFILE
      );
    });

    it("skips invalidation when a non-admin is rejected", async () => {
      await expect(
        userCaller.admin.updateRoles({ userId: "user-1", roleNames: ["ADMIN"] })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(revalidateTag).not.toHaveBeenCalled();
    });
  });
});

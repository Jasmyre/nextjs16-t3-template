import type { RoleName } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAllUsersMock, updateUserRolesMock } = vi.hoisted(() => ({
  getAllUsersMock: vi.fn(),
  updateUserRolesMock: vi.fn(),
}));

vi.mock("@/data/user-repository", () => ({
  getAllUsers: getAllUsersMock,
  updateUserRoles: updateUserRolesMock,
}));

import { listUsers, updateRoles } from "@/services/admin-service";

const user = (id: string, roles: RoleName[]) => ({
  id,
  name: `User ${id}`,
  email: `${id}@example.com`,
  createdAt: new Date("2026-01-01"),
  roles: roles.map((name) => ({ id: 1, name })),
});

describe("admin service", () => {
  beforeEach(() => {
    getAllUsersMock.mockReset();
    updateUserRolesMock.mockReset();
  });

  describe("listUsers", () => {
    it("delegates to the repository returning all users", async () => {
      const users = [user("user-1", ["USER"])];
      getAllUsersMock.mockResolvedValue(users);
      await expect(listUsers()).resolves.toEqual(users);
      expect(getAllUsersMock).toHaveBeenCalledOnce();
    });
  });

  describe("updateRoles", () => {
    it("persists role changes for a target user", async () => {
      const updated = user("target-1", ["MODERATOR"]);
      updateUserRolesMock.mockResolvedValue(updated);

      const result = await updateRoles({
        callerId: "admin-1",
        callerRoles: ["ADMIN"],
        userId: "target-1",
        roleNames: ["MODERATOR"],
      });

      expect(result).toEqual(updated);
      expect(updateUserRolesMock).toHaveBeenCalledWith("target-1", [
        "MODERATOR",
      ]);
    });

    it("rejects removing the caller's own ADMIN role", async () => {
      await expect(
        updateRoles({
          callerId: "admin-1",
          callerRoles: ["ADMIN"],
          userId: "admin-1",
          roleNames: ["USER"],
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });

      expect(updateUserRolesMock).not.toHaveBeenCalled();
    });

    it("lets an admin demote another admin to USER", async () => {
      const updated = user("admin-2", ["USER"]);
      updateUserRolesMock.mockResolvedValue(updated);

      await expect(
        updateRoles({
          callerId: "admin-1",
          callerRoles: ["ADMIN"],
          userId: "admin-2",
          roleNames: ["USER"],
        })
      ).resolves.toEqual(updated);
    });

    it("allows a non-admin user to change their own roles", async () => {
      const updated = user("user-1", ["MODERATOR"]);
      updateUserRolesMock.mockResolvedValue(updated);

      await expect(
        updateRoles({
          callerId: "user-1",
          callerRoles: ["USER"],
          userId: "user-1",
          roleNames: ["MODERATOR"],
        })
      ).resolves.toEqual(updated);
    });
  });
});

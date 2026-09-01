import type { RoleName } from "@prisma/client";
import { describe, expect, it } from "vitest";
import type { PermissionUser } from "@/server/permissions";
import { hasActionGrant, hasPermission } from "@/server/permissions";

const user = (id: string, ...roles: RoleName[]): PermissionUser => ({
  id,
  roles,
});

const owner = user("user-1", "USER");
const other = user("user-2", "USER");
const admin = user("user-3", "ADMIN");
const moderator = user("user-4", "MODERATOR");
const adminAndUser = user("user-5", "ADMIN", "USER");

const ownPost = { authorId: "user-1" };
const otherPost = { authorId: "user-2" };

describe("hasPermission", () => {
  describe("unconditional boolean grants", () => {
    it("grants view to any user role without data", () => {
      expect(hasPermission(owner, "Post", "view")).toBe(true);
    });

    it("grants create to any user role", () => {
      expect(hasPermission(owner, "Post", "create")).toBe(true);
    });

    it("denies when the user holds no roles", () => {
      expect(hasPermission({ id: "user-0", roles: [] }, "Post", "view")).toBe(
        false
      );
    });
  });

  describe("ownership predicates", () => {
    it("lets an owner update their own post", () => {
      expect(hasPermission(owner, "Post", "update", ownPost)).toBe(true);
    });

    it("lets an owner delete their own post", () => {
      expect(hasPermission(owner, "Post", "delete", ownPost)).toBe(true);
    });

    it("forbids a non-owner from updating another user's post", () => {
      expect(hasPermission(other, "Post", "update", ownPost)).toBe(false);
    });

    it("forbids a non-owner from deleting another user's post", () => {
      expect(hasPermission(other, "Post", "delete", ownPost)).toBe(false);
    });

    it("does not grant a predicate when no row data is provided", () => {
      expect(hasPermission(owner, "Post", "update")).toBe(false);
    });
  });

  describe("admin role", () => {
    it("overrides ownership for update", () => {
      expect(hasPermission(admin, "Post", "update", otherPost)).toBe(true);
    });

    it("overrides ownership for delete", () => {
      expect(hasPermission(admin, "Post", "delete", otherPost)).toBe(true);
    });

    it("is granted even without row data", () => {
      expect(hasPermission(admin, "Post", "delete")).toBe(true);
    });
  });

  describe("moderator role", () => {
    it("updates any post regardless of ownership", () => {
      expect(hasPermission(moderator, "Post", "update", otherPost)).toBe(true);
    });

    it("deletes only its own posts", () => {
      expect(hasPermission(moderator, "Post", "delete", otherPost)).toBe(false);
      expect(
        hasPermission(moderator, "Post", "delete", { authorId: "user-4" })
      ).toBe(true);
    });
  });

  describe("multi-role union", () => {
    it("grants when any held role grants the action", () => {
      expect(hasPermission(adminAndUser, "Post", "delete", otherPost)).toBe(
        true
      );
    });
  });

  describe("hasActionGrant", () => {
    it("grants a user precheck for an ownership-predicated action", () => {
      expect(hasActionGrant(owner, "Post", "update")).toBe(true);
    });

    it("denies the precheck when no held role grants the action", () => {
      expect(
        hasActionGrant({ id: "user-0", roles: [] }, "Post", "update")
      ).toBe(false);
    });

    it("grants the precheck through any held role", () => {
      expect(hasActionGrant(admin, "Post", "delete")).toBe(true);
      expect(
        hasActionGrant(user("user-9", "MODERATOR"), "Post", "delete")
      ).toBe(true);
    });
  });
});

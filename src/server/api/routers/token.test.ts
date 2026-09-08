import type { RoleName } from "@prisma/client";
import type { Session } from "next-auth";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createCaller } from "@/server/api/root";

const { createTokenMock, listTokensMock, revokeTokenMock } = vi.hoisted(() => ({
  createTokenMock: vi.fn(),
  listTokensMock: vi.fn(),
  revokeTokenMock: vi.fn(),
}));

vi.mock("@/services/token-service", () => ({
  createToken: createTokenMock,
  listTokens: listTokensMock,
  revokeToken: revokeTokenMock,
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

const createdToken = {
  id: "tok-1",
  name: "scripts",
  prefix: "a1b2c3d4",
  token: `pat_a1b2c3d4_${"ab".repeat(24)}`,
  expiresAt: null,
  revokedAt: null,
  createdAt: new Date("2026-09-08T00:00:00Z"),
};

const listedToken = {
  id: "tok-1",
  name: "scripts",
  prefix: "a1b2c3d4",
  expiresAt: null,
  revokedAt: null,
  createdAt: new Date("2026-09-08T00:00:00Z"),
};

describe("token router", () => {
  let caller: ReturnType<typeof createCaller>;
  let authedCaller: ReturnType<typeof createCaller>;

  beforeAll(() => {
    vi.stubEnv("NODE_ENV", "production");
    caller = createCaller({ headers: new Headers(), user: null });
    authedCaller = createCaller({
      headers: new Headers(),
      user: makeUser("user-1", ["USER"]),
    });
  });

  beforeEach(() => {
    createTokenMock.mockReset();
    listTokensMock.mockReset();
    revokeTokenMock.mockReset();
  });

  describe("create", () => {
    it("creates a named token and reveals the secret once", async () => {
      createTokenMock.mockResolvedValue(createdToken);

      const result = await authedCaller.token.create({ name: "scripts" });

      expect(result).toEqual(createdToken);
      expect(result.token).toContain(createdToken.prefix);
      expect(createTokenMock).toHaveBeenCalledWith({
        userId: "user-1",
        name: "scripts",
        expiresAt: null,
      });
    });

    it("rejects an unauthenticated create", async () => {
      await expect(
        caller.token.create({ name: "scripts" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(createTokenMock).not.toHaveBeenCalled();
    });

    it("rejects an empty name without touching the service", async () => {
      await expect(
        authedCaller.token.create({ name: "" })
      ).rejects.toBeInstanceOf(Error);
      expect(createTokenMock).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("lists the caller's tokens without secrets", async () => {
      listTokensMock.mockResolvedValue([listedToken]);

      const result = await authedCaller.token.list();

      expect(result).toEqual([listedToken]);
      expect(result[0]).not.toHaveProperty("token");
      expect(result[0]).not.toHaveProperty("tokenHash");
      expect(listTokensMock).toHaveBeenCalledWith("user-1");
    });

    it("rejects an unauthenticated list", async () => {
      await expect(caller.token.list()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(listTokensMock).not.toHaveBeenCalled();
    });
  });

  describe("revoke", () => {
    it("revokes an owned token", async () => {
      const revoked = { ...listedToken, revokedAt: new Date() };
      revokeTokenMock.mockResolvedValue(revoked);

      const result = await authedCaller.token.revoke({ tokenId: "tok-1" });

      expect(result).toEqual(revoked);
      expect(revokeTokenMock).toHaveBeenCalledWith({
        userId: "user-1",
        tokenId: "tok-1",
      });
    });

    it("rejects an unauthenticated revoke", async () => {
      await expect(
        caller.token.revoke({ tokenId: "tok-1" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(revokeTokenMock).not.toHaveBeenCalled();
    });
  });
});

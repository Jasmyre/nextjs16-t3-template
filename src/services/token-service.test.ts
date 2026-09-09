import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createTokenRecordMock,
  listTokenRecordsByUserMock,
  getTokenRecordByPrefixMock,
  getTokenRecordByIdMock,
  revokeTokenRecordMock,
  getUserByIdMock,
} = vi.hoisted(() => ({
  createTokenRecordMock: vi.fn(),
  listTokenRecordsByUserMock: vi.fn(),
  getTokenRecordByPrefixMock: vi.fn(),
  getTokenRecordByIdMock: vi.fn(),
  revokeTokenRecordMock: vi.fn(),
  getUserByIdMock: vi.fn(),
}));

vi.mock("@/data/token-repository", () => ({
  createTokenRecord: createTokenRecordMock,
  listTokenRecordsByUser: listTokenRecordsByUserMock,
  getTokenRecordByPrefix: getTokenRecordByPrefixMock,
  getTokenRecordById: getTokenRecordByIdMock,
  revokeTokenRecord: revokeTokenRecordMock,
}));

vi.mock("@/data/user-repository", () => ({
  getUserById: getUserByIdMock,
}));

import {
  createToken,
  listTokens,
  revokeToken,
  verifyToken,
} from "@/services/token-service";

const TOKEN_PATTERN = /^pat_[0-9a-f]{8}_[0-9a-f]{48}$/;

const user = {
  id: "user-1",
  name: "User user-1",
  roles: [{ id: 1, name: "USER" as const }],
};

const record = (
  overrides: Record<string, unknown> = {},
  tokenHash?: string
) => ({
  id: "tok-1",
  userId: "user-1",
  name: "scripts",
  prefix: "a1b2c3d4",
  tokenHash: tokenHash ?? "$2b$04$placeholder-hash-value-for-fixture",
  expiresAt: null,
  revokedAt: null,
  createdAt: new Date("2026-09-08T00:00:00Z"),
  ...overrides,
});

describe("token service", () => {
  beforeEach(() => {
    createTokenRecordMock.mockReset();
    listTokenRecordsByUserMock.mockReset();
    getTokenRecordByPrefixMock.mockReset();
    getTokenRecordByIdMock.mockReset();
    revokeTokenRecordMock.mockReset();
    getUserByIdMock.mockReset();
  });

  describe("createToken", () => {
    it("reveals the plaintext secret once and persists only its hash", async () => {
      createTokenRecordMock.mockImplementation((data: { id?: string }) => ({
        ...record(),
        ...data,
        id: "tok-1",
      }));

      const result = await createToken({ userId: "user-1", name: "scripts" });

      expect(result.token).toMatch(TOKEN_PATTERN);
      expect(result.prefix).toHaveLength(8);
      expect(result.token).toContain(result.prefix);
      expect(result.name).toBe("scripts");
      expect(result).not.toHaveProperty("tokenHash");

      const persisted = createTokenRecordMock.mock.calls[0]?.[0] as {
        tokenHash: string;
        prefix: string;
      };
      expect(persisted.tokenHash).not.toBe(result.token);
      expect(persisted.prefix).toBe(result.prefix);
      await expect(
        bcrypt.compare(result.token, persisted.tokenHash)
      ).resolves.toBe(true);
    });

    it("persists the requested expiry", async () => {
      const expiresAt = new Date("2027-01-01T00:00:00Z");
      createTokenRecordMock.mockImplementation(
        (data: Record<string, unknown>) => ({ ...record(), ...data })
      );

      const result = await createToken({
        userId: "user-1",
        name: "ci",
        expiresAt,
      });

      expect(createTokenRecordMock).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", name: "ci", expiresAt })
      );
      expect(result.expiresAt).toEqual(expiresAt);
    });
  });

  describe("listTokens", () => {
    it("exposes prefix/name/expiry/revocation state but never secrets", async () => {
      listTokenRecordsByUserMock.mockResolvedValue([
        record(),
        record({ id: "tok-2", name: "ci", prefix: "e5f6a7b8" }),
      ]);

      const result = await listTokens("user-1");

      expect(listTokenRecordsByUserMock).toHaveBeenCalledWith("user-1");
      expect(result).toHaveLength(2);
      for (const item of result) {
        expect(item).not.toHaveProperty("tokenHash");
        expect(item).not.toHaveProperty("token");
        expect(Object.keys(item).sort()).toEqual(
          ["createdAt", "expiresAt", "id", "name", "prefix", "revokedAt"].sort()
        );
      }
    });
  });

  describe("verifyToken", () => {
    it("resolves the user for a valid token", async () => {
      const presented = `pat_a1b2c3d4_${"ab".repeat(24)}`;
      const tokenHash = await bcrypt.hash(presented, 4);
      getTokenRecordByPrefixMock.mockResolvedValue(record({}, tokenHash));
      getUserByIdMock.mockResolvedValue(user);

      const result = await verifyToken(presented);

      expect(getTokenRecordByPrefixMock).toHaveBeenCalledWith("a1b2c3d4");
      expect(result).toEqual(user);
    });

    it("rejects an unknown prefix", async () => {
      getTokenRecordByPrefixMock.mockResolvedValue(null);

      await expect(
        verifyToken(`pat_deadbeef_${"ab".repeat(24)}`)
      ).resolves.toBeNull();
      expect(getUserByIdMock).not.toHaveBeenCalled();
    });

    it("rejects a wrong secret for a known prefix", async () => {
      const real = `pat_a1b2c3d4_${"ab".repeat(24)}`;
      const tokenHash = await bcrypt.hash(real, 4);
      getTokenRecordByPrefixMock.mockResolvedValue(record({}, tokenHash));

      // Flip only the last character: every presented character must commit
      // to the stored hash (bcrypt ignores input past 72 bytes).
      const last = real.slice(-1);
      const tampered = `${real.slice(0, -1)}${last === "0" ? "1" : "0"}`;

      await expect(verifyToken(tampered)).resolves.toBeNull();
      expect(getUserByIdMock).not.toHaveBeenCalled();
    });

    it("rejects a revoked token immediately", async () => {
      const presented = `pat_a1b2c3d4_${"ab".repeat(24)}`;
      const tokenHash = await bcrypt.hash(presented, 4);
      getTokenRecordByPrefixMock.mockResolvedValue(
        record({ revokedAt: new Date("2026-09-01T00:00:00Z") }, tokenHash)
      );

      await expect(verifyToken(presented)).resolves.toBeNull();
      expect(getUserByIdMock).not.toHaveBeenCalled();
    });

    it("rejects an expired token immediately", async () => {
      const presented = `pat_a1b2c3d4_${"ab".repeat(24)}`;
      const tokenHash = await bcrypt.hash(presented, 4);
      getTokenRecordByPrefixMock.mockResolvedValue(
        record({ expiresAt: new Date("2020-01-01T00:00:00Z") }, tokenHash)
      );

      await expect(verifyToken(presented)).resolves.toBeNull();
      expect(getUserByIdMock).not.toHaveBeenCalled();
    });

    it("rejects a malformed token without a repository lookup", async () => {
      await expect(verifyToken("not-a-token")).resolves.toBeNull();
      expect(getTokenRecordByPrefixMock).not.toHaveBeenCalled();
    });
  });

  describe("revokeToken", () => {
    it("marks an owned token as revoked", async () => {
      const revokedAt = new Date("2026-09-08T00:00:00Z");
      getTokenRecordByIdMock.mockResolvedValue(record());
      revokeTokenRecordMock.mockResolvedValue(record({ revokedAt }));

      const result = await revokeToken({ userId: "user-1", tokenId: "tok-1" });

      expect(revokeTokenRecordMock).toHaveBeenCalledWith("tok-1");
      expect(result.revokedAt).toEqual(revokedAt);
      expect(result).not.toHaveProperty("tokenHash");
    });

    it("is idempotent when the token is already revoked", async () => {
      const revokedAt = new Date("2026-09-01T00:00:00Z");
      getTokenRecordByIdMock.mockResolvedValue(record({ revokedAt }));

      const result = await revokeToken({ userId: "user-1", tokenId: "tok-1" });

      expect(revokeTokenRecordMock).not.toHaveBeenCalled();
      expect(result.revokedAt).toEqual(revokedAt);
    });

    it("hides existence for a missing token", async () => {
      getTokenRecordByIdMock.mockResolvedValue(null);

      await expect(
        revokeToken({ userId: "user-1", tokenId: "tok-missing" })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(revokeTokenRecordMock).not.toHaveBeenCalled();
    });

    it("hides existence for another user's token", async () => {
      getTokenRecordByIdMock.mockResolvedValue(record({ userId: "user-2" }));

      await expect(
        revokeToken({ userId: "user-1", tokenId: "tok-1" })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(revokeTokenRecordMock).not.toHaveBeenCalled();
    });
  });
});

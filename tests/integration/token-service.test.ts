import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { registerUser } from "@/services/auth-service";
import {
  createToken,
  listTokens,
  revokeToken,
  verifyToken,
} from "@/services/token-service";
import { testDb } from "./db";
import { integrationEnabled } from "./setup";

const describeDb = integrationEnabled ? describe : describe.skip;

const TOKEN_PATTERN = /^pat_[0-9a-f]{8}_[0-9a-f]{48}$/;

const register = async (email: string): Promise<string> => {
  const registration = await registerUser({
    name: `Token ${email}`,
    email,
    password: "secret123",
  });

  if (!registration.ok) {
    throw new Error("expected registration to succeed");
  }

  return registration.userId;
};

describeDb("token-service integration", () => {
  it("round-trips the lifecycle: create, verify, list, revoke", async () => {
    const userId = await register("token-lifecycle@example.com");

    const created = await createToken({ userId, name: "scripts" });
    expect(created.token).toMatch(TOKEN_PATTERN);

    const verified = await verifyToken(created.token);
    expect(verified?.id).toBe(userId);
    expect(verified?.roles.map((role) => role.name)).toContain("USER");

    const listed = await listTokens(userId);
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({
      id: created.id,
      name: "scripts",
      prefix: created.prefix,
      revokedAt: null,
    });
    expect(listed[0]).not.toHaveProperty("tokenHash");
    expect(listed[0]).not.toHaveProperty("token");

    const revoked = await revokeToken({ userId, tokenId: created.id });
    expect(revoked.revokedAt).toBeInstanceOf(Date);

    await expect(verifyToken(created.token)).resolves.toBeNull();

    const relisted = await listTokens(userId);
    expect(relisted[0]?.revokedAt).toBeInstanceOf(Date);
  });

  it("stores only the hash and looks the record up by prefix", async () => {
    const userId = await register("token-hash@example.com");
    const created = await createToken({ userId, name: "hash-check" });

    const stored = await testDb?.personalAccessToken.findUnique({
      where: { prefix: created.prefix },
    });

    expect(stored).not.toBeNull();
    expect(stored?.tokenHash).not.toBe(created.token);
    await expect(
      bcrypt.compare(created.token, stored?.tokenHash ?? "")
    ).resolves.toBe(true);
  });

  it("fails verification for expired tokens", async () => {
    const userId = await register("token-expiry@example.com");
    const created = await createToken({
      userId,
      name: "old",
      expiresAt: new Date("2020-01-01T00:00:00Z"),
    });

    await expect(verifyToken(created.token)).resolves.toBeNull();
  });

  it("fails verification for a tampered secret", async () => {
    const userId = await register("token-tamper@example.com");
    const created = await createToken({ userId, name: "tamper" });
    const last = created.token.slice(-1);
    const tampered = `${created.token.slice(0, -1)}${last === "0" ? "1" : "0"}`;

    await expect(verifyToken(tampered)).resolves.toBeNull();
    await expect(verifyToken(created.token)).not.resolves.toBeNull();
  });

  it("refuses to revoke another user's token", async () => {
    const mine = await register("token-mine@example.com");
    const theirs = await register("token-theirs@example.com");
    const created = await createToken({ userId: theirs, name: "theirs" });

    await expect(
      revokeToken({ userId: mine, tokenId: created.id })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(verifyToken(created.token)).not.resolves.toBeNull();
  });
});

import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, verifyTokenMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  verifyTokenMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/services/token-service", () => ({
  verifyToken: verifyTokenMock,
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

import {
  createRestContext,
  extractBearerToken,
  resolveRestUser,
} from "@/server/api/rest-auth";

const headersWith = (authorization?: string): Headers => {
  const headers = new Headers();
  if (authorization !== undefined) {
    headers.set("authorization", authorization);
  }
  return headers;
};

const tokenUser = {
  id: "user-1",
  name: "Token User",
  email: "token@example.com",
  image: null,
  emailVerified: new Date("2026-01-01T00:00:00.000Z"),
  userName: "tokenuser",
  roles: [{ id: 3, name: "USER" as const }],
};

const sessionUser = {
  id: "user-2",
  roles: ["ADMIN" as const],
  userName: "session-user",
  emailVerified: new Date("2026-02-01T00:00:00.000Z"),
} as Session["user"];

describe("extractBearerToken", () => {
  it("returns the token for a Bearer authorization header", () => {
    expect(
      extractBearerToken(headersWith("Bearer pat_abcdef12_secret"))
    ).toBe("pat_abcdef12_secret");
  });

  it("matches the scheme case-insensitively", () => {
    expect(extractBearerToken(headersWith("bearer abc123"))).toBe("abc123");
  });

  it("returns null when the header is missing", () => {
    expect(extractBearerToken(headersWith())).toBeNull();
  });

  it("returns null for a non-Bearer scheme", () => {
    expect(extractBearerToken(headersWith("Basic abc123"))).toBeNull();
  });

  it("returns null when the token is empty", () => {
    expect(extractBearerToken(headersWith("Bearer "))).toBeNull();
    expect(extractBearerToken(headersWith("Bearer"))).toBeNull();
  });
});

describe("resolveRestUser", () => {
  beforeEach(() => {
    authMock.mockReset();
    verifyTokenMock.mockReset();
  });

  it("resolves the token identity when the Bearer token is valid", async () => {
    verifyTokenMock.mockResolvedValue(tokenUser);
    authMock.mockResolvedValue({ user: sessionUser });

    const user = await resolveRestUser(headersWith("Bearer valid-token"));

    expect(verifyTokenMock).toHaveBeenCalledWith("valid-token");
    expect(user).toMatchObject({ id: "user-1", roles: ["USER"] });
    // Bearer wins over the cookie session without consulting it further.
    expect(authMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid Bearer token with 401 instead of cookie fallback", async () => {
    verifyTokenMock.mockResolvedValue(null);
    authMock.mockResolvedValue({ user: sessionUser });

    const user = await resolveRestUser(headersWith("Bearer bad-token"));

    expect(verifyTokenMock).toHaveBeenCalledWith("bad-token");
    expect(authMock).not.toHaveBeenCalled();
    expect(user).toBeNull();
  });

  it("rejects a throwing verifier without consulting the cookie session", async () => {
    verifyTokenMock.mockRejectedValue(new Error("db down"));
    authMock.mockResolvedValue({ user: sessionUser });

    await expect(
      resolveRestUser(headersWith("Bearer bad-token"))
    ).resolves.toBeNull();
    expect(authMock).not.toHaveBeenCalled();
  });

  it("uses the cookie session when no Bearer token is present", async () => {
    authMock.mockResolvedValue({ user: sessionUser });

    const user = await resolveRestUser(headersWith());

    expect(verifyTokenMock).not.toHaveBeenCalled();
    expect(user).toMatchObject({ id: "user-2" });
  });

  it("returns null when signed out entirely", async () => {
    authMock.mockResolvedValue(null);

    await expect(resolveRestUser(headersWith())).resolves.toBeNull();
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });
});

describe("createRestContext", () => {
  beforeEach(() => {
    authMock.mockReset();
    verifyTokenMock.mockReset();
  });

  it("threads headers through and resolves the user", async () => {
    authMock.mockResolvedValue({ user: sessionUser });
    const headers = headersWith();

    const ctx = await createRestContext({ headers });

    expect(ctx.headers).toBe(headers);
    expect(ctx.user).toMatchObject({ id: "user-2" });
  });
});

import type { RoleName } from "@prisma/client";
import type { Session } from "next-auth";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createCaller } from "@/server/api/root";

const { getStatsMock } = vi.hoisted(() => ({
  getStatsMock: vi.fn(),
}));

vi.mock("@/services/dashboard-service", () => ({
  getStats: getStatsMock,
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

describe("dashboard router", () => {
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
    getStatsMock.mockReset();
  });

  it("rejects an unauthenticated getStats call", async () => {
    await expect(caller.dashboard.getStats()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(getStatsMock).not.toHaveBeenCalled();
  });

  it("returns the aggregate counts for an authenticated user", async () => {
    const stats = {
      totalUsers: 3,
      totalPosts: 5,
      myPosts: 2,
    } as const;
    getStatsMock.mockResolvedValue(stats);

    const result = await authedCaller.dashboard.getStats();
    expect(result).toEqual(stats);
    expect(getStatsMock).toHaveBeenCalledWith("user-1");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStats } from "@/services/dashboard-service";

const { getDashboardStatsMock } = vi.hoisted(() => ({
  getDashboardStatsMock: vi.fn(),
}));

vi.mock("@/data/dashboard-repository", () => ({
  getDashboardStats: getDashboardStatsMock,
}));

describe("dashboard-service getStats", () => {
  beforeEach(() => {
    getDashboardStatsMock.mockReset();
  });

  it("returns the repository counts for the given user", async () => {
    const counts = {
      totalUsers: 4,
      totalPosts: 9,
      myPosts: 3,
    };
    getDashboardStatsMock.mockResolvedValue(counts);

    await expect(getStats("user-1")).resolves.toEqual(counts);
    expect(getDashboardStatsMock).toHaveBeenCalledWith("user-1");
  });
});

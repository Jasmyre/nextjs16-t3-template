import { describe, expect, it } from "vitest";
import { registerUser } from "@/services/auth-service";
import { getStats } from "@/services/dashboard-service";
import { create } from "@/services/post-service";
import { integrationEnabled } from "./setup";

const describeDb = integrationEnabled ? describe : describe.skip;

describeDb("dashboard-service integration", () => {
  it("returns user, post, and per-author counts", async () => {
    const authorRegistration = await registerUser({
      name: "Dashboard Author",
      email: "dashboard-author@example.com",
      password: "secret123",
    });
    const otherRegistration = await registerUser({
      name: "Dashboard Other",
      email: "dashboard-other@example.com",
      password: "secret123",
    });

    expect(authorRegistration.ok).toBe(true);
    expect(otherRegistration.ok).toBe(true);
    if (!(authorRegistration.ok && otherRegistration.ok)) {
      return;
    }
    const author = authorRegistration.userId;
    const other = otherRegistration.userId;

    await Promise.all([
      create("author post one", author),
      create("author post two", author),
      create("other post", other),
    ]);

    const stats = await getStats(author);

    expect(stats).toEqual({
      totalUsers: 2,
      totalPosts: 3,
      myPosts: 2,
    });
  });

  it("returns zero personal posts for a user who never posted", async () => {
    const registration = await registerUser({
      name: "Empty Dashboard",
      email: "empty-dashboard@example.com",
      password: "secret123",
    });
    if (!registration.ok) {
      return;
    }

    const stats = await getStats(registration.userId);

    expect(stats).toEqual({
      totalUsers: 1,
      totalPosts: 0,
      myPosts: 0,
    });
  });
});

describe("dashboard-service getStats", () => {
  it("is a function", () => {
    expect(getStats).toBeTypeOf("function");
  });
});

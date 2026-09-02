import { describe, expect, it } from "vitest";
import {
  adminRoutes,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "@/routes";

describe("routes", () => {
  it("treats the landing and maintenance pages as public", () => {
    expect(publicRoutes).toContain("/landing");
    expect(publicRoutes).toContain("/maintenance");
    expect(publicRoutes).not.toContain("/");
  });

  it("keeps the auth routes public-facing", () => {
    expect(authRoutes).toContain("/auth");
    expect(authRoutes).toContain("/auth/error");
  });

  it("redirects signed-in traffic to the dashboard", () => {
    expect(DEFAULT_LOGIN_REDIRECT).toBe("/");
  });

  it("exposes the admin area as an admin route", () => {
    expect(adminRoutes).toEqual(["/admin"]);
  });
});

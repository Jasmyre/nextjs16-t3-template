import { describe, expect, it, vi } from "vitest";
import { createPostSchema } from "@/schemas/post-schema";
import { formatZodError } from "@/server/api/trpc";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

describe("formatZodError", () => {
  it("returns null for a non-Zod cause", () => {
    expect(formatZodError(new Error("boom"))).toBeNull();
    expect(formatZodError(undefined)).toBeNull();
  });

  it("flattens field errors from a failing schema parse", () => {
    const result = createPostSchema.safeParse({ name: "" });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(formatZodError(result.error)).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ["Too small: expected string to have >=1 characters"],
      },
    });
  });

  it("flattens top-level errors into formErrors", () => {
    const result = createPostSchema.safeParse(null);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    const flattened = formatZodError(result.error);
    expect(flattened?.fieldErrors).toEqual({});
    expect(flattened?.formErrors.length).toBeGreaterThan(0);
  });
});

import { describe, expect, it, vi } from "vitest";
import { appRouter } from "@/server/api/root";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

interface OpenApiAnnotation {
  method: string;
  path: string;
  protect: boolean;
  summary: string;
  tags: string[];
}

const openapiOf = (procedurePath: string): OpenApiAnnotation | undefined => {
  const procedures = appRouter._def.procedures as unknown as Record<
    string,
    { _def: { meta?: { openapi?: OpenApiAnnotation } } }
  >;
  const procedure = procedures[procedurePath];
  if (!procedure) {
    throw new Error(`procedure ${procedurePath} is not registered`);
  }
  return procedure._def.meta?.openapi;
};

/**
 * Pins the Operation metadata the REST mount (#30) generates the Document
 * from. Method/path/tag/summary/protection are asserted per exposed
 * Procedure; the admin surface must stay unannotated (tRPC-only).
 */
describe("openapi annotations", () => {
  const expected: Record<string, OpenApiAnnotation> = {
    "post.hello": {
      method: "GET",
      path: "/api/v1/greeting",
      tags: ["posts"],
      summary: "Greet a caller by name",
      protect: false,
    },
    "post.create": {
      method: "POST",
      path: "/api/v1/posts",
      tags: ["posts"],
      summary: "Create a post",
      protect: true,
    },
    "post.list": {
      method: "GET",
      path: "/api/v1/posts",
      tags: ["posts"],
      summary: "List posts visible to the caller",
      protect: true,
    },
    "post.getById": {
      method: "GET",
      path: "/api/v1/posts/{id}",
      tags: ["posts"],
      summary: "Fetch a post by id",
      protect: true,
    },
    "post.update": {
      method: "PATCH",
      path: "/api/v1/posts/{id}",
      tags: ["posts"],
      summary: "Rename a post",
      protect: true,
    },
    "post.delete": {
      method: "DELETE",
      path: "/api/v1/posts/{id}",
      tags: ["posts"],
      summary: "Delete a post",
      protect: true,
    },
    "post.getLatest": {
      method: "GET",
      path: "/api/v1/posts/latest",
      tags: ["posts"],
      summary: "Fetch the latest post",
      protect: false,
    },
    "dashboard.getStats": {
      method: "GET",
      path: "/api/v1/dashboard/stats",
      tags: ["dashboard"],
      summary: "Fetch dashboard aggregate counts",
      protect: true,
    },
  };

  for (const [procedurePath, annotation] of Object.entries(expected)) {
    it(`annotates ${procedurePath} as ${annotation.method} ${annotation.path}`, () => {
      expect(openapiOf(procedurePath)).toEqual(annotation);
    });
  }

  it("leaves the admin surface unannotated", () => {
    expect(openapiOf("admin.listUsers")).toBeUndefined();
    expect(openapiOf("admin.updateRoles")).toBeUndefined();
  });
});

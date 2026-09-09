import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

import { openApiDocument } from "@/server/api/openapi";

type PathsObject = Record<string, Record<string, { security?: unknown }>>;

const pathsOf = (): PathsObject =>
  (openApiDocument as unknown as { paths: PathsObject }).paths ?? {};

/**
 * Pins the generated Document the REST mount serves: exactly the 8
 * annotated Operations, both auth schemes declared, admin excluded.
 * Never snapshots the whole Document — only externally observable shape.
 */
describe("openApiDocument", () => {
  const expectedOperations: [string, string][] = [
    ["/api/v1/greeting", "get"],
    ["/api/v1/posts", "post"],
    ["/api/v1/posts", "get"],
    ["/api/v1/posts/{id}", "get"],
    ["/api/v1/posts/{id}", "patch"],
    ["/api/v1/posts/{id}", "delete"],
    ["/api/v1/posts/latest", "get"],
    ["/api/v1/dashboard/stats", "get"],
  ];

  it("exposes exactly the 8 annotated Operations", () => {
    const paths = pathsOf();
    const actual: [string, string][] = [];

    for (const [path, methods] of Object.entries(paths)) {
      for (const method of Object.keys(methods)) {
        actual.push([path, method]);
      }
    }

    expect(actual.sort()).toEqual(expectedOperations.sort());
  });

  it("declares both auth schemes (Bearer token and session cookie)", () => {
    const document = openApiDocument as unknown as {
      components?: {
        securitySchemes?: Record<string, unknown>;
      };
    };
    const schemes = document.components?.securitySchemes ?? {};

    expect(Object.keys(schemes).sort()).toEqual(["bearer", "cookie"]);
  });

  it("requires auth on protected Operations and none on public reads", () => {
    const paths = pathsOf();

    for (const [path, method] of expectedOperations) {
      const operation = paths[path]?.[method];
      expect(operation).toBeDefined();

      const isPublic =
        (path === "/api/v1/greeting" || path === "/api/v1/posts/latest") &&
        method === "get";

      if (isPublic) {
        expect(operation?.security ?? []).toEqual([]);
      } else {
        const security = operation?.security as
          | Record<string, unknown>[]
          | undefined;
        expect(security).toBeDefined();
        const names = (security ?? []).flatMap((entry) => Object.keys(entry));
        expect(names).toContain("bearer");
        expect(names).toContain("cookie");
      }
    }
  });

  it("keeps the admin surface out of the Document", () => {
    const serialized = JSON.stringify(pathsOf());
    expect(serialized).not.toContain("/admin");
    expect(serialized).not.toContain("listUsers");
    expect(serialized).not.toContain("updateRoles");
  });
});

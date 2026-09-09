import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

import { GET } from "@/app/api/openapi.json/route";

/**
 * Thin seam: the static Document route serves the pinned Operation count
 * and both security schemes. No full end-to-end auth flows.
 */
describe("openapi.json route", () => {
  it("serves the 8-Operation spec with both auth schemes", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const document = (await res.json()) as {
      paths: Record<string, Record<string, unknown>>;
      components?: { securitySchemes?: Record<string, unknown> };
    };

    const operationCount = Object.values(document.paths).reduce(
      (total, methods) => total + Object.keys(methods).length,
      0
    );
    expect(operationCount).toBe(8);
    expect(
      Object.keys(document.components?.securitySchemes ?? {}).sort()
    ).toEqual(["bearer", "cookie"]);

    const serialized = JSON.stringify(document.paths);
    expect(serialized).not.toContain("admin");
  });
});

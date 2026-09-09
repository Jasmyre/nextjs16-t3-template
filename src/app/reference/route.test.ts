import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/redis", () => ({
  redis: {},
}));

import { GET } from "@/app/reference/route";

/**
 * Thin UI seam: the live Reference page renders (HTML) against the real
 * contract URL. No full end-to-end auth flows.
 */
describe("reference route", () => {
  it("serves the Scalar reference UI wired to the Document route", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");

    const html = await res.text();
    expect(html).toContain("/api/openapi.json");
  });
});

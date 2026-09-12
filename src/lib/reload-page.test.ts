import { describe, expect, it, vi } from "vitest";
import { reloadPage } from "@/lib/reload-page";

describe("reloadPage", () => {
  it("retries the failed navigation with a full reload", () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { reload });
    try {
      reloadPage();
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

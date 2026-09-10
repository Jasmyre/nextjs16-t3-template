import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

// The static Card ("Edit Post" + Back link) commits regardless of whether the
// deferred form resolves for the placeholder id, so assert the visible shell
// only (plain variant). The framework can retain a hidden fallback copy in
// the DOM, hence the visible filter (robustness checklist #10).
test.describe("instant initial load: /posts/[id]/edit", () => {
  test("edit-post shell is served", async ({ page }) => {
    await instant(
      page,
      async () => {
        await page.goto("/posts/1/edit");
        await expect(
          page
            .locator('[data-testid="edit-post-shell"]')
            .filter({ visible: true })
        ).toBeVisible();
      },
      { baseURL: "http://localhost:3000" }
    );
  });
});

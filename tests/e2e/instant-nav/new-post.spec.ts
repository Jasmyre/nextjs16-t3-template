import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

// Fully static route (client form, no data fetch): plain shell assertion.
// No gating half — static content is legitimately present under the lock.
// Reached via the in-page New Post action (present on /posts for every role).
test.describe("instant nav: /posts -> /posts/new", () => {
  test("new-post shell commits under instant()", async ({ page }) => {
    await page.goto("/posts");
    const trigger = page.getByRole("link", { name: "New Post", exact: true });
    await expect(trigger).toBeVisible({ timeout: 20_000 });

    await instant(page, async () => {
      await trigger.click();
      await expect(
        page.locator('[data-testid="new-post-shell"]')
      ).toBeVisible();
    });
  });
});

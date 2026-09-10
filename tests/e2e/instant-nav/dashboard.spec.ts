import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";
import { ensureSidebarLinkVisible } from "./nav";

const SHELL_MARKER = '[data-testid="dashboard-shell"]';
const CONTENT = '[data-testid="dashboard-content"]';

// Soft navigation: click the sidebar Home link from /posts. The committed
// shell is the destination's prefetched App Shell; deferred dashboard data
// streams in after the lock releases (self-validating: gated under lock).
test.describe("instant nav: /posts -> /", () => {
  test("dashboard shell commits under instant()", async ({ page }) => {
    await page.goto("/posts");
    await ensureSidebarLinkVisible(page, "Home");

    await instant(page, async () => {
      await page.getByRole("link", { name: "Home", exact: true }).click();
      await expect(page.locator(SHELL_MARKER)).toBeVisible();
      await expect(page.locator(CONTENT)).toHaveCount(0);
    });
    await expect(page.locator(CONTENT)).toBeVisible();
  });
});

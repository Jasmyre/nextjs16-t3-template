import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";
import { ensureSidebarLinkVisible } from "./nav";

const SHELL_MARKER = '[data-testid="admin-shell"]';
const CONTENT = '[data-testid="admin-content"]';

// Soft navigation as ADMIN: the sidebar exposes the Admin entry only for the
// ADMIN role, so this spec runs in the admin-storageState project.
test.describe("instant nav: / -> /admin", () => {
  test("admin shell commits under instant()", async ({ page }) => {
    await page.goto("/");
    await ensureSidebarLinkVisible(page, "Admin");

    await instant(page, async () => {
      await page.getByRole("link", { name: "Admin", exact: true }).click();
      await expect(page.locator(SHELL_MARKER)).toBeVisible();
      await expect(page.locator(CONTENT)).toHaveCount(0);
    });
    await expect(page.locator(CONTENT)).toBeVisible();
  });
});

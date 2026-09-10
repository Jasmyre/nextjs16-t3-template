import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";
import { ensureSidebarLinkVisible } from "./nav";

const SHELL_MARKER = '[data-testid="posts-shell"]';
const CONTENT = '[data-testid="posts-content"]';

test.describe("instant nav: / -> /posts", () => {
  test("posts shell commits under instant()", async ({ page }) => {
    await page.goto("/");
    await ensureSidebarLinkVisible(page, "Posts");

    await instant(page, async () => {
      await page.getByRole("link", { name: "Posts", exact: true }).click();
      await expect(page.locator(SHELL_MARKER)).toBeVisible();
      await expect(page.locator(CONTENT)).toHaveCount(0);
    });
    await expect(page.locator(CONTENT)).toBeVisible();
  });
});

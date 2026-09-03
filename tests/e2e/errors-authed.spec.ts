import { expect, test } from "@playwright/test";

test.describe("403 page", () => {
  test("a non-admin user sees the 403 page on /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(
      page.getByText("You don't have permission to access this page")
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to Dashboard" })
    ).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("an authenticated user sees the 404 page on a non-existent route", async ({
    page,
  }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go Home" })).toBeVisible();
  });
});

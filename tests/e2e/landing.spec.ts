import { expect, test } from "@playwright/test";

test.describe("landing page (logged out)", () => {
  test("unauthenticated user lands on /landing", async ({ page }) => {
    await page.goto("/landing");
    await expect(page).toHaveURL("/landing");
    await expect(
      page.getByRole("heading", {
        name: "A production-ready foundation for your next app",
      })
    ).toBeVisible();
  });

  test("unauthenticated user visiting a protected route is redirected to /landing", async ({
    page,
  }) => {
    await page.goto("/posts");
    await expect(page).toHaveURL("/landing");
  });

  test('"Get started" navigates to /auth', async ({ page }) => {
    await page.goto("/landing");
    await page.getByRole("link", { name: "Get started" }).first().click();
    await expect(page).toHaveURL("/auth");
  });
});

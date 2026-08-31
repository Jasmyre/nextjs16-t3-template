import { expect, test } from "@playwright/test";

test.describe("authenticated flows", () => {
  test("an authenticated user can reach the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("an authenticated user sees the user menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "User menu" }).click();
    await expect(page.getByText("My Account")).toBeVisible();
  });
});

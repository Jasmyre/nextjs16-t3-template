import { expect, test } from "@playwright/test";

test.describe("authenticated flows", () => {
  test("an authenticated user can reach the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("an authenticated user sees the sidebar user menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "User menu" }).click();
    await expect(page.getByRole("menu").getByText("E2E User")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Log out" })).toBeVisible();
  });

  test("an authenticated user can sign out from the user menu", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();

    await expect(page).toHaveURL("/landing");

    await expect
      .poll(async () => {
        const cookies = await page.context().cookies();
        return cookies.some((cookie) => cookie.name.includes("session-token"));
      })
      .toBe(false);

    const response = await page.request.get("/api/auth/session");
    const session = (await response.json()) as { user?: unknown } | null;
    expect(session?.user).toBeUndefined();
  });
});

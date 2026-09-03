import { expect, test } from "@playwright/test";

test.describe("landing page redirect (authenticated)", () => {
  test("authenticated user is redirected from /landing to /", async ({
    page,
  }) => {
    await page.goto("/landing");
    await expect(page).toHaveURL("/");
  });
});

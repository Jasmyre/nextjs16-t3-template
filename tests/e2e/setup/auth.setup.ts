import { expect, test as setup } from "@playwright/test";

const uniqueEmail = `e2e-${Date.now()}@example.com`;

setup("register and sign in as an e2e user", async ({ page }) => {
  await page.goto("/auth");

  await page.getByRole("tab", { name: "Sign Up" }).click();

  await page.getByPlaceholder("Johnny Bravo").fill("E2E User");
  await page.getByPlaceholder("johndoe@example.com").fill(uniqueEmail);
  await page.getByPlaceholder("******").fill("password123");

  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByText("User created!")).toBeVisible();

  await page.getByRole("tab", { name: "Sign In" }).click();
  await page.getByPlaceholder("johndoe@example.com").fill(uniqueEmail);
  await page.getByPlaceholder("******").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/");
  await page.context().storageState({ path: "tests/e2e/.auth/user.json" });
});

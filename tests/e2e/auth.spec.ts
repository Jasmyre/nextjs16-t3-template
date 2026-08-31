import { expect, test } from "@playwright/test";

const uniqueEmail = (prefix: string): string =>
  `${prefix}-${Date.now()}@example.com`;

test.describe("auth form flows (logged out)", () => {
  test("registers a new account successfully", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("tab", { name: "Sign Up" }).click();

    await page.getByPlaceholder("Johnny Bravo").fill("E2E User");
    await page
      .getByPlaceholder("johndoe@example.com")
      .fill(uniqueEmail("register"));
    await page.getByPlaceholder("******").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByText("User created!")).toBeVisible();
  });

  test("shows an error when registering with an email already in use", async ({
    page,
  }) => {
    const email = uniqueEmail("dupe");
    await page.goto("/auth");

    await page.getByRole("tab", { name: "Sign Up" }).click();
    await page.getByPlaceholder("Johnny Bravo").fill("E2E User");
    await page.getByPlaceholder("johndoe@example.com").fill(email);
    await page.getByPlaceholder("******").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("User created!")).toBeVisible();

    await page.getByRole("tab", { name: "Sign Up" }).click();
    await page.getByPlaceholder("Johnny Bravo").fill("Another User");
    await page.getByPlaceholder("johndoe@example.com").fill(email);
    await page.getByPlaceholder("******").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByText("User already exists!")).toBeVisible();
  });

  test("shows an error when logging in with invalid credentials", async ({
    page,
  }) => {
    await page.goto("/auth");
    await page
      .getByPlaceholder("johndoe@example.com")
      .fill(uniqueEmail("login"));
    await page.getByPlaceholder("******").fill("wrong-password");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid credentials!")).toBeVisible();
  });
});

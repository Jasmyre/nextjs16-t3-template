import { expect, test as setup } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import type { RoleName } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { loadEnv } from "vite";

Object.assign(process.env, loadEnv("test", process.cwd(), ""));

const testDbUrl = process.env.DATABASE_URL_TEST;

const adminEmail = `e2e-admin-${Date.now()}@example.com`;
const targetEmail = `e2e-target-${Date.now()}@example.com`;

const adminRoles = [{ name: "ADMIN" as RoleName }];

setup(
  "register, promote, and sign in as an e2e admin user",
  async ({ page }) => {
    await page.goto("/auth");

    await page.getByRole("tab", { name: "Sign Up" }).click();
    await page.getByPlaceholder("Johnny Bravo").fill("E2E Role Target");
    await page.getByPlaceholder("johndoe@example.com").fill(targetEmail);
    await page.getByPlaceholder("******").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("User created!")).toBeVisible();

    await page.getByRole("tab", { name: "Sign Up" }).click();
    await page.getByPlaceholder("Johnny Bravo").fill("E2E Admin");
    await page.getByPlaceholder("johndoe@example.com").fill(adminEmail);
    await page.getByPlaceholder("******").fill("password123");
    await page.getByRole("button", { name: "Sign Up" }).click();
    await expect(page.getByText("User created!")).toBeVisible();

    if (!testDbUrl) {
      throw new Error("DATABASE_URL_TEST is required for the admin e2e setup");
    }

    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: testDbUrl }),
    });
    try {
      await prisma.user.update({
        data: { roles: { set: adminRoles } },
        where: { email: adminEmail },
      });
    } finally {
      await prisma.$disconnect();
    }

    await page.getByRole("tab", { name: "Sign In" }).click();
    await page.getByPlaceholder("johndoe@example.com").fill(adminEmail);
    await page.getByPlaceholder("******").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL("/");
    await page.context().storageState({ path: "tests/e2e/.auth/admin.json" });
  }
);

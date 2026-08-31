import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

const baseURL = "http://localhost:3000";

const testDatabaseUrl = loadEnv("test", process.cwd(), "").DATABASE_URL_TEST;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /setup\/auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      testMatch: /auth-authed\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-logged-out",
      testMatch: /auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    env: testDatabaseUrl
      ? { ...process.env, DATABASE_URL: testDatabaseUrl }
      : undefined,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

const baseURL = "http://localhost:3000";

const testDatabaseUrl = loadEnv("test", process.cwd(), "").DATABASE_URL_TEST;

// Production-only rig for instant-navigation guards. Never point at `next dev`:
// dev does not prefetch and its lock is unreliable, so dev verdicts are invalid.
// Build first: EXPOSE_TESTING_API=1 npm run build, then this config serves
// the artifact via `npm run start` with the test DB.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /setup\/.+\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-instant",
      testMatch: /instant-nav\/(dashboard|posts|new-post|edit-post)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-instant-mobile",
      testMatch: /instant-nav\/(dashboard|posts|new-post|edit-post)\.spec\.ts/,
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-instant-admin-mobile",
      testMatch: /instant-nav\/admin\.spec\.ts/,
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "chromium-instant-admin",
      testMatch: /instant-nav\/admin\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run start",
    url: baseURL,
    env: {
      ...process.env,
      ...(testDatabaseUrl ? { DATABASE_URL: testDatabaseUrl } : undefined),
      // `next start` (unlike `next dev`) does not trust localhost for
      // Auth.js by default; without this every `auth()` call throws
      // UntrustedHost and pages fail to load in production.
      AUTH_TRUST_HOST: "true",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

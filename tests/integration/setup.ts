import { loadEnv } from "vite";

Object.assign(process.env, loadEnv("test", process.cwd(), ""));

(process.env as Record<string, string | undefined>).NODE_ENV = "test";
process.env.SKIP_ENV_VALIDATION = "true";

const testDbUrl = process.env.DATABASE_URL_TEST;

if (testDbUrl) {
  process.env.DATABASE_URL = testDbUrl;
}

import { afterAll, beforeEach } from "vitest";

const { isIntegrationEnabled, testDb, truncateTables } = await import("./db");

export const integrationEnabled = isIntegrationEnabled;

if (testDb) {
  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await testDb.$disconnect();
  });
}

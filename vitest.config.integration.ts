import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/server-only-stub.ts", import.meta.url)
      ),
    },
  },
  test: {
    name: "integration",
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/integration/setup.ts"],
    fileParallelism: false,
    pool: "forks",
    globalSetup: ["./tests/integration/global-setup.ts"],
  },
});

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
  "server-only": fileURLToPath(
    new URL("./tests/server-only-stub.ts", import.meta.url)
  ),
};

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    coverage: {
      provider: "v8",
      include: [
        "src/components/**",
        "src/hooks/**",
        "src/server/api/routers/**",
        "src/services/**",
        "src/data/**",
        "src/schemas/**",
        "src/actions/**",
      ],
      exclude: ["src/components/ui/**"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          include: ["src/**/*.test.{ts,tsx}"],
          environmentOptions: {
            jsdom: {
              url: "http://localhost:3000",
            },
          },
          setupFiles: ["./tests/unit/setup.ts"],
        },
      },
      "./vitest.config.integration.ts",
    ],
  },
});

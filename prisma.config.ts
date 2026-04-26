import "dotenv/config";
import type { PrismaConfig } from "prisma";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "generated/migrations",
    // add seed command if you have a seed file
    // seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
}) satisfies PrismaConfig;

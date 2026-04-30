import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/client";
import { env } from "@/env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const createPrismaClient = (): PrismaClient<
  {
    log: ("error" | "query" | "warn")[];
  },
  "error" | "query" | "warn",
  DefaultArgs
> =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    adapter,
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

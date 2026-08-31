import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const testDbUrl = process.env.DATABASE_URL_TEST;

export const isIntegrationEnabled =
  Boolean(testDbUrl) && Boolean(process.env.DATABASE_URL);

const createTestClient = (): PrismaClient | null => {
  if (!testDbUrl) {
    return null;
  }
  const adapter = new PrismaPg({ connectionString: testDbUrl });
  return new PrismaClient({ log: ["error"], adapter });
};

export const testDb = createTestClient();

export async function truncateTables(): Promise<void> {
  if (!testDb) {
    return;
  }
  await testDb.$executeRawUnsafe(
    'TRUNCATE TABLE "User", "Post", "Account" RESTART IDENTITY CASCADE;'
  );
}

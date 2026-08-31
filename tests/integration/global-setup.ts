import { loadEnv } from "vite";

export default function globalSetup(): void {
  const env = loadEnv("test", process.cwd(), "");
  if (!env.DATABASE_URL_TEST) {
    console.log(
      "\n[integration] DATABASE_URL_TEST is not set. Integration tests will be skipped.\n"
    );
  }
}

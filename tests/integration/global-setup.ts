export default function globalSetup(): void {
  if (!process.env.DATABASE_URL_TEST) {
    console.log(
      "\n[integration] DATABASE_URL_TEST is not set. Integration tests will be skipped.\n"
    );
  }
}

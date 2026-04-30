/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  reactCompiler: true,
  allowedDevOrigins: ["192.168.1.28"],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
};

export default async function config(): Promise<import("next").NextConfig> {
  // Skip env validation during tests or when explicitly requested
  if (process.env.NODE_ENV !== "test" && !process.env.SKIP_ENV_VALIDATION) {
    await import("./src/env.js");
  }

  return nextConfig;
}

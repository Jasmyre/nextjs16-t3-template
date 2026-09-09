import "server-only";

import { generateOpenApiDocument } from "trpc-to-openapi";
import { appRouter } from "@/server/api/root";

/**
 * Auth schemes for the versioned REST mount. Bearer personal access tokens
 * are tried first; the session cookie is the fallback so the interactive
 * Reference UI keeps working without token setup. Both names are referenced
 * by every protected Operation's `security` entry (either satisfies).
 */
export const OPENAPI_SECURITY_SCHEMES = {
  bearer: {
    type: "http",
    scheme: "bearer",
  },
  cookie: {
    type: "apiKey",
    in: "cookie",
    name: "authjs.session-token",
  },
} as const;

/**
 * OpenAPI Document for the REST mount only. Generated once at module load
 * (build time for the static Document route) — never per request. The
 * tRPC-only admin surface stays unannotated, so it is excluded here and
 * unmounted on REST by construction.
 */
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Next.js T3 Template API",
  version: "1.0.0",
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  securitySchemes: { ...OPENAPI_SECURITY_SCHEMES },
  tags: ["posts", "dashboard"],
});

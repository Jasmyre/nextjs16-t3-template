import { ApiReference } from "@scalar/nextjs-api-reference";

export const dynamic = "force-static";

/**
 * Live Scalar Reference UI reading the real contract from
 * `/api/openapi.json`. Cookie auth keeps working for interactive use
 * (the REST mount tries Bearer first, then falls back to the session).
 */
export const GET = ApiReference({
  url: "/api/openapi.json",
});

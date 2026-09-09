import { ApiReference } from "@scalar/nextjs-api-reference";

/**
 * Live Scalar Reference UI reading the real contract from
 * `/api/openapi.json`. Cookie auth keeps working for interactive use
 * (the REST mount tries Bearer first, then falls back to the session).
 * (No request data is read, so this stays static under `cacheComponents`
 * without a segment config.)
 */
export const GET = ApiReference({
  url: "/api/openapi.json",
});

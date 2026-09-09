import { openApiDocument } from "@/server/api/openapi";

/**
 * Static OpenAPI Document route. The Document is generated once at module
 * load (build time) — never per request — and served as plain JSON for
 * generators, agents, and the live Reference UI. (No request data is read,
 * so this stays static under `cacheComponents` without a segment config.)
 */
export const GET = (): Response => Response.json(openApiDocument);

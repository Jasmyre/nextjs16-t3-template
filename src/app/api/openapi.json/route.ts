import { openApiDocument } from "@/server/api/openapi";

export const dynamic = "force-static";

/**
 * Static OpenAPI Document route. The Document is generated once at module
 * load (build time) — never per request — and served as plain JSON for
 * generators, agents, and the live Reference UI.
 */
export const GET = (): Response => Response.json(openApiDocument);

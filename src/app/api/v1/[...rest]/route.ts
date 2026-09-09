import { createOpenApiFetchHandler } from "trpc-to-openapi";
import { createRestContext } from "@/server/api/rest-auth";
import { appRouter } from "@/server/api/root";

/**
 * Versioned REST mount (v1) alongside the unchanged tRPC transport.
 * The same routers serve both: tRPC stays batched/superjson/cookie-only
 * at `/api/trpc`, while this mount speaks plain JSON with ISO datetimes
 * at `/api/v1/*`. Auth is dual (Bearer first, session-cookie fallback) via
 * `createRestContext`; permission checks run unchanged inside the routers.
 * The tRPC-only admin surface has no OpenAPI annotations, so it 404s here
 * by construction. (Request headers are read per request, so this stays
 * dynamic under `cacheComponents` without a segment config.)
 */
const handler = (req: Request) =>
  createOpenApiFetchHandler({
    endpoint: "/",
    router: appRouter,
    req,
    createContext: () => createRestContext({ headers: req.headers }),
  });

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};

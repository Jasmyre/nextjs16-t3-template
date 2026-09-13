# Architecture

Three-tier + MVC. Upper tiers never skip past the next one (routers must not touch Prisma).

```text
App Router → proxy.ts → NextAuth / tRPC → services → repositories → Postgres
```

| MVC | Tier | Location | Responsibility |
|---|---|---|---|
| View | Presentation | `src/app/**`, `src/components/**`, `src/hooks/**` | Rendering, interaction, client state |
| Controller | Request boundary | `src/server/api/routers/**`, `src/actions/**`, NextAuth callbacks | Validate input, enforce auth/ownership, call services |
| Model (business) | Business logic | `src/services/**` (`server-only`) | Domain rules, hashing, result codes |
| Model (persistence) | Data access | `src/data/**`, `src/server/db.ts` | Prisma queries only |

`src/schemas/**` (Zod) is the shared controller↔service contract. The tRPC context exposes `headers` + `user` only — no `db`, so routers cannot bypass services.

## Authorization (ABAC)

- Module: `src/server/permissions.ts` (`server-only`). Roles `ADMIN` / `MODERATOR` / `USER` (many-to-many, union of grants).
- Engine: `hasPermission(user, resource, action, data?)` (row-level; ownership predicates deny when `data` absent) + `hasActionGrant` (coarse precheck for the guard).
- Controller pattern: `permissionProcedure("Resource", "action")` → fetch record → `hasPermission(..., record)` → delegate to service. Missing records answer `FORBIDDEN` (anti-probing).
- Post matrix: admin full; moderator view/create/update any, delete own; user view/create any, update/delete own. Admin matrix: `manage` granted to `ADMIN` only.
- Session threading: `getUserById`/`getUserByEmail` include `roles`; JWT callback stamps `token.roles`; session exposes `session.user.roles`.
- Exceptions (documented, keep): `post.list` visibility scoping lives in the service (USER→own, MODERATOR/ADMIN→all); admin self-demotion (`ADMIN` removing own `ADMIN`) is a service `FORBIDDEN`.

## Routing boundary (`src/proxy.ts`, `src/routes.ts`)

- `proxy.ts` (not `middleware.ts`) runs first: maintenance gate → Auth.js routes → REST mount bypass (`/api/openapi.json`, `/api/v1/*` answer their own 401/403/404) → `/api/public/*` → landing/auth redirects → `!loggedIn && !public → /landing` (302).
- Vocabulary in `src/routes.ts`: `LANDING_PATH`, `publicRoutes` (`/landing`, `/maintenance`, `/offline`, `/reference`), `authRoutes`, `apiAuthPrefix`, `adminRoutes`, `DEFAULT_LOGIN_REDIRECT=/`, `homePathFor`.
- `config.matcher` stays an inline static string (Next parses it at build time). Static exclusions keep `/sw.js`, manifest, install assets outside the proxy — pinned by `src/proxy.test.ts`.
- `/admin` coarse gating lives in the `(admin)` layout (`AdminGate` → `forbidden()`), not the proxy (proxy has no roles). `authInterrupts: true` required.

## Route groups & PPR

- `(marketing)/`: `/landing`, `/maintenance` + slim header. `(app)/`: `/`, `/posts` + sidebar shell. `(admin)/`: `/admin` guarded shell. Root layout holds providers only.
- `cacheComponents: true` + PPR: static shells prerender; session-aware subtrees (`AppShellAsync`, `AdminShellAsync`, `HydrateClient`) sit in `<Suspense>` after `await connection()` + `await auth()`. Never call `auth()` in a layout directly.
- Fallbacks are real shells (never `null` — blank-frame on soft-nav), and error-page home links resolve via `homePathFor` with a disabled-button fallback.

## Caching

- `unstable_cache` via `cached()` (`src/lib/db-cache.ts`, 10s revalidate) on page-visit reads: post list/latest/item, dashboard stats, `getUserById`, admin list. Tags are coarse/static (`src/lib/cache-tags.ts`); any post write clears post-shaped reads, any role write clears admin + session lookups. `getUserByEmail` + raw `getPostById` + all writes stay uncached.
- Invalidation via `revalidateCacheTag(tag)` (pins Next 16.3 SWR `"max"`): post create/update/delete, `updateRoles`, sign-up (credentials + OAuth events). Runs only after successful writes.
- Client `staleTime: 10s` matches the server window; SuperJSON dehydration includes pending queries for Suspense.

## tRPC + REST

- `src/server/api/trpc.ts`: `publicProcedure` / `publicRateLimitedProcedure` (Redis 5 req/40s/IP, dev-skipped) / `privateProcedure` / `permissionProcedure(resource, action)`.
- Routers delegate to services, validate with Zod, export `AppRouter`. Server caller via `createCaller`; client via `httpBatchStreamLink` + `useSuspenseQuery`/`useMutation`.
- REST mount (`src/server/api/openapi.ts`, `src/app/api/v1/[...rest]/route.ts`): 8 annotated post/dashboard Operations with `z.strictObject` outputs, ISO datetimes, `/api/v1` prefix, one tag per router. Admin stays tRPC-only. `post.getLatest` registers before `post.getById` (path-match order). Dual auth in `rest-auth.ts` (Bearer-first, fail-closed). Document at `/api/openapi.json`, UI at `/reference`.

Full living detail: `memory-bank/systemPatterns.md`. Domain terms: `CONTEXT.md`.

# System Patterns

## Application boundaries

- Next.js App Router is the application boundary; server-first patterns are preferred.
- NextAuth v5 exports auth helpers and handlers from `src/auth.ts`; App Router exposes `GET` and `POST` through `src/app/api/auth/[...nextauth]/route.ts`.
- `src/proxy.ts` applies route protection/redirect behavior using shared route definitions in `src/routes.ts`.
- tRPC is organized as root/router/context code under `src/server/api`, with the Next.js handler under `src/app/api/trpc/[trpc]` and client/server helpers under `src/trpc`.
- Prisma access is centralized in `src/server/db.ts`; PostgreSQL is the persistence target.
- Environment validation is defined in `src/env.js`; do not document environment variables without checking that file and `.env.example`.
- Shared UI primitives live under `src/components/ui` and use shadcn-style patterns with Tailwind CSS.
- Authentication forms use Zod schemas and React Hook Form. The theme is managed with `next-themes`.

## Layered architecture (3-tier + MVC)

The application follows a three-tier architecture mapped to MVC conventions. Keep responsibilities in their tier and never let an upper tier reach past the next one (e.g. controllers must not touch Prisma directly).

| MVC | Tier | Location | Responsibility |
|---|---|---|---|
| **View** | Presentation | `src/app/**`, `src/components/**`, `src/hooks/**` | Rendering, user interaction, client state |
| **Controller** | Presentation (request boundary) | `src/server/api/routers/**` (tRPC), `src/actions/**` (Server Actions), NextAuth callbacks | Input validation, auth/ownership checks, calling services, mapping results |
| **Model (business)** | Business Logic | `src/services/**` | Domain rules, orchestration, hashing, result codes |
| **Model (persistence)** | Data Access | `src/data/**` (repositories), `src/server/db.ts` (Prisma client) | Query/persistence operations only |

Conventions:

- `src/services/**` and `src/data/**` are server-only (`import "server-only"`) and must not be imported by client components.
- Services orchestrate business rules by calling repositories; they do not import the Prisma client directly.
- Repositories own all Prisma access; they do not contain business rules.
- The tRPC context exposes `headers` and `user` only — `db` is intentionally not injected so routers cannot bypass the service layer.
- Zod schemas in `src/schemas/**` are the shared contract between controllers and the business layer.

## Runtime flow

1. Requests enter through the App Router.
2. `src/proxy.ts` applies public/auth/API route rules and redirects as needed.
3. Auth requests are handled by NextAuth; application API requests use the tRPC handler.
4. Controllers (tRPC procedures / server actions) validate input and invoke services.
5. Services apply business logic and delegate persistence to repositories.
6. Repositories query Prisma against the shared client and database schema.

Keep new features aligned with these boundaries: controllers stay thin, business rules live in `src/services`, and persisted data access lives in `src/data`.

## Component-Based Caching & Partial Prerendering (PPR)

`cacheComponents: true` in `next.config.ts` enables automatic component-level static prerendering. Pages are prerendered as static shells; only `<Suspense>` boundaries containing async/await become dynamic holes at request time.

### Static shells with dynamic holes

- Next.js prerenders the full page as a static HTML shell at build time.
- Any `<Suspense>` boundary that awaits data (tRPC queries, `connection()`, etc.) is treated as a **dynamic hole** — only that subtree renders dynamically; the rest is static.
- Keep dynamic regions as small and scoped as possible (e.g. a single widget), not entire pages.

### The `connection()` pattern

When a subtree needs request-scoped data (e.g., tRPC hydration with `Date.now()` timestamps), wrap it in a `<Suspense>` boundary and call `await connection()` from `next/server` inside. This opts only that subtree into dynamic rendering while the surrounding shell stays static. See `src/trpc/server.tsx` `HydrateClient` for the canonical example.

### React `cache()` for deduplication

Wrap factories (context creation, QueryClient creation) in `React.cache()` so multiple calls within a single RSC render share one instance. Use this for:

- tRPC context creation (`createTRPCContext`)
- QueryClient creation (`createQueryClient`)

### React Compiler

`reactCompiler: true` in `next.config.ts` enables automatic memoization via `babel-plugin-react-compiler`. Client components are memoized implicitly — manual `useMemo`/`useCallback` is unnecessary for standard cases. Only use explicit memoization when the compiler cannot infer stability (e.g., dynamically computed references).

### TanStack Query dehydration

Server-fetched queries are serialized with SuperJSON via `shouldDehydrateQuery` (including pending queries for Suspense compatibility). The client hydrates from this serialized cache. `staleTime: 30s` prevents immediate refetch after hydration.

## tRPC Patterns (v11)

### Server setup (`src/server/api/trpc.ts`)

- **Thin context**: exposes only `headers` and `user` (from NextAuth `auth()`). The `db` client is intentionally excluded — routers must go through the service layer, not Prisma directly.
- **SuperJSON transformer** + **Zod error formatter** flattens validation errors into the response.
- **Procedure types**:

| Procedure | Middleware chain | Use case |
|---|---|---|
| `publicProcedure` | `timingMiddleware` | Unauthenticated endpoints; logs timing, simulates latency in dev |
| `publicRateLimitedProcedure` | `timingMiddleware` → `publicRateLimiter` | Rate-limited public endpoints (Redis, 5 req/40s/IP, skipped in dev) |
| `privateProcedure` | `isAuthed` | Authenticated endpoints; throws `UNAUTHORIZED` if no session, narrows `ctx.user` |

### Router definitions (`src/server/api/root.ts`, `src/server/api/routers/**`)

- Routers delegate to `src/services/**` — never import Prisma directly.
- Input validation via Zod schemas (`src/schemas/**`).
- Export `AppRouter` type for end-to-end type safety.
- `createCaller` exported for server-side direct calls (used by RSC path).

### Client-side (`src/trpc/react.tsx`)

- `createTRPCReact<AppRouter>()` produces typed React hooks.
- `TRPCReactProvider` wraps the app at root layout using `httpBatchStreamLink` (streaming batches, not plain `httpBatchLink`).
- `useSuspenseQuery` for Suspense-compatible reads (destructure from tuple: `const [data] = api.post.getLatest.useSuspenseQuery()`).
- `useMutation` for writes; use `onSuccess` to invalidate cache via `api.useUtils()`.
- `api.useUtils()` for cache invalidation (e.g., `utils.post.invalidate()` invalidates all queries under a namespace).
- Singleton `QueryClient` on browser; fresh instance per render on server.

### Server-side (`src/trpc/server.tsx`)

- `createCaller` for direct in-process calls (no HTTP hop) — file is marked `server-only`.
- `createHydrationHelpers` produces RSC-compatible `api` and `HydrateClient`.
- `HydrateClient` wraps with `<Suspense>` + `connection()` for PPR compatibility (see Component-Based Caching section above).
- Context + QueryClient wrapped in `React.cache()` for request-level deduplication.

## Pattern Documentation Policy

When a **repetitive manual change** or recurring correction is identified (e.g., "use `const` instead of `let` in React components", consistent naming conventions, error handling patterns), **update this file** to codify the pattern so it is applied consistently going forward. This prevents the same correction from being repeated across sessions and serves as a living style guide.

Known patterns:

- **React components**: always use `const` for state setters and component declarations; never `let`.
- **Hooks**: call at the top level only, never conditionally. Specify all dependencies in dependency arrays.
- **Error handling**: throw `Error` objects with descriptive messages, not raw strings.
- **Async**: use `async/await` instead of promise chains. Always `await` promises in async functions.
- **Loops**: prefer `for...of` over `.forEach()` and indexed `for` loops.
- **Accessors**: use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access.
- **Variables**: use `const` by default, `let` only when reassignment is needed, never `var`.
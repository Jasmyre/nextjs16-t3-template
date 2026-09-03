# System Patterns

## Application boundaries

- Next.js 16 App Router is the application boundary; server-first patterns are preferred.
- NextAuth v5 handles authentication via `src/auth.ts`; routes are exposed through `src/app/api/auth/[...nextauth]/route.ts`.
- tRPC handles typed API endpoints; routers live under `src/server/api`, client/server helpers under `src/trpc`.
- Prisma access is centralized in `src/server/db.ts`; PostgreSQL is the persistence target.
- Environment validation is defined in `src/env.js`; do not document environment variables without checking that file and `.env.example`.
- Shared UI primitives live under `src/components/ui` and use shadcn-style patterns with Tailwind CSS.
- Authentication forms use Zod schemas and React Hook Form. The theme is managed with `next-themes`.
- Authorization is enforced at the controller tier via the permissions module (`src/server/permissions.ts`) and the `permissionProcedure` tRPC guard; services stay focused on domain rules and never evaluate permissions.

> Visibility-scoping exception (documented): for `post.list`, the coarse gate stays in the controller (`permissionProcedure("Post", "view")`), but the row-visibility decision (USER sees own; MODERATOR/ADMIN see all) lives in the service (`list(user)`), which inspects `user.roles` to choose `listAllPosts()` vs `listPostsByAuthor(user.id)`. This is a list-scope rule with no single row to test in `hasPermission`, so it's treated as a domain visibility rule rather than a row-level grant. The permission module's `view` action remains a role grant only.
>
> Self-demotion exception (documented): on `admin.updateRoles` the coarse gate (`permissionProcedure("Admin", "manage")`) admits only ADMINS, but the rule that an ADMIN cannot remove their **own** ADMIN role is a business rule that lives in the service (`updateRoles`), which throws `FORBIDDEN` when `userId === callerId && callerRoles` holds `ADMIN` and `roleNames` omits it. It checks the caller's session roles, not a fresh DB read.

## Permissions (ABAC)

Single reusable module `src/server/permissions.ts` (server-only), demonstrated on the `Post` resource.

- **Roles persist as a many-to-many**: `Role` (implicit `_RoleToUser`) on `User`, name values `RoleName` enum `ADMIN` / `MODERATOR` / `USER`. The three rows are seeded by the migration SQL. A user's effective permissions are the **union** of their roles' grants.
- **Engine**:
  - `hasPermission(user, resource, action, data?)` — row-level check. Each role/action rule is an unconditional boolean grant or an ownership predicate `(user, data) => boolean`. Predicate rules **deny when `data` is absent** (can't prove ownership).
  - `hasActionGrant(user, resource, action)` — coarse precheck used by the controller guard: predicate rules count as grants because the row check happens later.
- **Post matrix** — `admin` full access; `moderator` views/creates/updates any, deletes own only; `user` views/creates any, updates/deletes own only.
- **Admin matrix** — `Admin` resource with a single `manage` action granted only to `ADMIN`. The `permissionProcedure("Admin", "manage")` gate therefore admits ADMINS only. `Admin` has no row-level rules, so `ResourceData<"Admin">` resolves to `never`.
- **Session threading**: `getUserById`/`getUserByEmail` include `roles`; the JWT callback stamps `token.roles`; the session callback exposes `session.user.roles: RoleName[]`. `src/types/next-auth.d.ts` declares `roles` (and `id: string`) so `Session["user"]` satisfies `PermissionUser`.
- **Default role**: `registerUser` connects new users to the seeded `USER` role.
- **Controller-enforcement pattern** (do this in tRPC routers, not services):
  1. `permissionProcedure("Resource", "action")` guards the whole procedure (`UNAUTHORIZED` when signed out, `FORBIDDEN` when no held role grants the action).
  2. For row-level rules, the resolver fetches the record and re-checks `hasPermission(user, "Resource", "action", record)` — throwing `FORBIDDEN` when it fails — before delegating to the service.
  3. A missing record is also treated as `FORBIDDEN` (prevents existence probing on guarded actions).

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

## Next.js App Router Patterns (v16)

### Server Components (default)

- All components are Server Components by default — they run on the server and can be `async`.
- Use Server Components for data fetching, access to backend resources, and keeping sensitive logic (API keys, DB queries) on the server.
- Server Components cannot use React hooks, browser APIs, or event handlers.
- Fetch data directly in the component with `async/await`; no `useEffect` needed.

### Client Components

- Add `"use client"` at the top of a file to opt into client rendering.
- Required when using: React hooks (`useState`, `useEffect`), browser APIs (`window`, `document`), event handlers (`onClick`, `onSubmit`), or client-only libraries.
- Client Components cannot be `async` — they cannot directly fetch data.
- Keep the client boundary as narrow as possible. Lift `"use client"` to leaf components, not layouts or page-level components.
- Prefer Server Components; only add `"use client"` when the above requirements apply.

### Server Actions

- Define in separate files with `"use server"` directive at the top.
- Use `useActionState` (React 19) in Client Components to manage form state and pending status.
- Always validate inputs with Zod before processing.
- Call `revalidatePath()` from `next/cache` after successful mutations to refresh cached data.
- Server Actions without proper validation can expose the database to unauthorized access — always validate.

### Route Handlers

- Files named `route.ts` export named functions for HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Located under `src/app/api/**`; dynamic segments use `[param]` or `[...catchAll]`.
- In Next.js 16, `params` is Promise-based: `{ params }: { params: Promise<{ id: string }> }` — always `await` it.
- Use `NextRequest` and `NextResponse` from `next/server` for request/response handling.

### File conventions

| File | Purpose | Notes |
|---|---|---|
| `page.tsx` | Route page — the UI for a route segment | Export a default React component |
| `layout.tsx` | Shared layout wrapping child routes | Persists across navigation; receives `children` |
| `loading.tsx` | Suspense loading UI shown while route chunk loads | Renders automatically as a `<Suspense>` boundary |
| `error.tsx` | Error boundary for a route segment | Must be a Client Component (`"use client"`) |
| `not-found.tsx` | 404 UI for a route segment | Triggered by `notFound()` or unmatched URLs |
| `forbidden.tsx` | 403 UI for a route segment | Triggered by `forbidden()` from `next/navigation`; requires `experimental.authInterrupts: true` |
| `route.ts` | API Route Handler | Export named HTTP method functions |
| `template.tsx` | Like layout but re-renders on navigation | Use when you need remounting behavior |
| `global-error.tsx` | Root-level error boundary | Catches errors in the root layout |
| `default.tsx` | Fallback for parallel route segments | Required when using parallel routes |

Status in this codebase: `page.tsx` (7), `layout.tsx` (4, incl. route-group layouts), `loading.tsx` (1), `route.ts` (2), root `not-found.tsx` + root `forbidden.tsx` (both live in `src/app/` and are session-aware). `error.tsx` and `global-error.tsx` are not yet implemented.

### Session-aware error pages (404 / 403)

- Root `src/app/not-found.tsx` (any unmatched URL) and `src/app/forbidden.tsx` (auth interruption) render the shared `src/components/error-page.tsx` shell — a centered `min-h-svh` flex column with a serif `h1` title and a children slot.
- The action link is session-aware via `src/components/session-home-link.tsx`: an async Server Component wrapping `await connection()` + `await auth()` and resolving `homePathFor(session !== null)` from `src/routes.ts` (`/` authed, `/landing` signed out). Because it reads the session, it ships inside a `<Suspense>`;
- The Suspense fallback is a disabled `<Button>` (`HomeLinkFallback`) — never a link — so the prerendered static shell doesn't flash the wrong destination while the session resolves. This is the same PPR dynamic-hole pattern as `AppNavigation`/`HydrateClient`.
- `forbidden()` requires `experimental.authInterrupts: true` in `next.config.ts` (in the installed Next 16.2.4 this sets `__NEXT_EXPERIMENTAL_AUTH_INTERRUPTS`). There is no `forbidden.tsx` in the `(admin)` group, so a `forbidden()` from the admin layout bubbles to the root boundary automatically.

### Parallel and Intercepting Routes

- **Parallel Routes** (`@folder` convention): render multiple pages simultaneously in the same layout using named slots. Use for dashboards with sidebar + main + detail panels, or modals alongside page content.
- **Intercepting Routes** (`(..)`, `(...)`, `(....)`): intercept a route as if navigating to a different URL. Use for modals that link to a shareable URL — the modal shows on click but the full page renders on direct navigation/refresh.
- Neither is used in this codebase yet. Use when building dashboards, modals, or multi-panel layouts.

### `proxy.ts` (Routing Boundary)

- `src/proxy.ts` replaces `middleware.ts` in Next.js 16. It runs before a request is completed and can modify the response.
- Used for authentication checks, redirects, maintenance mode, and route protection.
- Export a default function and a `config` object with a `matcher` pattern.
- Do not create a `middleware.ts` file — use `proxy.ts`.
- Route vocabulary lives in `src/routes.ts`: `LANDING_PATH` (`/landing`), `publicRoutes`, `authRoutes`, `adminRoutes`, `apiAuthPrefix`, `DEFAULT_LOGIN_REDIRECT`, and `homePathFor(isLoggedIn)` (the session-aware home/dashboard link used by error pages). Proxy rules: auth routes redirect signed-in users to `DEFAULT_LOGIN_REDIRECT`; signed-in users on `/landing` are sent to `/`; anyone else on a non-public, non-auth route is sent to `/landing`.

### Route groups & layout composition

- URL-transparent route groups give each app area its own layout and access rules:
  - `(marketing)/` — `MarketingHeader` (logo → `/landing`, Sign In + Get Started → `/auth`); hosts `/landing` and `/maintenance`.
  - `(app)/` — the `NavigationBar` (client) with auth-aware items; hosts `/` (dashboard) and `/posts`.
  - `(admin)/` — guarded shell; hosts `/admin`. The layout wraps children in `<Suspense fallback={null}><AdminGate/></Suspense>`, where `AdminGate` (`src/components/admin-gate.tsx`) awaits `connection()` + `auth()` and calls `forbidden()` from `next/navigation` unless `session.user.roles` includes `ADMIN` — rendering the global 403. The role check uses the session's stamped roles, not a fresh DB read; signed-out visitors never reach the gate because the proxy redirects them off `/admin` first.
  - Root `layout.tsx` keeps only shared providers (`TRPCReactProvider`, `ThemeProvider`, fonts, metadata) — never route nav.
- **A route group's root is the parent path**: `(app)/page.tsx` and `(admin)/page.tsx` both resolve to `/`. Two root-level groups can't each have a `page.tsx`; nest an extra segment (`(admin)/admin/page.tsx`) instead.
- **Auth-aware nav must stay a PPR dynamic hole**: an `async` layout calling `auth()` makes the whole route dynamic, and with `cacheComponents` the build fails ("Uncached data was accessed outside of <Suspense>", surfaced at the root providers). Instead wrap the nav in `<Suspense>` and put `await connection()` + `await auth()` inside an async server component (`src/components/app-navigation.tsx`). The static shell prerenders with the fallback nav; the session-aware items stream in as the dynamic hole.
- The `NavigationBar` breadcrumb "Home" is literal `/`; keep it correct per group by gating which layout renders it (it lives only in `(app)`, where `/` is the dashboard).

### Next.js 16 Async APIs

All Next.js APIs are async in version 16. Always `await` them:

| API | Import | Notes |
|---|---|---|
| `cookies()` | `next/headers` | Returns `Promise<ReadonlyRequestCookies>` |
| `headers()` | `next/headers` | Returns `Promise<Headers>` |
| `params` | Page/Route props | `Promise<{ id: string }>` — `await` before destructuring |
| `searchParams` | Page props | `Promise<{ sort?: string }>` — `await` before destructuring |
| `connection()` | `next/server` | Marks a subtree as dynamic for PPR |

Forgetting to `await` these returns a Promise instead of the value, causing subtle bugs.

### Data Fetching

- Fetch in Server Components whenever possible — no client-side state management needed.
- Use `React.cache()` for deduplication when the same data is fetched in multiple places within a single render.
- Parallelize independent fetches with `Promise.all()`.
- Add `loading.tsx` files for Suspense loading states at the route level.
- Wrap async subtrees in `<Suspense>` for streaming and PPR dynamic holes.
- For client-side data fetching, use TanStack Query (via tRPC) — not `fetch` in Client Components.

### Metadata

- **Static**: export a `metadata` object from `layout.tsx` or `page.tsx`. Use for site-wide defaults.
- **Dynamic**: export an async `generateMetadata` function for per-page SEO (OpenGraph, title, description). Receives `params` and `searchParams` as Promises.
- The root layout (`src/app/layout.tsx`) defines site-wide metadata with `metadataBase`, `openGraph`, `twitter`, and `robots`.

## Caching Strategies

### `"use cache"` directive (Next.js 16+)

- Mark a Server Component or async function with `"use cache"` at the top of the file to enable explicit caching.
- Use `cacheLife(profile)` to set time-based expiry: `"hours"`, `"days"`, `"max"`, or a custom `CacheLife` config.
- Use `cacheTag("tag-name")` to tag cache entries for on-demand revalidation via `revalidateTag()` from `next/cache`.
- Combine with `revalidateTag()` in Route Handlers or Server Actions to invalidate specific cache entries when data changes.
- Not yet used in this codebase. Use for pages with expensive data fetches that can be cached and revalidated on demand.

### `cacheComponents` (Automatic component-level caching)

- `cacheComponents: true` in `next.config.ts` enables automatic static/dynamic splitting via PPR.
- Pages are prerendered as static HTML shells at build time.
- Any `<Suspense>` boundary that awaits data becomes a **dynamic hole** — only that subtree renders dynamically.
- Keep dynamic regions as small and scoped as possible (e.g., a single widget, not entire pages).

### The `connection()` pattern

- When a subtree needs request-scoped data (e.g., tRPC hydration with `Date.now()`), wrap it in `<Suspense>` and call `await connection()` from `next/server` inside.
- This opts only that subtree into dynamic rendering while the surrounding shell stays static.
- See `src/trpc/server.tsx` `HydrateClient` for the canonical example.

### React `cache()` for deduplication

- Wrap factories in `React.cache()` so multiple calls within a single RSC render share one instance.
- Currently used for: tRPC context creation (`createTRPCContext`), QueryClient creation (`createQueryClient`).

### React Compiler

- `reactCompiler: true` in `next.config.ts` enables automatic memoization via `babel-plugin-react-compiler`.
- Client components are memoized implicitly — manual `useMemo`/`useCallback` is unnecessary for standard cases.
- Only use explicit memoization when the compiler cannot infer stability (e.g., dynamically computed references).

### TanStack Query dehydration

- Server-fetched queries are serialized with SuperJSON via `shouldDehydrateQuery` (including pending queries for Suspense compatibility).
- The client hydrates from this serialized cache; `staleTime: 30s` prevents immediate refetch after hydration.

### On-demand revalidation (not yet used)

- `revalidatePath("/path")` — invalidates all cached entries for a specific path.
- `revalidateTag("tag")` — invalidates all cache entries tagged with a specific tag.
- Use in Server Actions or Route Handlers after mutations to refresh stale data.
- Prefer `cacheTag` + `revalidateTag` over `revalidatePath` for granular invalidation.

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
| `permissionProcedure(resource, action)` | `isAuthed` → action grant check | Permission-guarded endpoints; throws `UNAUTHORIZED` if no session, `FORBIDDEN` if no held role grants the action (row-level checks happen in the resolver with the record) |

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
- `HydrateClient` wraps with `<Suspense>` + `connection()` for PPR compatibility.
- Context + QueryClient wrapped in `React.cache()` for request-level deduplication.

## Testing Patterns

Three-layer test suite: Vitest (jsdom) unit, Vitest (node) DB integration, and Playwright e2e.

### Tooling & scripts

- Vitest 4 uses `test.projects` (the `vitest.workspace.*` files were removed in v4). Filter with `--project unit` / `--project integration`.
- `server-only` is aliased to `tests/server-only-stub.ts` in both Vitest configs; `tests/unit/setup.ts` sets `SKIP_ENV_VALIDATION=true` and mocks `next/navigation` + `next-themes`.
- Scripts: `test` (unit), `test:integration`, `test:coverage` (unit + reporting, no thresholds), `test:all`, `test:e2e`, `typecheck:test` (`tsc -p tsconfig.test.json`).
- Coverage is scoped via `coverage.include` to the seams under test, excluding shadcn `ui/`.

### Where tests live

| Layer | Location | Environment | Runs on |
|---|---|---|---|
| Unit | `src/**/*.test.{ts,tsx}` | jsdom | `npm test` |
| Integration | `tests/integration/**` | node (`forks`, `fileParallelism: false`) | `DATABASE_URL_TEST` required |
| E2E | `tests/e2e/**` | Playwright | live `dev` server + DB |

### Conventions

- **Unit tests target seams**: test components, hooks, and routers in isolation by mocking the boundary (`@/services/**`, `@/auth`, `@/lib/redis`). Port-based routers use `createCaller` with mocked deps.
- **Integration tests hit the real DB** via a PrismaClient on `DATABASE_URL_TEST`; `beforeEach` truncates tables (`TRUNCATE ... RESTART IDENTITY CASCADE`). They skip cleanly with a notice when `DATABASE_URL_TEST` is unset.
- **Integration env loading**: Vitest does not inject non-`VITE_`-prefixed vars from `.env` into `process.env`, so `tests/integration/setup.ts` explicitly calls `Object.assign(process.env, loadEnv("test", process.cwd(), ""))` before reading `DATABASE_URL_TEST`/`DATABASE_URL`.
- **Integration gates**: gate the whole DB-dependent block with `const describeDb = integrationEnabled ? describe : describe.skip`; keep pure-logic tests in a separate non-skipped `describe`. The boolean comes from `tests/integration/db.ts` and is re-exported (with a notice) from `tests/integration/setup.ts`.
- **E2E**: Playwright `setup` project signs in and saves `storageState` for the authed project; logged-out flows target a separate project. WebServer boots `npm run dev`.
- **E2E privileged-role (admin) setups**: to test role-gated flows, a dedicated setup (`setup/admin.setup.ts`) registers the user, promotes to the target role via a direct Prisma client against `DATABASE_URL_TEST` (loaded through Vite `loadEnv`, same as the integration-tests pattern), and **promotes before sign-in** — NextAuth stamps `token.roles` at token creation, so promoting after login would leave the old role in the session JWT. Saves a second storageState and is wired as its own project with `dependencies: ["setup"]`.
- **E2E selectors**: query by placeholder/role-name string, not regex; use `exact: true` for table cells whose accessible name is a *prefix* of another cell (e.g. a post title cell vs its `Edit <title>` action cell). For PPR-streamed forms that briefly render a prerendered shell plus the hydrated form, use `.last()` on the input locator. Error-page home buttons (`SessionHomeLink` → `Button asChild`) are authored as `<a>`, so assert with `getByRole("link", …)`.
- **Query by placeholder / role-name string, not regex**: the auth forms' inputs aren't label-associated and buttons have exact text, so use `getByPlaceholder` and `getByRole("button", { name: "..." })` string matchers (satisfies `useTopLevelRegex`).
- **TDD**: don't test nonexistent behavior — e.g., navigation-bar "Log out" items have no `onSelect` handler yet, so e2e omits sign-out until it's wired.
- **No speculative test helpers**: add shared helpers only once used; remove dead test infrastructure (`render-with-providers.tsx` was removed as unused).

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

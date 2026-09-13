# Testing

Three layers. Vitest 4 uses `test.projects` — filter with `--project unit` / `--project integration`.

## Unit (`src/**/*.test.{ts,tsx}`, jsdom) — `npm test`

- Test at seams: mock `@/services/**`, `@/auth`, `@/lib/redis`; routers via `createCaller` with mocked deps.
- Aliases: `server-only` → `tests/server-only-stub.ts`; `next/cache` → `tests/next-cache-stub.ts` (real query logic, spying `revalidateTag`). Setup (`tests/unit/setup.ts`) sets `SKIP_ENV_VALIDATION=true`, mocks `next/navigation` + `next-themes`.
- Selectors: placeholder/role-name strings (not regex); `exact: true` for prefix-colliding cells; `.last()` on PPR-streamed forms with shell+hydrated duplicates; error-page home links are `<a>` → `getByRole("link")`.
- No speculative helpers; keep suites flat; no `.only`/`.skip` in commits.

## Integration (`tests/integration/**`, node) — `npm run test:integration`

- Requires `DATABASE_URL_TEST` (dedicated Postgres). Unset → suite skips with notice.
- Env is loaded explicitly (`loadEnv("test", ...)` — Vitest doesn't inject non-`VITE_` vars).
- Pattern: `const describeDb = integrationEnabled ? describe : describe.skip`; pure-logic tests stay outside the gate. `beforeEach` truncates (`TRUNCATE ... RESTART IDENTITY CASCADE`), `fileParallelism: false`.
- Covers services + `auth-events` against the real DB.

## E2E (Playwright, `tests/e2e/**`) — `npm run test:e2e`

- Projects: `setup` (sign-in → `storageState`), authed USER, logged-out, `chromium-admin` (own setup promotes via direct Prisma on `DATABASE_URL_TEST` **before** sign-in, then saves second state).
- WebServer boots `npm run dev`. 404 spec is authed-only (logged-out unknown routes → `/landing`).
- Instant-navigation rig (separate config): `playwright.instant.config.ts` + `instant-nav.rig.md` — prod `build → start → test`, 12 `instant()` guards, `AUTH_TRUST_HOST` wall. Run when touching shells/layouts/PPR.

## Type + coverage

- `npm run typecheck` (app) + `typecheck:test` (`tsconfig.test.json`).
- `npm run test:coverage` (unit + v8 report, no thresholds; shadcn `ui/` excluded).
- Full gates: `npm run test:all` (unit+integration), `npm run validate` (typecheck + check:write + test:all + build).

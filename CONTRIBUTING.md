# Contributing

## Workflow

1. Fork, then branch from `main`: `feat/<scope>`, `fix/<scope>`, `docs/<scope>`.
2. Keep changes small and focused. Open an issue first for substantial work.
3. Run the full gate before pushing (see below).
4. Open a PR against `main` with: what changed, why, how to verify, migration notes if any.

## Local setup

```bash
npm install
Copy-Item .env.example .env   # Windows PowerShell (or: cp .env.example .env)
# fill in .env — see docs/env.md
npm run db:generate
npm run dev
```

Requires Node 20+, npm 11+, PostgreSQL (local or Neon). See `docs/env.md` for every variable.

## Commands

| Command | When to use |
|---|---|
| `npm run dev` | Daily dev (`--turbo`) |
| `npm run dev:https` | Local HTTPS / PWA install testing |
| `npm run dev:https:lan` / `dev:https:lan:sw` | Same-Wi-Fi phone testing (HTTPS + LAN IP, optional worker) |
| `npm run fix` / `npm run check` | Auto-fix / verify lint+format (Ultracite + Biome) |
| `npm run typecheck` / `typecheck:test` | App types / test types (`tsconfig.test.json`) |
| `npm run test` | Unit suite (Vitest `unit` project) |
| `npm run test:integration` | DB integration (needs `DATABASE_URL_TEST`, else skips) |
| `npm run test:all` | Unit + integration |
| `npm run test:e2e` | Playwright e2e (live dev server + DB) |
| `npm run test:coverage` | Unit coverage (no thresholds) |
| `npm run validate` | Full gate: `typecheck && check:write && test:all && build` |
| `npm run db:generate` | Local: create/apply dev migration + regenerate client |
| `npm run db:migrate` | Deploy: apply committed migrations (`migrate deploy`) |
| `npm run db:push` | Schema sync without migration files (prototyping only) |
| `npm run pwa:assets` | Regenerate `public/pwa/` from `public/favicon.ico` |
| `npm run build` / `npm run start` | Production build (`next build && serwist build`) / serve |

## Pre-push gate

```bash
npm run fix
npm run typecheck
npm run typecheck:test
npm run test:all
npm run build   # or npm run validate for everything at once
```

E2E (`npm run test:e2e`) is required when touching routes, auth, proxy, or PWA surfaces.

## Layered architecture (must follow)

Presentation → Controller → Business Logic → Data Access. Full rules in `docs/architecture.md` and `memory-bank/systemPatterns.md`.

- Controllers: `src/server/api/routers/**`, `src/actions/**`, NextAuth callbacks. Input validation, `permissionProcedure` / `hasPermission` checks, then call services.
- Services: `src/services/**` (`server-only`). Domain rules only — never evaluate permissions except the two documented exceptions (`post.list` visibility scoping, admin self-demotion).
- Repositories: `src/data/**` (`server-only`). Prisma only, no business rules. Services never import Prisma directly; routers never touch Prisma.
- Contracts: Zod schemas in `src/schemas/**`. REST-mounted procedures need `z.strictObject` `.output()` + `.meta({ openapi })`; keep `post.getLatest` registered before `post.getById`.

## Database

- Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/`.
- Local schema change: edit schema → `npm run db:generate` → commit the migration SQL.
- Never commit `db:push` output as a migration strategy; never hand-edit applied migrations — create a new one.
- New users always get the `USER` role (credentials path + OAuth `createUser` event). Role-less users are invalid; `updateRoles` rejects empty arrays.
- Integration tests truncate tables per test; they skip cleanly when `DATABASE_URL_TEST` is unset. See `docs/testing.md`.

## Tests

- Unit (`src/**/*.test.{ts,tsx}`, jsdom): test at seams, mock `@/services/**`, `@/auth`, `@/lib/redis`. PPR-streamed forms: use `.last()`; error-page home links are `<a>` → `getByRole("link")`.
- Integration (`tests/integration/**`, node): real Postgres via `DATABASE_URL_TEST`. Gate DB blocks with `describeDb`.
- E2E (`tests/e2e/**`): `setup` project saves `storageState`; privileged roles promote **before** sign-in (JWT stamps roles at creation).
- See `docs/testing.md`.

## Style

- Ultracite + Biome is authoritative: `npm exec -- ultracite fix`, `npm exec -- ultracite check`, `npm exec -- ultracite doctor`.
- TypeScript strict: no `any` (use `unknown`), explicit param/return types where they aid clarity, `const` by default, `for...of`, optional chaining / nullish coalescing, `async/await` with `try/catch`, early returns.
- React: function components, hooks top-level only, correct deps, `key` on iterables, no components-in-components, semantic HTML + ARIA, `next/image` for images.
- No `console.log` / `debugger` / `alert` in production code. Throw `Error` objects, not strings.

## Docs

- Source of truth for env vars is `src/env.js` + `.env.example`. Update both + `docs/env.md` when adding/removing vars.
- Domain vocabulary lives in `CONTEXT.md` — use its terms (Role vs Default role, Procedure vs Operation, Document vs Reference UI).
- Decisions that change behavior need an ADR in `docs/adr/` (see `docs/adr/README.md`).

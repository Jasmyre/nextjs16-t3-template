# nextjs16-t3-template

A production-oriented T3-style starter built on Next.js 16 App Router, with integrated authentication, typed APIs, Prisma/PostgreSQL persistence, and modern UI primitives. It is designed as a practical foundation for teams that want strong defaults for auth, data access, and developer workflow while keeping the codebase straightforward to extend.

## Docs

| Doc | Use when… |
|---|---|
| [docs/index.md](docs/index.md) | Doc map |
| [docs/env.md](docs/env.md) | Setting up `.env` |
| [docs/deployment.md](docs/deployment.md) | Shipping |
| [docs/architecture.md](docs/architecture.md) | Adding features (tiers, proxy, caching, tRPC) |
| [docs/auth.md](docs/auth.md) | Sign-in, roles, PATs |
| [docs/api.md](docs/api.md) | Calling `/api/v1` or `/api/trpc` |
| [docs/database.md](docs/database.md) | Schema + migrations |
| [docs/testing.md](docs/testing.md) | Unit / integration / e2e |
| [docs/pwa.md](docs/pwa.md) | Install, worker, offline, LAN testing |
| [docs/operations.md](docs/operations.md) | Maintenance, caching, monitoring |
| [docs/versioning.md](docs/versioning.md) | Releasing (semver automation) |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Something is broken |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow, gate, conventions |
| [SECURITY.md](SECURITY.md) | Reporting + controls |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

Domain vocabulary: [CONTEXT.md](CONTEXT.md). Decisions: [docs/adr/](docs/adr/README.md).

## Core Features

- Next.js 16 App Router architecture with server-first patterns (PPR static shells + `<Suspense>` dynamic holes)
- NextAuth v5 setup with Credentials, GitHub, and Google providers (JWT sessions, role stamping)
- ABAC roles (`ADMIN` / `MODERATOR` / `USER`) enforced at the controller tier
- Prisma ORM with PostgreSQL datasource and migration workflow
- tRPC server + React client for end-to-end typing, plus a versioned REST mount (`/api/v1`) with OpenAPI Document (`/api/openapi.json`) and Scalar UI (`/reference`)
- Personal access tokens (`Authorization: Bearer pat_…`) for external callers
- Theme switching support with `next-themes`
- Maintenance mode gate via `NEXT_PUBLIC_IS_IN_MAINTENANCE`
- PWA: installable manifest, committed icon family, assets-only Serwist worker, single `/offline` fallback
- Form validation with Zod and React Hook Form
- Shared UI system based on shadcn-style component structure

## Tech Stack

### Application Runtime

- Next.js 16.3 + React 19 + TypeScript 5
- NextAuth v5 beta + `@auth/prisma-adapter`
- tRPC v11 + TanStack Query + SuperJSON + `trpc-to-openapi`
- Prisma 7 + PostgreSQL (`pg`)
- `@t3-oss/env-nextjs` env validation, `server-only` guards, Upstash Redis rate limiting, Zod 4

### UI and Client Utilities

- Tailwind CSS 4 + Radix UI + shadcn-style `src/components/ui`
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `next-themes`, `react-hook-form` + `@hookform/resolvers`, Serwist 9, Scalar API reference

### Tooling and Quality

- Ultracite + Biome, Vitest 4 (unit + integration), Playwright e2e + instant-nav rig

## Prerequisites

- Node.js 20+
- npm 11+
- PostgreSQL database (local or hosted, such as Neon)
- OAuth app credentials for GitHub and Google if social login is enabled

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

3. Fill in all required values in `.env` — see [docs/env.md](docs/env.md).

4. Apply database schema and generate Prisma client:

```bash
npm run db:generate
```

5. Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000` by default.

### Local HTTPS (optional)

For PWA installability testing and LAN device access, run dev over HTTPS — full guide in [docs/pwa.md](docs/pwa.md):

```bash
npm run dev:https          # local HTTPS only
npm run dev:https:lan      # same-Wi-Fi phone testing
npm run dev:https:lan:sw   # + service worker (install testing)
```

`certificates/` are per-machine and gitignored — never commit them.

## Environment Variables

Validated in `src/env.js` (`emptyStringAsUndefined`). Full reference: [docs/env.md](docs/env.md).

Server (required): `DATABASE_URL`, `BASE_URL`, `NEXTAUTH_URL`, `AUTH_SECRET`, `GOOGLE_SITE_VERIFICATION`, `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN`, `NODE_ENV`.
Client: `NEXT_PUBLIC_IS_IN_MAINTENANCE` (required), `NEXT_PUBLIC_SW_IN_DEV` (optional).
Build/test-only: `DATABASE_URL_TEST`, `AUTH_URL`, `EXPOSE_TESTING_API`, `SKIP_ENV_VALIDATION`, `PORT`.

## Scripts

| Script | Purpose |
|---|---|
| `dev` | Start local dev server (`--turbo`) |
| `dev:https` / `dev:https:lan` / `dev:https:lan:sw` | HTTPS / LAN phone / + worker |
| `termux:dev` / `termux:build` | Dev / build with webpack (Termux) |
| `build` | Production build (`next build && serwist build`) |
| `start` / `preview` | Run production / build+run locally |
| `typecheck` / `typecheck:test` | App types / test types |
| `check` / `fix` / `check:write` / `check:unsafe` | Lint checks / auto-fix / Biome write / unsafe fixes |
| `test` / `test:unit:watch` | Unit suite / watch |
| `test:integration` / `test:all` / `test:coverage` | DB integration (needs `DATABASE_URL_TEST`) / all / coverage |
| `test:e2e` | Playwright e2e |
| `validate` | Full gate: typecheck + check:write + test:all + build |
| `db:generate` / `db:migrate` / `db:push` / `db:studio` | Dev migration / deploy migrations / schema push / Studio |
| `pwa:assets` | Regenerate `public/pwa/` install assets |

## Authentication Flow

- Config: `src/auth.ts` + `src/auth.config.ts`; handler: `src/app/api/auth/[...nextauth]/route.ts`.
- Pages: `/auth` (sign-in), `/auth/error`. JWT sessions with role stamping; `DEFAULT_LOGIN_REDIRECT=/`.
- Guards in `src/proxy.ts` (+ `src/routes.ts` vocabulary); `/admin` gated in the layout via `AdminGate` → `forbidden()`.
- Full matrix, sessions, and PAT lifecycle: [docs/auth.md](docs/auth.md).

## Database

Models: `User`, `Account`, `Post`, `Role` (`ADMIN`/`MODERATOR`/`USER`), `PersonalAccessToken`. Local: `npm run db:generate`. Deploy: `npm run db:migrate`. Details: [docs/database.md](docs/database.md).

## Project Structure

```text
.
|- prisma/            # schema.prisma + migrations/
|- src/
|  |- app/            # (app)/ (admin)/ (marketing)/ + api/auth, api/trpc, api/v1, api/openapi.json, reference/, offline/
|  |- actions/        # Server Actions (sign-in/out/up)
|  |- components/     # app components + ui/ (shadcn)
|  |- server/api/     # tRPC setup, root, openapi, rest-auth + routers/
|  |- services/       # business logic (server-only)
|  |- data/           # repositories / Prisma (server-only)
|  |- schemas/        # Zod contracts
|  |- lib/            # db-cache, cache-tags, redis, shell, pwa/sw utils
|  |- trpc/           # react/server/query-client helpers
|  |- auth.ts, auth.config.ts, auth-events.ts, routes.ts, proxy.ts, env.js
|- tests/             # unit setup/stubs, integration/, e2e/
|- docs/              # guides + adr/ + research/
|- .env.example
'- package.json
```

Architecture rules: [docs/architecture.md](docs/architecture.md).

## Quality Standards

Ultracite + Biome. Before pushing: `npm run fix`, `npm run typecheck`, `npm run test:all` (or `npm run validate`). Diagnostics: `npm exec -- ultracite doctor`. Conventions: [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment Notes

Set env in the host, run `npm run db:migrate`, then `npm run build` + `npm run start`. Full checklist, platform notes, health checks, rollback: [docs/deployment.md](docs/deployment.md).

## Troubleshooting

See [docs/troubleshooting.md](docs/troubleshooting.md) — env, OAuth, redirects, DB, API codes, PWA/worker, e2e flakes.

## Contributing

Contributions welcome — open an issue first for substantial changes. Workflow and gate: [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see `LICENSE`.

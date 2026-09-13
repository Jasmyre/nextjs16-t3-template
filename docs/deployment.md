# Deployment

## Pre-deploy checklist

- [ ] All vars from `docs/env.md` set in the host (exact production origin for `BASE_URL`/`NEXTAUTH_URL`).
- [ ] `AUTH_SECRET` is a fresh strong secret.
- [ ] `DATABASE_URL` points at production Postgres.
- [ ] OAuth callback URLs registered: `<origin>/api/auth/callback/github`, `<origin>/api/auth/callback/google`.
- [ ] `NEXT_PUBLIC_IS_IN_MAINTENANCE=false`, `EXPOSE_TESTING_API` unset, `SKIP_ENV_VALIDATION` unset.
- [ ] Migrations committed (`prisma/migrations/`), never relying on `db:push`.

## Steps

1. Install: `npm ci` (Node 20+, npm 11+).
2. Migrate: `npm run db:migrate` (`prisma migrate deploy`). Runs committed SQL only.
3. Build: `npm run build` (`next build && serwist build` — also emits `public/sw.js`, gitignored).
4. Start: `npm run start` (`next start`). Honor `PORT` if the host injects it.

`npm run preview` (`build && start`) mirrors this locally.

## Platform notes

- **Vercel / Neon / Upstash**: set env in the dashboard; use Neon's pooled URL for `DATABASE_URL`; Upstash REST pair for rate limiting. Run `db:migrate` as the build/release command.
- **Self-host / Docker**: multi-stage build, `npm ci`, copy `prisma/` + `src/env.js`, run `db:migrate` at container start (or release phase), then `next start`. Use `SKIP_ENV_VALIDATION=1` only at image-build time when secrets are injected at runtime.
- **LAN / HTTPS testing**: not a deploy target — see `docs/pwa.md` for `dev:https:lan` cert handling.

## Health checks

- `GET /api/openapi.json` → 200 static Document.
- `GET /manifest.webmanifest` → 200.
- `GET /offline` → 200 (partial-prerender shell).
- `GET /reference` → 200 Scalar UI.
- Guest `GET /` → 302 to `/landing`; authed `/landing` → 302 to `/`.

## Rollback

Migrations are forward-only. To roll back code without reverting schema, redeploy the previous image/commit (schema is additive by convention). If a migration must be undone, write a new corrective migration — never edit applied SQL.

## Observability

`next.config.ts` enables `logging.fetches` (full URLs + HMR refreshes). Route statuses (`/offline` ◐, `/manifest.webmanifest` ○, `/api/openapi.json` ○, `/reference` ○) must not flip to fully dynamic — the PWA audit gate in `docs/pwa.md` catches this.

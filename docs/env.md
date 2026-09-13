# Environment variables

Source of truth: `src/env.js` (validated with `@t3-oss/env-nextjs` + Zod). `emptyStringAsUndefined: true` — empty means missing. `SKIP_ENV_VALIDATION=1` skips validation (Docker builds only).

## Setup

```bash
cp .env.example .env   # or: Copy-Item .env.example .env
```

Keep `.env.example`, `src/env.js`, and this file in sync.

## Server (required)

| Variable | Format / example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Validated as URL. Neon or local Postgres. |
| `BASE_URL` | `http://localhost:3000` | Baked into canonical/OG metadata. LAN phone testing overrides per-process (see `docs/pwa.md`). |
| `NEXTAUTH_URL` | same origin as `BASE_URL` | Auth.js base URL. Must match OAuth callback registrations. |
| `AUTH_SECRET` | `openssl rand -base64 32` | Signs JWT sessions. Rotate on leak. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | from GitHub Developer Settings | Required only if GitHub login enabled. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from Google Cloud Console | Required only if Google login enabled. |
| `GOOGLE_SITE_VERIFICATION` | verification token | Search-console token; keep non-empty even if unused. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | from Upstash | Rate limiting. Dev skips limiting without them, but validation still requires values — use placeholders locally. |
| `NODE_ENV` | `development` \| `test` \| `production` | Defaults to `development`. |

## Client

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_IS_IN_MAINTENANCE` | yes (`"true"`/`"false"`) | `"true"` redirects all traffic to `/maintenance` in `src/proxy.ts`. |
| `NEXT_PUBLIC_SW_IN_DEV` | no | Set `1` (via `dev:https:lan:sw`) to register the worker in dev. Never set in production. |

## Test / build-only (not in `src/env.js`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL_TEST` | Dedicated Postgres for `test:integration` + admin e2e setup. When unset, integration tests skip with a notice. |
| `AUTH_URL` | Alternate Auth.js base URL (used by LAN scripts alongside `NEXTAUTH_URL`). |
| `EXPOSE_TESTING_API` | `=1` exposes Next testing hooks (`experimental.exposeTestingApiInProductionBuild`). Never enable in production. |
| `SKIP_ENV_VALIDATION` | `=1` skips env validation (Docker builds). |
| `PORT` | Overrides serve port for `next start` / LAN scripts. |

## Generating secrets

```bash
openssl rand -base64 32   # AUTH_SECRET
```

## Common pitfalls

- `NEXTAUTH_URL` trailing slash or wrong scheme (`http` vs `https`) breaks OAuth callbacks — use the exact public origin.
- LAN phone testing: plain `dev:https` redirects the phone to its own localhost; use `dev:https:lan` so `BASE_URL`/`NEXTAUTH_URL` point at `https://<lan-ip>:<port>`. See `docs/pwa.md`.
- Upstash placeholders locally are fine, but production needs real values or public rate-limited procedures fail open/closed unexpectedly.

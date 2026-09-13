# Troubleshooting

## Env validation fails on startup

- Every var in `src/env.js` must be present and non-empty (`emptyStringAsUndefined`). Check `.env` key names for typos against `docs/env.md`.
- Docker/test: `SKIP_ENV_VALIDATION=1` or `tests/unit/setup.ts` pattern; integration needs `DATABASE_URL_TEST`.

## OAuth fails / callback mismatch

- `NEXTAUTH_URL` + `BASE_URL` must equal the exact public origin (scheme + host + port, no trailing slash); register `<origin>/api/auth/callback/<github|google>` in provider dashboards.
- Phone testing on plain `dev:https` redirects to the phone's own localhost — use `npm run dev:https:lan`. OAuth on LAN needs the LAN callback registered.
- Handler must be deployed: `src/app/api/auth/[...nextauth]/route.ts`.

## Redirect loops / wrong landing

- Review `src/proxy.ts` + `src/routes.ts`: signed-in on `/auth/*` → `/`; signed-in on `/landing` → `/`; signed-out on protected → `/landing` (302).
- Maintenance flag `NEXT_PUBLIC_IS_IN_MAINTENANCE=true` captures everything to `/maintenance`.
- `forbidden()` needs `experimental.authInterrupts: true`; `/admin` non-admins render root `forbidden.tsx`.

## Prisma / DB errors

- Validate `DATABASE_URL` reachability; `npm run db:generate` after schema edits; deploys use `npm run db:migrate` (never `db:push`).
- Integration skips without `DATABASE_URL_TEST` — that skip is expected, not a failure.
- E2E admin setup uses `DATABASE_URL_TEST` via Vite `loadEnv`; missing `.env.test` points the server at the dev DB.

## API 401/403/404

- 401: missing/invalid Bearer or signed-out session — check `Authorization: Bearer pat_...` format.
- 403 on existing-looking rows is intentional (anti-probing) — check roles via `docs/auth.md` matrix.
- 404 on `/api/v1/admin*`: admin is tRPC-only by design.
- `/posts/latest` must stay registered before `/posts/{id}` in `postRouter`.

## PWA / worker

- Worker absent under plain `npm run dev` is by design — verify against `build + start` or `dev:https:lan:sw`.
- Phone `SecurityError ... when fetching the script`: LAN cert SANs mismatch — stop other servers, rerun `dev:https:lan:sw` to regenerate `certificates/lan.pem`, install `rootCA.pem` on the phone.
- Route flipped fully dynamic: check for `auth()`/`headers()` outside `<Suspense>`; keep dynamic holes narrow (`connection()` + `auth()` inside the async component).

## E2E flakes

- PPR streaming can render two `Title` boxes on `/posts/[id]/edit` → `.last()`.
- Cold-boot hydration: re-run; admin dialog specs are timing-sensitive.
- `AUTH_TRUST_HOST` wall in the instant rig: serve behind the configured host.

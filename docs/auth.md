# Auth & roles

Providers: Credentials, GitHub, Google (NextAuth v5, JWT sessions). Config: `src/auth.ts`, `src/auth.config.ts`; handler: `src/app/api/auth/[...nextauth]/route.ts`; pages: `/auth`, `/auth/error`.

## Sessions

JWT strategy. The JWT callback stamps `token.roles`; the session callback exposes `session.user.roles: RoleName[]` (+ `id`). Types in `src/types/next-auth.d.ts` keep `Session["user"]` compatible with `PermissionUser`.

Promote **before** sign-in: role changes after login don't appear until the next JWT issuance. Tests promote before sign-in for the same reason.

## Roles matrix

| Action | ADMIN | MODERATOR | USER |
|---|---|---|---|
| Post view / create | ✅ | ✅ | ✅ |
| Post update any / delete any | ✅ | update any / delete own | own only |
| Admin manage (`Admin.manage`) | ✅ | ❌ | ❌ |
| Token lifecycle | own tokens | own tokens | own tokens |

Effective permissions are the union of held roles. Every user holds ≥1 role (`USER` default); role-less is invalid (schema `.min(1)` + service `BAD_REQUEST` + dialog guard + backfill migration; engine denies anyway).

Two documented exceptions: `post.list` visibility scoping and admin self-demotion guard live in services — see `docs/architecture.md`.

## Route protection

`src/proxy.ts` + `src/routes.ts`: public (`/landing`, `/maintenance`, `/offline`, `/reference`), auth routes (signed-in → `/`), `/admin` via layout `AdminGate` (`forbidden()` → root `forbidden.tsx`), everything else requires login (`→ /landing`). Maintenance flag redirects everything to `/maintenance`.

## Personal access tokens (Bearer)

- Format `pat_<8-hex-prefix>_<48-hex-secret>` (24-byte secret keeps the credential under bcrypt's 72-byte limit).
- `token.create` returns plaintext **once** (hash only at rest); `token.list` shows prefix/name/expiry/revocation only; `token.revoke` is owner-scoped + idempotent.
- tRPC-only: the token router carries no OpenAPI meta, so it never appears in the Document.
- Usage: `Authorization: Bearer pat_...`. Presented-but-invalid fails closed (401), never falls back to cookies. Revoked/expired fail immediately. Resolved tokens run the same permission checks as sessions.

## OAuth setup

1. Create GitHub (`Settings → Developer settings`) and Google (`Console → Auth → Clients`) OAuth apps with callback `<origin>/api/auth/callback/<github|google>`.
2. Set `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, plus exact `NEXTAUTH_URL`/`BASE_URL`.
3. Credentials sign-up assigns `USER` via `registerUser`; OAuth sign-up via the `createUser` auth event (`src/auth-events.ts` → `assignDefaultRole`).

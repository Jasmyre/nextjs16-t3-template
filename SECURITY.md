# Security Policy

## Supported versions

Latest `main` only. This template ships fast; pin a release/fork for production apps and backport fixes yourself.

## Reporting a vulnerability

Open a **private** report via GitHub Security Advisories on your fork (preferred). Include: affected route/version, reproduction steps, impact, and any PoC. Do not open a public issue for unpatched vulnerabilities.

We aim to acknowledge within 72 hours. Once fixed, we disclose via the advisory + `CHANGELOG.md`.

## Built-in controls

- **Auth**: NextAuth v5 (JWT sessions). Credentials + GitHub + Google. OAuth callback allowlist in `src/proxy.ts` (`authRoutes`); callbacks redirect to `baseUrl` (see `src/auth.ts`).
- **Authorization**: ABAC module `src/server/permissions.ts` + `permissionProcedure` tRPC guard. Deny-without-data (ownership predicates deny when row data is absent); missing records answer `FORBIDDEN` (anti-probing), never 404 on guarded actions.
- **REST dual auth** (`src/server/api/rest-auth.ts`): Bearer PAT first, session-cookie fallback only when no Bearer is presented. Presented-but-invalid Bearer fails closed (401), never inherits the cookie.
- **PATs**: `pat_<8-hex>_<48-hex>`, bcrypt hash at rest, owner-scoped, revocable + expirable. Plaintext shown once at `token.create`. Full credential stays under bcrypt's 72-byte limit by design.
- **Headers** (`next.config.ts`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`; `/sw.js` is `no-cache` + `CSP default-src 'self'`.
- **Rate limiting**: public tRPC procedures use `publicRateLimitedProcedure` (Upstash Redis, 5 req / 40s / IP, skipped in dev).
- **Input**: Zod everywhere (procedures, server actions, forms). REST outputs are `z.strictObject` with ISO datetimes.
- **PII**: `User` holds `email`, `emailVerified`, `password` (bcrypt hash), `image`, `biography`, `isPrivate`. Treat dumps/backups as sensitive.
- **Service worker**: no push, no background/periodic sync, no auth logic. Pages with user content + all APIs are network-only by routing policy.

## Operator checklist

1. Set a strong `AUTH_SECRET` (`openssl rand -base64 32`). Rotate on suspected leak (invalidates all JWT sessions).
2. Set `NEXTAUTH_URL`/`BASE_URL` to the exact production origin (https). Register the same callback URLs in GitHub/Google dashboards.
3. Restrict DB + Upstash credentials; use a dedicated Postgres role for the app.
4. Run `npm run db:migrate` (never `db:push`) in deploys.
5. Keep `EXPOSE_TESTING_API` unset (or `0`) in production — it exposes Next testing hooks.
6. Use `SKIP_ENV_VALIDATION` only for Docker builds that inject env at runtime, never to hide missing secrets.
7. Revoke leaked PATs via `token.revoke`; expired/revoked tokens fail closed immediately.
8. Review `docs/auth.md` (roles matrix) before granting `ADMIN`.

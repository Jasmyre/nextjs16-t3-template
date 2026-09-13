# API reference

Two transports share the same Procedures: typed tRPC (web app) and versioned REST (external callers). Terms: Procedure (code) vs Operation (HTTP) — see `CONTEXT.md`.

## REST mount (`/api/v1`)

- Document (machine contract): `GET /api/openapi.json` (static, generated once at module load).
- Reference UI (human): `GET /reference` (Scalar, public).
- Wire shape: plain JSON, ISO datetimes, no SuperJSON envelope. Outputs are `z.strictObject` (unknown fields fail).
- Tags: `posts`, `dashboard`. 8 Operations (`post.*` ×7 + `dashboard.getStats`). Admin stays tRPC-only (unmounted by construction).
- Versioning: `/api/v1` prefix. Future breaking changes get `/api/v2`; v1 stays until clients migrate.

## Auth

Schemes: `bearer` (PAT) + `cookie` (session); protected Operations accept either.

```bash
curl -H "Authorization: Bearer pat_<prefix>_<secret>" \
  https://<host>/api/v1/posts
curl https://<host>/api/openapi.json
```

Bearer-first, fail-closed: presented-but-invalid Bearer → 401 without consulting cookies. Session fallback applies only when no Bearer is sent. Permission checks are identical on both.

## Errors

| Code | Meaning |
|---|---|
| 401 | Missing/invalid Bearer on a protected Operation, or signed-out session |
| 403 | Authenticated but no grant (also used for missing rows — anti-probing) |
| 404 | Unknown REST path / unmounted surface (e.g. admin on REST) |

Zod failures surface flattened validation errors (see `formatZodError`).

## tRPC (`/api/trpc`)

Batched + SuperJSON + cookie-only. Use generated hooks in-app (`useSuspenseQuery`, `useMutation`, `api.useUtils()` for invalidation). Server components call directly via `createCaller` / hydration helpers (`HydrateClient`).

## Rate limits

Public procedures: 5 req / 40s / IP (Upstash Redis; skipped in dev). Authenticated procedures are unthrottled at this layer — add limits per-router as needed.

## Ordering gotcha

`post.getLatest` is registered before `post.getById` because `/posts/latest` also matches `/posts/{id}` — keep that order when editing `postRouter`.

# Operations

## Maintenance mode

`NEXT_PUBLIC_IS_IN_MAINTENANCE=true` → `src/proxy.ts` redirects everything to `/maintenance` (itself public). Flip the var + redeploy to enter/exit. `/maintenance` lives in `(marketing)/`.

## Offline fallback

`/offline` is the single generic fallback (partial-prerender). Retry button performs a real reload (`reload-page.ts` seam) — never a link to `/` (would loop offline). Never cache signed-in pages or API responses in the worker.

## Cache invalidation matrix

Server reads cache 10s (`unstable_cache` + coarse tags); client `staleTime` 10s. Worst-case staleness ~10s; writes invalidate immediately (only after success):

| Write | Invalidates |
|---|---|
| Post create | `posts:list`, `dashboard:stats` |
| Post update / delete | above + `posts:item` |
| `admin.updateRoles` | `admin:users`, `users:by-id` (role changes propagate to JWT path) |
| Sign-up (credentials + OAuth event) | `admin:users`, `dashboard:stats` |

Use `revalidateCacheTag(tag)` (pins SWR `"max"`) over raw `revalidateTag`/`revalidatePath`.

## Logging & monitoring

- `logging.fetches.fullUrl + hmrRefreshes` in `next.config.ts`.
- tRPC `timingMiddleware` logs procedure timing (dev-latency simulation included).
- At minimum monitor: 5xx rate, `/api/trpc` + `/api/v1` latency, DB pool saturation, Upstash rate-limit errors, `/api/openapi.json` + `/manifest.webmanifest` status.

## Backups

Postgres point-in-time recovery (Neon: enable + test restore). `User` PII + PAT hashes are in backups — encrypt at rest, restrict access.

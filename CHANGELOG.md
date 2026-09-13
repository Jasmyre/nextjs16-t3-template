# Changelog

Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) (Unreleased-first). Distilled from `memory-bank/progress.md`.

## [Unreleased]

- `dev:https:lan` + `dev:https:lan:sw` phone-testing entries (LAN IP certs, worker flag).
- PWA A3: `/offline` retry-as-reload, proxy reachability pins, native standalone styling.
- PWA A1: manifest identity, committed install icon family, Apple launch screens, `pwa:assets` pipeline.
- Cache window tightened 60s → 10s (server `unstable_cache` + client `staleTime`).
- Instant-navigation guards (12 `instant()` checks, admin-shell fallback fix).
- Sidebar as primary navigation (T11 refactor, orphans deleted).
- REST/OpenAPI v1 mount + PAT lifecycle + strict output contracts (Zod 4).
- Role invariant: every user holds ≥1 role (validation + service guard + OAuth event + backfill migration).

## [0.1.0] — template baseline

- Next.js 16 + React 19 + T3 stack (NextAuth v5, tRPC 11, Prisma 7, Tailwind 4).
- ABAC roles (`ADMIN` / `MODERATOR` / `USER`), JWT role stamping, admin management UI.
- Dashboard + posts CRUD, PPR shells, layered services/repositories.
- Vitest unit + integration + Playwright e2e suites.

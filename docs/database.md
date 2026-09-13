# Database

PostgreSQL via Prisma 7 (`pg` driver). Client: `src/server/db.ts` (singleton). Schema: `prisma/schema.prisma`.

## Models

- `User` (cuid, `email?` unique, `password?` hash, `image?`, `biography?`, `isPrivate`, `roles`, `posts`, `accounts`, `personalAccessTokens`).
- `Account` (OAuth links, `@@unique([provider, providerAccountId])`, cascade).
- `Post` (`name`, `author → User` cascade, indexes on `name`, `authorId`).
- `Role` (`RoleName` unique: `ADMIN` / `MODERATOR` / `USER`), many-to-many users (implicit `_RoleToUser`).
- `PersonalAccessToken` (`user → User` cascade, `prefix`/`tokenHash` unique, `expiresAt?`, `revokedAt?`, index `userId`).

## Workflows

| Env | Command | Effect |
|---|---|---|
| Local | `npm run db:generate` | `prisma migrate dev` — creates/applies migration + regenerates client |
| Deploy | `npm run db:migrate` | `prisma migrate deploy` — applies committed SQL only |
| Prototype | `npm run db:push` | `prisma db push` — sync without migration files (never for deploys) |
| Inspect | `npm run db:studio` | Prisma Studio |

Rules: edit schema → `db:generate` → commit the migration directory. Never hand-edit applied migrations; write a new one. Seed rows (`ADMIN`/`MODERATOR`/`USER`) come from migration SQL, not app code; the `20260905` migration backfilled `USER` onto role-less users.

## Layering

Repositories (`src/data/**`) own all Prisma access; services call repositories, never Prisma; routers call services, never Prisma. `getUserByEmail` and writes bypass `unstable_cache` (freshness); 7 page-visit reads are cached 10s with coarse tags (see `docs/architecture.md`).

## Tests

Integration uses `DATABASE_URL_TEST` with per-test `TRUNCATE ... RESTART IDENTITY CASCADE`. See `docs/testing.md`.

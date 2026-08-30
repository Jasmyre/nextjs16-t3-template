# System Patterns

## Application boundaries

- Next.js App Router is the application boundary; server-first patterns are preferred.
- NextAuth v5 exports auth helpers and handlers from `src/auth.ts`; App Router exposes `GET` and `POST` through `src/app/api/auth/[...nextauth]/route.ts`.
- `src/proxy.ts` applies route protection/redirect behavior using shared route definitions in `src/routes.ts`.
- tRPC is organized as root/router/context code under `src/server/api`, with the Next.js handler under `src/app/api/trpc/[trpc]` and client/server helpers under `src/trpc`.
- Prisma access is centralized in `src/server/db.ts`; PostgreSQL is the persistence target.
- Environment validation is defined in `src/env.js`; do not document environment variables without checking that file and `.env.example`.
- Shared UI primitives live under `src/components/ui` and use shadcn-style patterns with Tailwind CSS.
- Authentication forms use Zod schemas and React Hook Form. The theme is managed with `next-themes`.

## Layered architecture (3-tier + MVC)

The application follows a three-tier architecture mapped to MVC conventions. Keep responsibilities in their tier and never let an upper tier reach past the next one (e.g. controllers must not touch Prisma directly).

| MVC | Tier | Location | Responsibility |
|---|---|---|---|
| **View** | Presentation | `src/app/**`, `src/components/**`, `src/hooks/**` | Rendering, user interaction, client state |
| **Controller** | Presentation (request boundary) | `src/server/api/routers/**` (tRPC), `src/actions/**` (Server Actions), NextAuth callbacks | Input validation, auth/ownership checks, calling services, mapping results |
| **Model (business)** | Business Logic | `src/services/**` | Domain rules, orchestration, hashing, result codes |
| **Model (persistence)** | Data Access | `src/data/**` (repositories), `src/server/db.ts` (Prisma client) | Query/persistence operations only |

Conventions:

- `src/services/**` and `src/data/**` are server-only (`import "server-only"`) and must not be imported by client components.
- Services orchestrate business rules by calling repositories; they do not import the Prisma client directly.
- Repositories own all Prisma access; they do not contain business rules.
- The tRPC context exposes `headers` and `user` only — `db` is intentionally not injected so routers cannot bypass the service layer.
- Zod schemas in `src/schemas/**` are the shared contract between controllers and the business layer.

## Runtime flow

1. Requests enter through the App Router.
2. `src/proxy.ts` applies public/auth/API route rules and redirects as needed.
3. Auth requests are handled by NextAuth; application API requests use the tRPC handler.
4. Controllers (tRPC procedures / server actions) validate input and invoke services.
5. Services apply business logic and delegate persistence to repositories.
6. Repositories query Prisma against the shared client and database schema.

Keep new features aligned with these boundaries: controllers stay thin, business rules live in `src/services`, and persisted data access lives in `src/data`.
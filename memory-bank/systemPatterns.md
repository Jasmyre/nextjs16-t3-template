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

## Runtime flow

1. Requests enter through the App Router.
2. `src/proxy.ts` applies public/auth/API route rules and redirects as needed.
3. Auth requests are handled by NextAuth; application API requests use the tRPC handler.
4. Server procedures use the shared Prisma client and database schema.

Keep new features aligned with these boundaries: route pages/components handle presentation, server procedures handle typed application operations, and Prisma models define persisted data.

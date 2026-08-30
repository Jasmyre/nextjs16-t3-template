# Technical Context

## Stack

- Next.js 16.2.4, React 19, TypeScript
- NextAuth 5 beta with Credentials, GitHub, and Google providers
- tRPC 11 with React Query and SuperJSON
- Prisma 7 with PostgreSQL and `pg`
- Tailwind CSS 4, Radix UI, shadcn-style components, next-themes
- Zod and React Hook Form for validation/forms
- `server-only` guard on service and data-access modules
- Ultracite and Biome for formatting/linting

## Commands

- `npm run dev` — development server with Turbo
- `npm run build` / `npm start` — production build and server
- `npm run typecheck` — TypeScript check
- `npm run check` / `npm run fix` — Ultracite validation/fixes
- `npm run db:generate`, `db:migrate`, `db:push`, `db:studio` — Prisma workflows

The repository uses npm (`npm@11.4.1`) and requires Node.js 20+ according to the README. Environment setup is based on `.env.example` copied to `.env`. Required operational configuration includes `BASE_URL`, `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials when Google/GitHub sign-in is enabled. Redis and Google verification variables are also supported by the environment schema.

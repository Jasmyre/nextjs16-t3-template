# nextjs16-t3-template

A production-oriented T3-style starter built on Next.js 16 App Router, with integrated authentication, typed APIs, Prisma/PostgreSQL persistence, and modern UI primitives. It is designed as a practical foundation for teams that want strong defaults for auth, data access, and developer workflow while keeping the codebase straightforward to extend.

## Core Features

- Next.js 16 App Router architecture with server-first patterns
- NextAuth v5 setup with Credentials, GitHub, and Google providers
- Prisma ORM with PostgreSQL datasource and migration workflow
- tRPC server and React client integration for end-to-end typing
- Theme switching support with `next-themes`
- Maintenance mode gate via `NEXT_PUBLIC_IS_IN_MAINTENANCE`
- Form validation with Zod and React Hook Form
- Shared UI system based on shadcn-style component structure

## Tech Stack

### Application Runtime

- Next.js 16
- React 19
- TypeScript 5
- NextAuth v5
- tRPC v11
- Prisma 7
- PostgreSQL (`pg`)

### UI and Client Utilities

- Tailwind CSS 4
- Radix UI primitives
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `next-themes`
- `react-hook-form` + `@hookform/resolvers`
- `zod`

### Tooling and Quality

- Ultracite
- Biome
- Prisma CLI

## Prerequisites

- Node.js 20+
- npm 11+
- PostgreSQL database (local or hosted, such as Neon)
- OAuth app credentials for GitHub and Google if social login is enabled

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

3. Fill in all required values in `.env`.

4. Apply database schema and generate Prisma client:

```bash
npm run db:generate
```

5. Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000` by default.

## Environment Variables

All required variables are validated in `src/env.js`. Keep `.env.example` in sync when adding or removing variables.

### Server Variables

- `DATABASE_URL`
- `NODE_ENV`
- `BASE_URL`
- `GOOGLE_SITE_VERIFICATION`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `UPSTASH_REDIS_REST_TOKEN`
- `UPSTASH_REDIS_REST_URL`

### Client Variables

- `NEXT_PUBLIC_IS_IN_MAINTENANCE`

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `next dev --turbo` | Start local development server |
| `build` | `next build` | Create production build |
| `start` | `next start` | Run production server |
| `preview` | `next build && next start` | Build then run production locally |
| `typecheck` | `tsc --noEmit` | Run TypeScript checks |
| `check` | `ultracite check` | Run lint/format checks |
| `fix` | `ultracite fix` | Auto-fix lint/format issues |
| `check:write` | `biome check --write .` | Apply safe Biome fixes |
| `check:unsafe` | `biome check --write --unsafe .` | Apply all Biome fixes (including unsafe) |
| `db:generate` | `prisma migrate dev` | Create/apply dev migration and regenerate client |
| `db:migrate` | `prisma migrate deploy` | Apply committed migrations in deploy environments |
| `db:push` | `prisma db push` | Push schema directly without migration files |
| `db:studio` | `prisma studio` | Open Prisma Studio |

## Authentication Flow

- Main auth config lives in `src/auth.ts` and `src/auth.config.ts`.
- API auth handlers are mounted at `src/app/api/auth/[...nextauth]/route.ts`.
- Custom auth pages:
  - Sign-in page: `/auth`
  - Error page: `/auth/error`
- Session strategy is JWT, with custom token/session enrichment for user role, username, and email verification state.
- Route protection and redirects are enforced in `src/proxy.ts`:
  - Public routes stay accessible without login
  - Auth routes redirect authenticated users to `DEFAULT_LOGIN_REDIRECT`
  - Non-public routes redirect unauthenticated users to `/auth`
  - Maintenance mode can redirect all traffic to `/maintenance`

## Database

Prisma schema is defined in `prisma/schema.prisma` and currently includes:

- `User`
- `Account`
- `Post`
- `UserRole` enum

### Migration Workflow

Use these patterns depending on environment:

- Local development: `npm run db:generate`
- Deployment pipeline: `npm run db:migrate`
- Rapid schema sync (non-migration flow): `npm run db:push`

## Project Structure

```text
.
|- prisma/
|  |- migrations/
|  '- schema.prisma
|- src/
|  |- app/
|  |  |- api/
|  |  |  |- auth/[...nextauth]/route.ts
|  |  |  '- trpc/[trpc]/route.ts
|  |  |- auth/
|  |  '- layout.tsx
|  |- server/
|  |  |- api/
|  |  '- db.ts
|  |- trpc/
|  |- auth.ts
|  |- auth.config.ts
|  |- env.js
|  '- proxy.ts
|- .env.example
'- package.json
```

## Quality Standards

This repository uses Ultracite with Biome for formatting and linting.

Recommended workflow before commit:

```bash
npm run fix
npm run check
npm run typecheck
```

If you need diagnostics for tooling setup:

```bash
npm exec -- ultracite doctor
```

## Deployment Notes

1. Set all required environment variables from `src/env.js` in your hosting platform.
2. Ensure `DATABASE_URL` points to your production PostgreSQL instance.
3. Set `NEXTAUTH_URL` and `BASE_URL` to your production domain.
4. Apply Prisma migrations in deployment with:

```bash
npm run db:migrate
```

5. Build and start:

```bash
npm run build
npm run start
```

## Troubleshooting

### Environment validation fails on startup

- Confirm every required variable in `src/env.js` is present and non-empty.
- Re-check `.env` key names for typos.

### OAuth sign-in fails or callback issues occur

- Verify OAuth callback URLs in GitHub/Google dashboards match your `NEXTAUTH_URL` and NextAuth callback path.
- Confirm `src/app/api/auth/[...nextauth]/route.ts` exists and is deployed.

### Redirect loops or unexpected auth redirects

- Review route lists and guard logic in `src/proxy.ts`.
- Verify maintenance mode flag value for `NEXT_PUBLIC_IS_IN_MAINTENANCE`.

### Prisma or database connection errors

- Validate `DATABASE_URL` format and database reachability.
- Re-run `npm run db:generate` after schema changes.

## Contributing

Contributions are welcome. Open an issue to discuss substantial changes before submitting a pull request.

For contributions, ensure:

- lint/format checks pass
- type checks pass
- migrations are included when schema changes are introduced

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

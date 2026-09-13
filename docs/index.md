# Docs

Start here. Internal design notes live in `memory-bank/`; domain vocabulary in `CONTEXT.md`.

| Doc | Use when… |
|---|---|
| [env](env.md) | Setting up `.env`, adding a variable, debugging validation |
| [deployment](deployment.md) | Shipping to Vercel / self-host / Docker |
| [architecture](architecture.md) | Adding a feature and need tier boundaries, proxy, caching, tRPC rules |
| [auth](auth.md) | Wiring sign-in, roles, sessions, PATs |
| [api](api.md) | Calling `/api/v1` REST or `/api/trpc` from outside the web app |
| [database](database.md) | Changing schema, writing migrations, seeding roles |
| [testing](testing.md) | Writing unit / integration / e2e tests |
| [pwa](pwa.md) | Install icons, worker policy, offline, LAN device testing |
| [operations](operations.md) | Maintenance mode, cache invalidation, logging, health checks |
| [troubleshooting](troubleshooting.md) | Something is broken — env, OAuth, redirects, DB, PWA, e2e |
| [adr/README](adr/README.md) | Recording or reading an architecture decision |

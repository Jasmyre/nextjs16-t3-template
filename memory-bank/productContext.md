# Product Context

The application provides a foundation for a real authenticated product rather than a collection of disconnected examples. Users can access the auth flow, sign in with credentials or configured social providers, and work with server data through typed procedures. The current domain model includes users, roles, linked accounts, privacy/profile fields, and posts.

The operational experience should be predictable: configure `.env`, connect PostgreSQL, apply the Prisma schema, run the application, and use the protected routes and API endpoints. Maintenance mode can be enabled publicly through `NEXT_PUBLIC_IS_IN_MAINTENANCE` while the application is unavailable for normal use.

# ADRs

Architecture Decision Records. Format: lede + Considered / Rejected + Consequences. New decisions copy the latest `000n` file as template.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-users-must-have-at-least-one-role.md) | Users must hold at least one role | Accepted |
| [0002](0002-versioned-rest-openapi-and-bearer-tokens.md) | Versioned REST + OpenAPI + Bearer PATs | Accepted |
| [0003](0003-locked-viewport-and-apple-metadata.md) | Locked viewport + Apple metadata | Accepted (revisit on a11y signal) |
| [0004](0004-serwist-configurator-and-assets-only-policy.md) | Serwist configurator, assets-only worker | Accepted |

Missing (write when touched): T3 stack choice, Auth.js v5 beta, ABAC exceptions (`post.list` scoping, self-demotion), 10s cache window, sidebar-as-primary-nav, `proxy.ts` vs `middleware.ts`.

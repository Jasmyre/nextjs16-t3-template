# Users must always have at least one role

OAuth/social sign-ups created users with no roles (the Prisma adapter never connected one), so those users were denied every permission check yet could still log in. Role management also let an admin deselect every role, producing the same role-less state. We decided a user with zero roles is an invalid state, not a feature: every enforcement layer now maintains it, OAuth sign-ups auto-receive the `USER` role, and a one-time migration backfills existing role-less users.

## Considered Options

- **Treat empty roles as an explicit "disable" state**: an admin could fully strip a user's roles as a suspension tool. Rejected — the system has no notion of "disabled", and a role-less user can still consume resources; disabling deserves its own capability with a recovery path, not an accidental side effect of role editing.

## Consequences

- Enforcement is layered: `updateRolesSchema` validates `roleNames` is non-empty, `admin-service.updateRoles` throws `BAD_REQUEST` on an empty array (defense in depth), and the manage-roles dialog disables toggling off the last remaining role.
- `src/auth-events.ts` (extracted from `src/auth.ts`) assigns `USER` in the Auth.js `createUser` event, so adapter-created users match `registerUser`'s behavior.
- The permission engine still denies role-less users (defense in depth) — that behavior is kept and tested even though the state should now be unreachable.
- Existing role-less users are backfilled to `USER` by the migration `20260905000000_assign_default_role_to_roles_user`.

# Roles & Permissions Context

The authentication and authorization domain: how users hold roles and what those roles grant.

## Language

**Role**:
One of `ADMIN`, `MODERATOR`, or `USER` (the `RoleName` enum). Users hold zero or more roles; their effective permissions are the union of their roles' grants.
_Avoid_: Permission, access level, group

**Default role**:
The `USER` role; every user receives it at creation — whether registered with credentials or signed up through a social provider. A user who holds only this role sees and posts, but manages nothing.
_Avoid_: Standard role, base role

**Role-less user**:
A user who holds no roles. This is an invalid state that must not exist: they can sign in but are denied every permission check, so the system prevents creating or saving one.
_Avoid_: Disabled user, suspended user, "user with no role"

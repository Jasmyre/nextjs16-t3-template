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

## REST and OpenAPI language

**Procedure vs Operation**:
A Procedure is the code-side definition — one name with validated inputs, permission checks, and domain rules behind it, and the source of truth the web app calls. An Operation is the HTTP-side entry — one method plus one path with plain request/response shapes. Each supported Operation maps to exactly one Procedure.
_Avoid_: Swapping the two; "endpoint" or "route" when the code/HTTP distinction matters

**Document vs Reference UI**:
The Document is the machine-readable contract describing every supported Operation — paths, shapes, auth schemes, and error codes — read by generators and agents. The Reference UI is the live, human-readable page that renders the Document so a developer can read and try every Operation without guessing paths.
_Avoid_: Calling the rendered page the contract, or the contract the page; "docs" when the Document/page distinction matters

**REST mount**:
The versioned plain-JSON surface where Operations are called. It sits alongside the unchanged typed in-app transport; the Document describes this mount only, and privileged management stays off it.
_Avoid_: Document, Reference UI (the mount is the callable surface, not its description or its browser page)

**Bearer token vs session**:
A Bearer token is a named, expiring, revocable credential for external callers — presented per request and granting exactly the holder's own access, never more. A session is the browser's cookie-based sign-in. Both resolve to the same user-with-roles, so permission checks behave identically on either.
_Avoid_: Sharing a session cookie with scripts; treating a token as elevated access

## Overlay language

**Dialog**:
A centered modal requiring a decision or input.
_Avoid_: Popup, drawer

**Sheet**:
An edge-anchored panel for navigation or details.
_Avoid_: Drawer, popup, modal

**Back-close overlay**:
A Dialog or Sheet that pushes a history entry while open so the browser Back button closes it instead of navigating away.
_Avoid_: Treating DropdownMenu, Popover, or Tooltip as back-close overlays — those are anchored transients that dismiss on outside interaction

## PWA language

**Install icon family**:
The committed icon variants that identify the installed web application across platforms: standard icons, a maskable icon, and the Apple touch icon. They are derived from one source image so the install identity remains consistent.
_Avoid_: Using "favicon" for every install icon; the favicon is the source asset, not the full family.

**Apple launch screen**:
An iOS home-screen launch image. This application uses a deliberately minimal generated set; it is separate from the install icon family.
_Avoid_: Calling every iOS image an icon or assuming launch screens are required for installability.

**Service worker**:
A script the browser runs in the background to serve cached files when the network is slow or gone. It never checks identity and never grants access; login, roles, and permission checks still happen on the server for every call.
_Avoid_: Treating cached content as proof of access; the worker holds no session.

**Routing policy**:
The single rule set that decides what the service worker may serve from cache and what must always use the network. All pages with user content, all typed-transport calls, and all REST mount Operations always use the network; unknown future routes do the same by default.
_Avoid_: Caching API answers or signed-in pages "for speed"; freshness rules live on the server, not in the worker.

**Precache**:
The fixed list of public files stored during install: versioned build files, public fonts and icons, the manifest, the static Document, and public marketing pages that never change per user. Entries carry a deployment revision, so an update replaces them instead of expiring them over time.
_Avoid_: Adding user-specific or login-dependent pages; precache holds public files only.

**Offline fallback**:
The one generic public page shown when a navigation fails without a network. It is never a signed-in page and never API data.
_Avoid_: One fallback per page; there is exactly one.

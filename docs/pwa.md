# PWA

Assets-only offline worker (Serwist 9). No push, no background/periodic sync, no auth logic in the worker — pinned by the `sw background behavior absence` suite.

## Concepts (see `CONTEXT.md`)

Install icon family (standard + maskable + Apple touch, from `public/favicon.ico`) · Apple launch screens (minimal portrait set) · precache (public files only, revisioned) · routing policy (pages with user content + all APIs network-only; unknown routes network by default) · offline fallback (single generic `/offline`) · standalone styling (native display-mode media only).

## Pipeline

- Source: `src/pwa.ts` (identity), `src/app/manifest.ts`, root layout (viewport lock + Apple metadata), `src/sw-policy.ts` + `src/sw.ts`.
- Regenerate binaries: `npm run pwa:assets` (`scripts/pwa-assets.mjs`, pinned `pwa-asset-generator@8.1.5`) → 24 committed files under `public/pwa/`.
- Build: `npm run build` runs `next build && serwist build` → `public/sw.js` (65 precached URLs, gitignored).

## Audit gate (release bar)

Run over a secure context — production build on `http://localhost:3000`, or LAN HTTPS for devices. Plain `npm run dev` never registers the worker (`SerwistProvider` disables it); `dev:https:lan:sw` opts in via `NEXT_PUBLIC_SW_IN_DEV=1`.

```bash
npm run build
npm run start
```

Keep route statuses: `/offline` ◐, `/manifest.webmanifest` ○, `/api/openapi.json` ○, `/reference` ○.

1. DevTools → Application → Manifest: no errors, installability green.
2. Application → Service workers: registered + controlling.
3. Offline (SW Offline or Network Offline) → reload: every failed navigation serves `/offline` (retry = real reload, never a cached signed-in page or API payload).

Lighthouse has no PWA category since v12 — no score gate; legacy ≤11 audits optional.

## LAN device testing

```bash
npm run dev:https          # local HTTPS only (localhost SANs)
npm run dev:https:lan      # phone testing: LAN IP + BASE_URL/NEXTAUTH_URL pointed at it
npm run dev:https:lan:sw   # + worker enabled (install testing)
```

First run may prompt for password (mkcert CA install). `certificates/` is per-machine, gitignored — each dev regenerates. LAN certs (`lan.pem`) carry the machine IP in SANs; they auto-regenerate when the IP changes. On the phone: same Wi-Fi → open the printed Network URL → accept the cert warning (testing only) → credentials login (OAuth needs a registered LAN callback) → Add to Home Screen. For install prompts, also install the machine `rootCA.pem` on the phone as a CA certificate. Only one dev server per directory at a time.

## Decisions

- ADR `0003`: locked viewport (`maximumScale: 1`, `userScalable: false`) + Apple metadata — accessibility tradeoff recorded, revisit on audit/feedback.
- ADR `0004`: Serwist configurator + assets-only policy.

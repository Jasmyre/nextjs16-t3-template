# PWA Installability and Serwist

## Verdict

- Use `@serwist/next` for the Next.js 16.3 PWA implementation; it is the best fit of the reviewed options, with the caveat that the documented integration is webpack-oriented while this repo uses Turbopack for `dev`.
- Chrome and Edge need HTTPS (or localhost), a web app manifest with identity/start URL/display metadata, and suitable icons for install promotion. A service worker is needed for offline behavior, but a fetch handler is not a universal installability prerequisite.
- Safari's Add to Home Screen flow is separate from Chromium's install prompt and does not provide the same `beforeinstallprompt` contract.
- Keep public static assets cacheable, but use `NetworkOnly` for authenticated HTML/RSC, session-dependent navigations, NextAuth endpoints, tRPC requests, REST mutations, and cookie-sensitive routes.
- The verified asset package is `pwa-asset-generator@8.1.5`; its common no-gradient/no-padding command can generate icon assets from `public/favicon.ico`, while manifest/index updates are optional.

## Verified versions

- `next`: `16.3.4`
- `@serwist/next`: `9.5.12`
- `serwist`: `9.5.12`
- `@ducanh2912/next-pwa`: `10.2.9`
- `pwa-asset-generator`: `8.1.5`

## Serwist integration shape

The documented shape is:

```ts
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  swUrl: "/sw.js",
});

export default withSerwist(nextConfig);
```

The existing `/sw.js` response headers should be retained. The generated worker must not intercept session-dependent navigation or API traffic merely because the route is same-origin.

## Asset command

```bash
npx pwa-asset-generator public/favicon.ico public --icon-only --favicon --type png --padding 0 --background transparent --opaque false --maskable false --scrape false
```

`--manifest` and `--index` are optional metadata-update targets. Maskable icons remain a recommended separate output for install quality rather than a hard universal install requirement.

## Sources

- [Next.js Progressive Web App guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Next.js Cache Components](https://nextjs.org/docs/app/getting-started/caching)
- [Serwist Next getting started](https://serwist.pages.dev/docs/next/getting-started)
- [MDN: Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [W3C Web App Manifest](https://www.w3.org/TR/appmanifest/)
- [WebKit Safari 16.4 features](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/)
- [pwa-asset-generator repository](https://github.com/elegantapp/pwa-asset-generator)

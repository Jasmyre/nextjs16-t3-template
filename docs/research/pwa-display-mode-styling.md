# PWA Display-Mode Styling on Tailwind v4

## Verdict

- Do not add `tailwindcss-displaymodes`; its latest reviewed version is `1.0.8`, a legacy JavaScript `addVariant` plugin aimed at the `tailwind.config.js` model.
- This repo uses Tailwind v4's CSS-first `@import "tailwindcss"` setup, so native CSS is the lower-risk and more direct integration.
- Use `@media (display-mode: standalone)` for global rules, or define a small Tailwind v4 custom variant when utility composition is useful.
- Keep standalone-only styling limited to demonstrated browser-chrome or safe-area adjustments; do not create a second layout system for installed mode.

## Verified versions

- Tailwind CSS declared by the repo: `^4.0.15`
- Lockfile-resolved Tailwind CSS reported by research: `4.2.4`
- `tailwindcss-displaymodes`: `1.0.8`

## Native patterns

Global CSS:

```css
@media (display-mode: standalone) {
  .app-shell {
    padding-top: env(safe-area-inset-top);
  }
}
```

Tailwind v4 custom variant:

```css
@custom-variant standalone {
  @media (display-mode: standalone) {
    @slot;
  }
}
```

Usage:

```tsx
<div className="standalone:pt-[env(safe-area-inset-top)]" />
```

An arbitrary variant is also possible:

```tsx
<div className="[@media_(display-mode:standalone)]:pt-[env(safe-area-inset-top)]" />
```

## Sources

- [Tailwind CSS: using PostCSS](https://tailwindcss.com/docs/installation/using-postcss)
- [Tailwind CSS v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide#using-a-javascript-config-file)
- [Tailwind CSS custom variants](https://tailwindcss.com/docs/adding-custom-styles#custom-variants)
- [tailwindcss-displaymodes npm metadata](https://registry.npmjs.org/tailwindcss-displaymodes)
- [tailwindcss-displaymodes source](https://github.com/bhendi-boi/tailwindcss-displaymodes/blob/main/index.js)
- [MDN: `display-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/display-mode)
- [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/#display-modes)
- [Web App Manifest display modes](https://www.w3.org/TR/appmanifest/#display-modes)

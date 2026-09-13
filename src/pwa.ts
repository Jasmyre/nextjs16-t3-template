import type { MetadataRoute, Viewport } from "next";

/**
 * PWA installability surface (issue #42): the hand-authored source for the
 * web app manifest identity, the Install icon family inventory, the Apple
 * launch screen references, and the locked viewport plus Apple metadata
 * policy. The raster binaries under `public/pwa/` are generated from
 * `public/favicon.ico` by `npm run pwa:assets` and committed; the generator
 * never mutates this file or the Next metadata, so production builds need
 * no generation tooling.
 */

export const PWA_SHORT_NAME = "Template";

export const PWA_NAME = "Template | Next.js 16";

export const PWA_DESCRIPTION = "A modern Next.js 16 starter template.";

export const PWA_MANIFEST_URL = "/manifest.webmanifest";

/**
 * Theme chrome colors, rendered from the `--background` theme tokens in
 * `src/styles/globals.css` (light `:root`, dark `.dark`). The manifest
 * carries a single install-splash color, so it uses the dark token; the
 * viewport carries both. `src/pwa.test.ts` fails on drift from the tokens.
 */
export const PWA_THEME_COLOR_LIGHT = "#e8ebed";

export const PWA_THEME_COLOR_DARK = "#1a1a1a";

export const PWA_BACKGROUND_COLOR = PWA_THEME_COLOR_DARK;

type ManifestIcon = NonNullable<MetadataRoute.Manifest["icons"]>[number];

export interface PwaIcon extends ManifestIcon {
  height: number;
  width: number;
}

/** Install icon family: standard sizes plus the maskable variant. */
export const PWA_ICONS: PwaIcon[] = [
  {
    height: 192,
    sizes: "192x192",
    src: "/pwa/manifest-icon-192.png",
    type: "image/png",
    width: 192,
  },
  {
    height: 512,
    sizes: "512x512",
    src: "/pwa/manifest-icon-512.png",
    type: "image/png",
    width: 512,
  },
  {
    height: 512,
    purpose: "maskable",
    sizes: "512x512",
    src: "/pwa/manifest-icon-512.maskable.png",
    type: "image/png",
    width: 512,
  },
];

export const PWA_APPLE_TOUCH_ICON = {
  sizes: "180x180",
  type: "image/png",
  url: "/pwa/apple-icon-180.png",
} as const;

/**
 * Generic browser icon slots (`icons.icon`): the maskable variant is
 * manifest-only, so it stays out of the favicon set.
 */
export const PWA_METADATA_ICONS = PWA_ICONS.filter(
  (icon) => icon.purpose !== "maskable"
);

export interface PwaStartupImage {
  height: number;
  media: string;
  url: string;
  width: number;
}

const startupImage = (
  width: number,
  height: number,
  ratio: 2 | 3
): PwaStartupImage => ({
  height,
  media: `(device-width: ${width / ratio}px) and (device-height: ${height / ratio}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
  url: `/pwa/apple-splash-${width}-${height}.png`,
  width,
});

/**
 * Minimal Apple launch screen set: portrait viewports only, one file per
 * physical size. Landscape and dark-mode duplicates are excluded by the
 * pipeline; nothing here is hand-drawn, only referenced.
 */
export const PWA_STARTUP_IMAGES: PwaStartupImage[] = [
  startupImage(640, 1136, 2),
  startupImage(750, 1334, 2),
  startupImage(828, 1792, 2),
  startupImage(1125, 2436, 3),
  startupImage(1170, 2532, 3),
  startupImage(1179, 2556, 3),
  startupImage(1206, 2622, 3),
  startupImage(1242, 2208, 3),
  startupImage(1242, 2688, 3),
  startupImage(1260, 2736, 3),
  startupImage(1284, 2778, 3),
  startupImage(1290, 2796, 3),
  startupImage(1320, 2868, 3),
  startupImage(1488, 2266, 2),
  startupImage(1536, 2048, 2),
  startupImage(1620, 2160, 2),
  startupImage(1640, 2360, 2),
  startupImage(1668, 2224, 2),
  startupImage(1668, 2388, 2),
  startupImage(2048, 2732, 2),
];

export const pwaManifest: MetadataRoute.Manifest = {
  background_color: PWA_BACKGROUND_COLOR,
  description: PWA_DESCRIPTION,
  display: "standalone",
  // Width/height stay in the inventory for the contract test; the served
  // manifest carries only Web App Manifest members.
  icons: PWA_ICONS.map((icon) => {
    const { height: _height, width: _width, ...manifestIcon } = icon;
    return manifestIcon;
  }),
  id: "/",
  name: PWA_NAME,
  orientation: "portrait",
  scope: "/",
  short_name: PWA_SHORT_NAME,
  start_url: "/",
  theme_color: PWA_THEME_COLOR_DARK,
};

export const PWA_APPLE_WEB_APP = {
  capable: true,
  statusBarStyle: "black-translucent",
  startupImage: PWA_STARTUP_IMAGES.map((image) => ({
    media: image.media,
    url: image.url,
  })),
  title: PWA_SHORT_NAME,
} as const;

/**
 * Locked viewport policy: cover safe-area fitting with theme-aware chrome,
 * and the requested zoom lock. The zoom lock trades away pinch-zoom for the
 * native-app feel; see `docs/adr/0003-locked-viewport-and-apple-metadata.md`
 * for the accessibility tradeoff, the required text-sizing and control
 * mitigations, and the audit-or-feedback revisit trigger.
 */
export const PWA_VIEWPORT: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { color: PWA_THEME_COLOR_LIGHT, media: "(prefers-color-scheme: light)" },
    { color: PWA_THEME_COLOR_DARK, media: "(prefers-color-scheme: dark)" },
  ],
  userScalable: false,
  viewportFit: "cover",
  width: "device-width",
};

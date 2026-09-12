import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifestRoute from "@/app/manifest";
import {
  PWA_APPLE_TOUCH_ICON,
  PWA_APPLE_WEB_APP,
  PWA_BACKGROUND_COLOR,
  PWA_ICONS,
  PWA_MANIFEST_URL,
  PWA_METADATA_ICONS,
  PWA_NAME,
  PWA_SHORT_NAME,
  PWA_STARTUP_IMAGES,
  PWA_THEME_COLOR_DARK,
  PWA_THEME_COLOR_LIGHT,
  PWA_VIEWPORT,
  pwaManifest,
} from "@/pwa";

const LIGHT_THEME_BLOCK_PATTERN = /:root\s*\{([^}]*)\}/;
const DARK_THEME_BLOCK_PATTERN = /\.dark\s*\{([^}]*)\}/;
const BACKGROUND_TOKEN_PATTERN = /--background:\s*oklch\(([^)]+)\)/;
const SPLASH_SIZE_PATTERN = /apple-splash-(\d+)-(\d+)\.png/;
const STARTUP_MEDIA_PATTERN =
  /^\(device-width: (\d+)px\) and \(device-height: (\d+)px\) and \(-webkit-device-pixel-ratio: ([23])\) and \(orientation: portrait\)$/;
const WHITESPACE_PATTERN = /\s+/;
const DISPLAY_PROPERTY_PATTERN = /display\s*:/;
const POSITION_PROPERTY_PATTERN = /position\s*:/;
const GRID_TEMPLATE_PATTERN = /grid-template/;
const FLEX_DIRECTION_PATTERN = /flex-direction/;

const publicDir = path.join(process.cwd(), "public");

const pwaPath = (file: string): string => path.join(publicDir, "pwa", file);

const pngDimensions = (path: string): { height: number; width: number } => {
  const bytes = readFileSync(path);
  const signature = [...bytes.subarray(0, 8)]
    .map((byte) => String.fromCharCode(byte))
    .join("");
  if (signature !== "\x89PNG\r\n\x1a\n") {
    throw new Error(`${path} is not a PNG file`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
};

const oklchToHex = (lightness: number, chroma: number, hue: number): string => {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b;
  const m = lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b;
  const s = lightness - 0.089_484_177_5 * a - 1.291_485_548 * b;
  const cube = (value: number): number => value * value * value;
  const red =
    4.076_741_662_1 * cube(l) -
    3.307_711_591_3 * cube(m) +
    0.230_969_929_2 * cube(s);
  const green =
    -1.268_438_004_6 * cube(l) +
    2.609_757_401_1 * cube(m) -
    0.341_319_396_5 * cube(s);
  const blue =
    -0.004_196_086_3 * cube(l) -
    0.703_418_614_7 * cube(m) +
    1.707_614_701 * cube(s);
  const gamma = (value: number): number =>
    value > 0.003_130_8 ? 1.055 * value ** (1 / 2.4) - 0.055 : 12.92 * value;
  const toByte = (value: number): string =>
    Math.round(Math.min(1, Math.max(0, gamma(value))) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(red)}${toByte(green)}${toByte(blue)}`;
};

const themeBackgroundToken = (scheme: "dark" | "light"): string => {
  const css = readFileSync(
    path.join(process.cwd(), "src", "styles", "globals.css"),
    "utf8"
  );
  const blockPattern =
    scheme === "light" ? LIGHT_THEME_BLOCK_PATTERN : DARK_THEME_BLOCK_PATTERN;
  const block = blockPattern.exec(css);
  if (!block) {
    throw new Error(`missing ${scheme} theme block in globals.css`);
  }
  const token = BACKGROUND_TOKEN_PATTERN.exec(block[1] ?? "");
  if (!token?.[1]) {
    throw new Error(`missing --background token in ${scheme} theme block`);
  }
  return token[1].trim();
};

const themeBackgroundHex = (scheme: "dark" | "light"): string => {
  const [lightness, chroma, hue] = themeBackgroundToken(scheme)
    .split(WHITESPACE_PATTERN)
    .map(Number);
  if (lightness === undefined || chroma === undefined || hue === undefined) {
    throw new Error(`malformed --background token in ${scheme} theme block`);
  }
  return oklchToHex(lightness, chroma, hue);
};

/**
 * Pins the PWA installability surface (issue #42): root-scoped manifest
 * identity, the committed Install icon family plus Apple touch icon, the
 * minimal Apple launch screen set, and theme-token color drift.
 */
describe("pwa manifest identity", () => {
  it("serves the manifest at root scope", () => {
    expect(PWA_MANIFEST_URL).toBe("/manifest.webmanifest");
    expect(pwaManifest.id).toBe("/");
    expect(pwaManifest.scope).toBe("/");
    expect(pwaManifest.start_url).toBe("/");
  });

  it("identifies the app with the theme short name", () => {
    expect(PWA_SHORT_NAME).toBe("Template");
    expect(pwaManifest.short_name).toBe(PWA_SHORT_NAME);
    expect(PWA_NAME).toBe("Template | Next.js 16");
    expect(pwaManifest.name).toBe(PWA_NAME);
  });

  it("installs as a portrait standalone app with no store categories", () => {
    expect(pwaManifest.display).toBe("standalone");
    expect(pwaManifest.orientation).toBe("portrait");
    expect("categories" in pwaManifest).toBe(false);
  });

  it("serves the hand-authored definition from the manifest route", () => {
    expect(manifestRoute()).toEqual(pwaManifest);
  });

  it("serves only Web App Manifest icon members", () => {
    for (const icon of manifestRoute().icons ?? []) {
      expect(icon).not.toHaveProperty("height");
      expect(icon).not.toHaveProperty("width");
    }
  });
});

describe("install icon family", () => {
  it("declares the standard sizes plus the maskable variant", () => {
    expect(
      PWA_ICONS.map((icon) => `${icon.sizes}:${icon.purpose ?? "any"}`).sort()
    ).toEqual(["192x192:any", "512x512:any", "512x512:maskable"]);
  });

  it("commits every declared icon with matching raster dimensions", () => {
    for (const icon of PWA_ICONS) {
      expect(icon.src.startsWith("/pwa/")).toBe(true);
      expect(icon.type).toBe("image/png");
      const dimensions = pngDimensions(pwaPath(icon.src.replace("/pwa/", "")));
      expect(dimensions.width).toBe(icon.width);
      expect(dimensions.height).toBe(icon.height);
      expect(dimensions.width).toBe(dimensions.height);
    }
  });

  it("commits the Apple touch icon at 180px", () => {
    expect(PWA_APPLE_TOUCH_ICON.url).toBe("/pwa/apple-icon-180.png");
    const dimensions = pngDimensions(pwaPath("apple-icon-180.png"));
    expect(dimensions).toEqual({ height: 180, width: 180 });
  });

  it("keeps the maskable variant out of the generic icon slots", () => {
    expect(PWA_METADATA_ICONS).toEqual(
      PWA_ICONS.filter((icon) => icon.purpose !== "maskable")
    );
    for (const icon of PWA_METADATA_ICONS) {
      expect(icon.purpose).toBeUndefined();
    }
  });
});

describe("apple launch screen set", () => {
  it("references the minimal portrait-only generated set", () => {
    expect(PWA_STARTUP_IMAGES.length).toBe(20);
    for (const image of PWA_STARTUP_IMAGES) {
      expect(image.url.startsWith("/pwa/apple-splash-")).toBe(true);
      expect(image.media).toContain("(orientation: portrait)");
      expect(image.media).not.toContain("prefers-color-scheme");
    }
  });

  it("commits every referenced launch screen with matching dimensions", () => {
    for (const image of PWA_STARTUP_IMAGES) {
      const dimensions = pngDimensions(pwaPath(image.url.replace("/pwa/", "")));
      expect(dimensions.width).toBe(image.width);
      expect(dimensions.height).toBe(image.height);
    }
  });

  it("targets each launch screen with an exact device media query", () => {
    for (const image of PWA_STARTUP_IMAGES) {
      const size = SPLASH_SIZE_PATTERN.exec(image.url);
      if (!size) {
        throw new Error(`${image.url} does not encode its dimensions`);
      }
      const [, pixelsWide, pixelsHigh] = size.map(Number);
      if (pixelsWide === undefined || pixelsHigh === undefined) {
        throw new Error(`${image.url} does not encode its dimensions`);
      }
      const query = STARTUP_MEDIA_PATTERN.exec(image.media);
      if (!query) {
        throw new Error(`${image.url} has a malformed media query`);
      }
      const [, deviceWidth, deviceHeight, ratio] = query.map(Number);
      if (
        deviceWidth === undefined ||
        deviceHeight === undefined ||
        ratio === undefined
      ) {
        throw new Error(`${image.url} has a malformed media query`);
      }
      expect(deviceWidth * ratio).toBe(pixelsWide);
      expect(deviceHeight * ratio).toBe(pixelsHigh);
      expect(deviceWidth).toBe(image.width / ratio);
      expect(deviceHeight).toBe(image.height / ratio);
    }
  });
});

describe("viewport policy", () => {
  it("locks the zoom policy with cover safe-area fitting", () => {
    expect(PWA_VIEWPORT).toMatchObject({
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      viewportFit: "cover",
      width: "device-width",
    });
  });

  it("adapts the browser chrome to the light and dark themes", () => {
    expect(PWA_VIEWPORT.themeColor).toEqual([
      { color: PWA_THEME_COLOR_LIGHT, media: "(prefers-color-scheme: light)" },
      { color: PWA_THEME_COLOR_DARK, media: "(prefers-color-scheme: dark)" },
    ]);
  });
});

describe("apple web-app policy", () => {
  it("launches capable with a black-translucent status bar", () => {
    expect(PWA_APPLE_WEB_APP.capable).toBe(true);
    expect(PWA_APPLE_WEB_APP.statusBarStyle).toBe("black-translucent");
    expect(PWA_APPLE_WEB_APP.title).toBe(PWA_SHORT_NAME);
  });

  it("references the generated launch screens without hand images", () => {
    expect(PWA_APPLE_WEB_APP.startupImage).toEqual(
      PWA_STARTUP_IMAGES.map((image) => ({
        media: image.media,
        url: image.url,
      }))
    );
  });
});

describe("theme-color drift", () => {
  it("derives the chrome colors from the theme background tokens", () => {
    expect(PWA_THEME_COLOR_LIGHT).toBe(themeBackgroundHex("light"));
    expect(PWA_THEME_COLOR_DARK).toBe(themeBackgroundHex("dark"));
  });

  it("paints the install splash with the light theme background", () => {
    expect(PWA_BACKGROUND_COLOR).toBe(PWA_THEME_COLOR_LIGHT);
    expect(pwaManifest.background_color).toBe(PWA_BACKGROUND_COLOR);
    expect(pwaManifest.theme_color).toBe(PWA_THEME_COLOR_LIGHT);
  });
});

const readGlobalsCss = (): string =>
  readFileSync(
    path.join(process.cwd(), "src", "styles", "globals.css"),
    "utf8"
  );

const standaloneBlocks = (css: string): string[] => {
  const blocks: string[] = [];
  const marker = "@media (display-mode: standalone)";
  let from = 0;
  while (true) {
    const start = css.indexOf(marker, from);
    if (start === -1) {
      return blocks;
    }
    const open = css.indexOf("{", start);
    if (open === -1) {
      throw new Error("unterminated standalone media query in globals.css");
    }
    let depth = 0;
    let end = open;
    while (end < css.length) {
      if (css[end] === "{") {
        depth += 1;
      } else if (css[end] === "}") {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
      end += 1;
    }
    blocks.push(css.slice(open + 1, end));
    from = end + 1;
  }
};

/**
 * Standalone style rules, excluding `@custom-variant` definitions: variant
 * bodies carry the `@slot` composition hook, not style rules.
 */
const standaloneRules = (css: string): string[] =>
  standaloneBlocks(css).filter((block) => !block.includes("@slot"));

/**
 * Pins standalone-only styling (issue #44): native display-mode media for
 * demonstrated safe-area and browser-chrome adjustments, a small
 * framework-native variant for composition, no legacy display-mode plugin,
 * and no second layout system for installed mode.
 */
describe("standalone styling", () => {
  it("handles the notch safe area through native standalone media", () => {
    const rules = standaloneRules(readGlobalsCss());
    expect(rules.length).toBeGreaterThan(0);
    const declarations = rules.join("\n");
    for (const inset of [
      "safe-area-inset-top",
      "safe-area-inset-right",
      "safe-area-inset-bottom",
      "safe-area-inset-left",
    ]) {
      expect(declarations).toContain(`env(${inset})`);
    }
  });

  it("keeps standalone rules to safe-area handling, not a second layout", () => {
    for (const block of standaloneRules(readGlobalsCss())) {
      expect(block).toContain("safe-area-inset");
      expect(block).not.toMatch(DISPLAY_PROPERTY_PATTERN);
      expect(block).not.toMatch(POSITION_PROPERTY_PATTERN);
      expect(block).not.toMatch(GRID_TEMPLATE_PATTERN);
      expect(block).not.toMatch(FLEX_DIRECTION_PATTERN);
    }
  });

  it("offers a framework-native variant for standalone composition", () => {
    expect(readGlobalsCss()).toContain("@custom-variant standalone");
  });

  it("avoids the legacy display-mode plugin", () => {
    expect(readGlobalsCss().toLowerCase()).not.toContain("displaymodes");
    const manifest = JSON.parse(
      readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    ) as { dependencies?: Record<string, string> };
    for (const name of Object.keys(manifest.dependencies ?? {})) {
      expect(name.toLowerCase()).not.toContain("displaymode");
    }
  });
});

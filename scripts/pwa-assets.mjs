/**
 * PWA asset pipeline (issue #42).
 *
 * Derives the committed Install icon family plus the minimal Apple launch
 * screen set from `public/favicon.ico` with the pinned generator
 * `pwa-asset-generator@8.1.5` under the locked configuration: no gradient
 * (transparent background), no padding, transparent canvas, and the built-in
 * Apple spec table (`--scrape false`, so generation is deterministic and
 * needs no network beyond the bundled Chromium).
 *
 * Run with `npm run pwa:assets`. The manifest definition (`src/pwa.ts`) and
 * the Next metadata (`src/app/layout.tsx`) are hand-authored source and are
 * never mutated by the generator, so production builds need no generation
 * tooling — the binaries under `public/pwa/` are committed.
 *
 * The generator emits both maskable twins; only the 512px maskable variant
 * belongs to the Install icon family, so the 192px twin is removed to keep
 * the committed set minimal (192, 512, 512 maskable, 180 Apple touch).
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, "public", "favicon.ico");
const output = path.join(root, "public", "pwa");

const LOCKED_FLAGS = [
  "--type",
  "png",
  "--padding",
  "0",
  "--background",
  "transparent",
  "--opaque",
  "false",
  "--scrape",
  "false",
];

const runGenerator = (args) => {
  execFileSync(
    process.execPath,
    [
      path.join(root, "node_modules", "pwa-asset-generator", "bin", "cli.js"),
      source,
      output,
      ...args,
    ],
    { cwd: root, stdio: "inherit" }
  );
};

mkdirSync(output, { recursive: true });

// Standard icons (192, 512) plus the Apple touch icon (180).
runGenerator(["--icon-only", "--maskable", "false", ...LOCKED_FLAGS]);
// Maskable variants; re-emits the identical Apple touch icon.
runGenerator(["--icon-only", ...LOCKED_FLAGS]);
// Minimal Apple launch screen set: portrait viewports only (no landscape,
// no dark-mode duplicates).
runGenerator(["--splash-only", "--portrait-only", ...LOCKED_FLAGS]);

rmSync(path.join(output, "manifest-icon-192.maskable.png"), { force: true });

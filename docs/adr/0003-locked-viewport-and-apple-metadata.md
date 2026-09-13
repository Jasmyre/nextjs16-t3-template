# Locked viewport with cover fitting and Apple metadata

We ship the installability surface with a locked viewport (`maximumScale: 1`, `userScalable: false`), `viewportFit: "cover"` safe-area fitting, light and dark theme chrome colors from the existing theme tokens, an Apple-capable web app with a black-translucent status bar, and references to the minimal generated Apple launch screen set. The manifest and Next metadata stay hand-authored source; the generator only writes binaries under `public/pwa/`.

## Considered Options

- **Allow pinch-zoom (`maximumScale` unset, `userScalable: true`)**: the accessible default — low-vision users can zoom any page. Rejected for this pass: the map decision (#39) requests the locked policy for the installed native-app feel, and unlock-on-first-complaint would ship an undecided behavior. The lock is kept behind the revisit trigger below instead of being left open.
- **Contain fitting (`viewportFit: "contain"`) or no theme chrome**: avoids notch-overlap questions entirely. Rejected — the installed app would letterbox on notched devices and clash with the light/dark theme, against the decided native-feeling launch.
- **Hand-maintained per-device launch images**: full control over every splash. Rejected — a multi-dozen-image matrix rots on every new device; the pipeline generates the portrait-only set from the single source icon instead.

## Consequences

- The zoom lock is a real accessibility tradeoff: users who rely on pinch-zoom lose it. The mitigations are required, not aspirational — body text stays relative (Tailwind's rem scale, no fixed-pixel text, so OS and browser text-size preferences keep working) and every control (theme toggle, sidebar navigation, dialogs) stays a reachable native button or link. A future change that introduces fixed-pixel text or pointer-only controls must revisit this decision first.
- Chrome and splash colors are pinned to the `--background` theme tokens (light `#e8ebed`, dark `#1a1a1a`) and guarded by the `theme-color drift` contract test — re-theming the app without updating the install surface fails the suite.
- Revisit trigger: if an accessibility audit flags the zoom lock, or if user feedback reports an access barrier from it, this decision reopens toward allowing zoom (at minimum on non-installed browser contexts) regardless of the native-app feel argument.

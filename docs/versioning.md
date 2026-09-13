# Semantic versioning

Releases are automated with [release-please](https://github.com/googleapis/release-please)
(`googleapis/release-please-action@v5`). You never edit the version by hand —
conventional commits on `main` drive everything.

Config: `release-please-config.json` (node strategy, `v`-prefixed tags) +
`.release-please-manifest.json` (tracks the last released version, currently `0.1.0`).
Workflow: `.github/workflows/release.yml`. PR-title enforcement:
`.github/workflows/pr-title.yml`.

## How it works

1. You merge PRs into `main` with conventional titles (`feat: …`, `fix: …`, …).
   The title lint (`amannn/action-semantic-pull-request@v6`) blocks non-conforming titles.
2. On every push to `main`, the release workflow scans commits since the last
   release and opens (or updates) a single release PR titled
   `chore(main): release <version>` that bumps `version` in `package.json`,
   records it in `.release-please-manifest.json`, and prepends the new section
   to `CHANGELOG.md`.
3. You review that PR like any other and merge it when you want to cut the release.
   Merging triggers the workflow again, which now creates the tag (`v0.2.0`)
   and the GitHub Release with generated notes. No release PR = no release —
   merging features just accumulates them into the next pending release PR.

## Commit type → version bump

| Commit | Bump (>= 1.0) | Bump (0.x, current) |
|---|---|---|
| `fix: …` | patch (`1.2.3 → 1.2.4`) | patch |
| `feat: …` | minor (`1.2.3 → 1.3.0`) | minor |
| `feat!: …` or `BREAKING CHANGE:` footer | major (`1.2.3 → 2.0.0`) | minor (`bump-minor-pre-major`) |
| `chore:`, `docs:`, `test:`, `refactor:`, `ci:`, … | none | none |

While the major version is `0`, anything can break compatibility — that is what
`0.x` means. The first `1.0.0` is cut manually (see below); after that,
`feat!` produces real major bumps.

Scopes are free-form (`feat(auth): …`, `fix(pwa): …`) and appear grouped in the
changelog. Keep the subject lowercase and imperative (`add …`, not `adds …`).

## Working with it day to day

- **Normal feature/fix**: open a PR with a conventional title, get review, squash-merge
  keeping the conventional title. The release PR updates itself automatically.
- **Stacking work**: merge as many PRs as you like — they all collect into the one
  open release PR. Merge the release PR whenever the batch is shippable.
- **Release PR hygiene**: it is generated — don't hand-edit the version bump, but do
  review the changelog entries. If the bump looks wrong (e.g. a breaking change
  snuck into a `fix:`), fix the originating commit message before merging, not the PR.
- **Skipping a release**: close the release PR without merging and the bot re-opens
  it on the next `main` push. Nothing is tagged until you merge.
- **Hotfix**: branch from `main`, merge a `fix: …` PR, then merge the resulting
  release PR immediately — that tags a patch (`0.1.0 → 0.1.1`).
- **Breaking change**: use `feat!: …` (or a `BREAKING CHANGE:` footer) so it stands
  out in the changelog. While `0.x` this bumps minor; after `1.0.0` it bumps major.
- **No-release commits** (`docs:`, `chore:`, `ci:`, `test:` …): safe anytime —
  they never trigger a version bump on their own.

## Cutting 1.0.0

`1.0.0` is a manual decision, not an automation event. When the template API is
stable: merge a PR titled `feat!: stabilize public API` (or any breaking marker)
and set the release PR's version to `1.0.0` — release-please accepts a manual
version edit in the release PR exactly once for this. Alternatively tag `v1.0.0`
via the GitHub UI and set `.release-please-manifest.json` to `1.0.0` so the bot
continues from there. After that, semver is strict: breaking = major.

## First run / template forks

## First run / template forks

Tags use the plain form `v0.1.0` (`include-component-in-tag: false` — a
single-package repo needs no component prefix).

One manual bootstrap is required because the changelog uses GitHub-generated
notes, and that API rejects a `previous_tag` that does not exist yet. Tag the
current baseline once, then automation takes over:

```bash
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 --title "v0.1.0" --notes "Template baseline."
```

Then re-run the release workflow (`Actions → Release → Run workflow`). From
there, the first merged conventional PR creates the first release PR
(`0.1.0 → 0.1.1` for `fix:`, `→ 0.2.0` for `feat:`). Forks and template
consumers do the same: keep the three config files as-is, make sure
`.release-please-manifest.json` matches the `version` in `package.json`
(`0.1.0` here), tag the baseline, and go.

## Notes & troubleshooting

- Auth uses `secrets.GITHUB_TOKEN` — zero setup. Consequence: pushes made by the
  bot (release PR commits, tags) do not trigger other workflows. If you need CI
  on release-please PRs, switch `token:` to a PAT secret.
- The `## [Unreleased]` section in `CHANGELOG.md` is hand-maintained and stays —
  release-please only prepends versioned sections above/below it.
- Release PR title `chore(main): release x.y.z` already satisfies the title lint.
- `workflow_dispatch` on the release workflow re-runs the scan on demand
  (e.g. after fixing a commit message or editing config).
- `private: true` in `package.json` is fine — nothing is published to npm;
  only GitHub tags + releases are created.
- `Error: Invalid previous_tag parameter` means the baseline tag is missing —
  do the one-time `git tag v0.1.0` + `gh release create` bootstrap above, then
  re-run the workflow. Do not delete release tags afterwards; the notes API
  needs them.
- `commit could not be parsed` warnings for `Merge pull request #N …` commits
  are harmless — release-please skips them and reads the PR titles instead.

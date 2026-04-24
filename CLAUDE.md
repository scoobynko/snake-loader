# Repository rules for Claude

Read this before making any change to this repo.

## Pre-push checklist

Before you push a branch (any branch), run these and make sure they all pass:

1. `npm run typecheck` — must exit 0.
2. `npm run build` — must succeed and produce `dist/index.mjs`, `dist/index.d.ts`, `dist/styles.css`.

Do not push if either fails. Fix the root cause; do not silence errors.

## Changeset rule

If the change modifies anything under `src/` that affects users of the published package (new/removed/changed prop, behavior change, bug fix that reaches runtime, CSS that changes visuals), you MUST add a changeset before opening the PR:

```
npx changeset
```

- Bump type: `patch` for bug fixes, `minor` for additive features, `major` for breaking changes to the public API (`SnakeLoader`, `SnakeLoaderProps`, `Theme`, `Colors`, `Effects`).
- Summary: one line, written from the consumer's perspective (what changed for them, not what you did internally).

Skip the changeset for: docs-only edits, CI/workflow changes, `.gitignore`, `CLAUDE.md`, internal refactors with zero observable effect, tooling config that doesn't change the tarball.

When in doubt, add one. An extra changeset is cheap; a missing one means a fix ships unversioned.

## Branch + PR flow

- `main` is protected. Never push to it directly — the ruleset will reject it.
- Work in a short-named branch (`fix/...`, `feat/...`, `chore/...`, `docs/...`).
- Open a PR with `gh pr create`. The user merges.
- After merge, the Release workflow either opens a "Version Packages" PR (if changesets are pending) or no-ops.

## Public API — do not change without the user's explicit approval

These are part of the package's public contract. Changing any of them is a major bump and needs a conversation first:

- Props: `theme`, `cellSize`, `speed`, `colors`, `effects`, `paused`, `className`, `style`, `aria-label`.
- Exports: `SnakeLoader`, `SnakeLoaderProps`, `Theme`, `Colors`, `Effects`.
- Observable behavior: 8×8 grid (`GRID_SIZE`), initial snake length of 2 (`INITIAL_LENGTH`), death flicker duration of 12 ticks (`DYING_TICKS`), weighted-random pathing with 60% straight persistence, default `cellSize: 3`, default `speed: 10`.

## Things to never do

- Do not commit `dist/` or `node_modules/`.
- Do not run `npm publish`, `npm version`, or create release tags by hand — the Release workflow owns these.
- Do not edit `.changeset/*.md` files that the "Version Packages" PR generated. They're produced by `changeset version` and deleted on release.
- Do not add runtime dependencies. This package advertises zero deps.
- Do not use `git push --force`, `git reset --hard`, or `git commit --amend` on pushed commits.

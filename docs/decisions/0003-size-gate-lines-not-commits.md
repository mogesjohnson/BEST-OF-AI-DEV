# 0003: The PR size gate counts changed lines, warns at 400 and fails at 600

Status: proposed (owner to confirm the numbers)
Date: 2026-10-25
Deciders: Grok Bot (proposed); Moges Johnson to accept or reject

## Context

Review quality drops as diffs grow, and agents produce large diffs cheaply. The owner's obsidian
WORKFLOW.md sets a 400-line PR budget that counts lockfiles, plus 6 files per PR and 200 lines or
4 files per commit, enforced only in prose. Counting commits or files punishes good history and
rewards squashing.

## Decision

We will count added plus deleted lines in `base...HEAD`, excluding lockfiles, minified files,
source maps, generated folders and byte-identical template mirrors. 400 lines prints a warning;
600 fails. An exception needs the `size-exception` label and a written reason in the PR body.

## Options considered

- **Chosen:** lines with a soft target and a hard limit.
- **Rejected:** a hard 400, as in obsidian. Honest refactors and test fixtures hit it often, and then people split PRs in ways that do not review well.
- **Rejected:** file and commit counts. They are easy to game and say nothing about review load.

## Consequences

Lockfile-only churn is not counted, so dependency bumps need their own review habit. Fixtures do count.

## Enforcement

`scripts/check/pr-size.mjs` on pre-push and in `pr-checks.yml`.

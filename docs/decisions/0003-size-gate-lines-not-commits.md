# 0003: The PR size gate counts changed lines, with one hard limit at 400

Status: accepted
Date: 2026-10-28 (proposed 2026-10-25 as warn at 400, fail at 600)
Deciders: Moges Johnson (owner); Grok Bot wrote the first proposal

## Context

Review quality drops as diffs grow, and agents produce large diffs cheaply. One of the owner's
private repos already sets a 400-line PR budget in prose, plus file-count and per-commit limits.
Counting commits or files punishes good history and rewards squashing.

The first proposal warned at 400 and failed at 600. The owner rejected it: a warning nobody has
to act on is noise, and a fail at 600 turns 400 into a suggestion. This repo's own history backs
the lower number. Recounted with this gate's rules, 4 of the first 45 merged PRs went over 400
lines (#3, #22, #23 and #38, the largest at 568), none went over 600, and the median was 110.

## Decision

We will count added plus deleted lines in `base...HEAD`, excluding lockfiles, minified files,
source maps, generated folders and byte-identical template mirrors. Over 400 fails. There is no
warning tier. Exceptions are rare and the owner's call, for something like a whole revamp: the
owner adds the `size-exception` label, and the PR body gives a written reason.

## Options considered

- **Chosen:** one hard limit at 400 lines.
- **Rejected:** warn at 400, fail at 600 (the first proposal). Two numbers, and only the larger one is real.
- **Rejected:** file and commit counts. They are easy to game and say nothing about review load.
- **Rejected (owner, 2026-10-28):** counting lockfiles. One dependency added can rewrite thousands of lockfile lines that nobody reads line by line, so every bump would need an exception.

## Consequences

About 1 PR in 11 would have needed splitting, so stacked PRs become normal. Locally, pre-push
compares against `origin/main`, so a stacked branch counts its whole stack. Push it with
`BASE_SHA=origin/<parent-branch>` until the gate learns stacks. CI already uses the PR's base.

Lockfile churn is not counted, so dependency changes rely on R3 (ask first) and CODEOWNERS.
Fixtures do count. While agents push as the owner, nothing stops an agent from adding the label.

## Enforcement

`scripts/check/pr-size.mjs` on pre-push and in `pr-checks.yml`. `hooks.test.mjs` checks that
401 lines fail. Who adds the label is honor (R8).

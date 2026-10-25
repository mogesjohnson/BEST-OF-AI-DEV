# 0004: One commit and branch convention across repos, with the issue in a footer

Status: proposed (owner to confirm)
Date: 2026-10-25
Deciders: Grok Bot (proposed); Moges Johnson to accept or reject

## Context

The owner's repos use at least three commit styles. This was checked on 2026-10-25 against the
last 12 commits on each public repo's default branch:

| Repo | Subjects | Branches |
| --- | --- | --- |
| shadow-army | Issue first, then a sentence: `#63 Keep a turn open while ...` | `<agent>/<issue>-<topic>`, e.g. `claude/63-spec-ideas` |
| shadow-docs | Same issue-first style: `#17 Fix the config key ...` | `main` only today |
| post-it-board | Free-form sentences; one squash merge ends in `(#9)` | `<type>/<topic>`, e.g. `feat/topic-folders` |
| trace-workbench | Conventional Commits without scopes: `fix: reconcile ...` | `<agent>/<topic>` plus `feat/`, `docs/`, `site/` |

The private repos are mixed in the same way. At least one tracks review findings by an ID
rather than by a GitHub issue.

The issue-first style has a real strength: every commit traces to an issue. Its costs are
that tools cannot tell a fix from a feature, changelog and release tools that read
Conventional Commits cannot use it, and agents moving between repos have to learn each
repo's style again. Any rule file that says "follow the existing style" then means
something different in every repo.

## Decision

We will use one convention everywhere:

- **Subject:** Conventional Commits with a lowercase type and scope, as in R7. GitHub's squash
  suffix `(#9)` at the end is fine.
- **Traceability:** moves into footers. Use `Refs: #63` for an issue, or `Refs: F003` or
  `Refs: code review of #3` when the source is not an issue. Add `Agent: <name>` when an
  agent wrote the commit.
- **Branches:** `<agent>/<topic>`, or `<agent>/<issue>-<topic>` when an issue exists.
  Humans use their handle in place of the agent.

The commit-msg hook points `#63 ...` subjects at the footer. It does not reject them silently.

## Options considered

- **Chosen:** Conventional Commits plus `Refs:` footers. Tools can read the type, and people
  keep the issue link.
- **Rejected:** issue-first subjects everywhere. They trace well, but tools cannot parse them
  and they use up 4-5 of the 72 characters.
- **Rejected:** a different style per repo (doing nothing). That is today's state, and it is
  why every repo's rules need a hand-written style section.

## Consequences

- `git log --oneline` no longer shows the issue number. Use
  `git log --format='%h %s %(trailers:key=Refs,valueonly)'` to see it.
- Old history stays as it is. R5 forbids rewriting it, so a repo has two styles from its
  switch-over commit onward. Record the cut-over commit in that repo's AGENTS.md.

## Migration notes

| Repo | Change |
| --- | --- |
| shadow-army, shadow-docs | Move the leading `#N` into `Refs: #N`, keep the branch names, and choose a type for each change. Merge-commit subjects are excluded from the check, so the custom `#63 Merge PR #74: ...` style can stay. |
| post-it-board | Add types to subjects and keep the `<type>/<topic>` branches, or move to `<handle>/<topic>`. |
| trace-workbench | Already compliant. Optionally add scopes and `Refs:` footers. |
| Private repos | Same steps. Map finding IDs to `Refs: <id>`. Run `template-sync` after copying the hook. |

## Enforcement

- `scripts/check/commit-format.mjs`, through the commit-msg hook and `pr-format` in `pr-checks.yml`.
- Branch names: honor only (R4).

# Keep

Habits from my repos that held up. Each one names where it came from and where it lives now.

## 1. A written review budget for PRs

**Seen in:** a private repo's workflow doc, which sets a line budget for every PR and says to
split work before going over it. shadow-army and shadow-docs also merge through many small,
numbered PRs.

**Why keep it:** small PRs are the only ones a reviewer can read in full. See
[small PRs](../docs/why/01-small-prs.md).

**In the template:** the budget is now a check, not prose. `scripts/check/pr-size.mjs` fails
above 400 changed lines, the same budget as that private repo, counting lines, never commits.

## 2. Commit-format hooks that live in the repo

**Seen in:** shadow-army and shadow-docs. Both have a `.githooks/commit-msg` script and a
`pr-format` workflow that checks the same rule.

**Why keep it:** the same rule runs locally and in CI, with nothing to install, so an agent
gets the error before it pushes.

**In the template:** `scripts/hooks/run-checks.mjs` via `core.hooksPath`, plus `pr-checks.yml`.
The format changed (see change.md, item 5), but the setup is the same idea.

## 3. Results reported at their real scope

**Seen in:** trace-workbench's RULES.md, which asks each result to be reported at the scope it
was actually checked: unit, integration, client config or live host. It also says a blocked CI
run is recorded as blocked, not passing. The repo keeps an `evidence/` folder for each alpha.

**Why keep it:** "tests pass" means little until it says which tests, and at what scope. An
agent that reports a check it didn't run makes the whole PR body harder to trust.

**In the template:** every PR body has a Validation section with `pass`, `fail`, `blocked` or
`not_run` lines, and `pr-format.mjs` rejects a body without one.

## 4. Specs with stop conditions

**Seen in:** trace-workbench's SPEC.md, which lists deliverables, an evidence contract and stop
conditions per milestone. shadow-army versions its spec and merges owner decisions into it.

**Why keep it:** the agent knows when it's done and when to stop and ask. See
[specs before code](../docs/why/05-specs-before-code.md).

**In the template:** `docs/tasks/0000-template.md` and short ADRs from
`docs/decisions/0000-template.md`.

## 5. Fetched notes are evidence, not orders

**Seen in:** trace-workbench's AGENTS.md says to treat retrieved notes as evidence and to let
the current source and project instructions govern.

**Why keep it:** this is the cheapest defense against prompt injection through issues, web
pages and logs.

**In the template:** RULES.md R14.

## 6. Pinned inputs

**Seen in:** trace-workbench pins its actions to full commit SHAs. Personal-Portfolio pins
shadow-docs as a submodule at a merged commit, so docs PRs can't change the live site by
accident.

**Why keep it:** a build that passed yesterday should pass today unless the change broke it.
See [security](../docs/why/10-security.md).

**In the template:** every workflow pins its actions to a SHA, with the release name in a
comment.

## 7. Tests next to the code

**Seen in:** Obsidian-codex-setup, post-it-board and trace-workbench all have a `tests/` folder.

**In the template:** `npm test` is the one command. It runs in the pre-push hook and in CI.

# 0001: Bootstrap BEST-OF-AI-DEV

Status: in progress
Owner: Moges Johnson
Agent: grok
Refs: none

## Problem

Each of the owner's repos carries its own copy of agent rules, hooks and CI, and they disagree:
different PR budgets, absolute personal paths in rules files, unpinned actions, and rules that
exist only as prose. There is no single place to start a new repo from.

## Outcome

A private template repo that a new project copies in one step. It holds the rules, the checks
that enforce them, a docs site explaining why each one matters, and migration notes per repo.

## Acceptance criteria

- [ ] `template/` holds AGENTS.md (canonical), vendor pointer files, RULES.md, task spec and ADR
      templates, PR and issue templates, CODEOWNERS, hooks, size check, CI and agent configs.
- [ ] `npm test` passes, and `template-sync` proves the root follows the template.
- [ ] `template/scripts/test-windows.ps1` runs under Windows PowerShell 5.1 and prints PASS/FAIL per check.
- [ ] The docs site in `site/` builds locally with `npm run build`, reusing shadow-docs' styling.
- [ ] README.md about the owner uses only verified facts; everything else is `TODO(verify)`.
- [ ] Migration notes list per-repo changes without editing those repos.

## Scope

In: this repo only.

Out: the owner's other repos (read-only); the leaked Claude Code source mirrors (never used).

## Constraints

No downloaded executables (npm packages for the docs site are fine). Every PR stays under 600
changed lines. Actions minutes are used up until 2026-11-01, so local checks are the gate.

## Plan

1. Rules, hooks, size and secret checks, CI (PRs 1 to 5).
2. Specs, ADRs, issue forms, agent configs, Windows scripts.
3. Docs site shell, then the eleven "why" pages, a few per PR.
4. Practices, migration notes, README.

## Open questions

- 400 or 600 lines as the hard limit? See ADR 0003.
- Keep zero-install hooks as the default? See ADR 0001.

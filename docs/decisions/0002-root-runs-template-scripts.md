# 0002: This repo runs template/scripts in place

Status: accepted
Date: 2026-10-25
Deciders: Grok Bot (an internal layout choice for this repo only)

## Context

The first layout kept a root copy of every script so the repo could dogfood itself. Each script
change then doubled the diff (765 lines for one PR), and the two copies could drift.

## Decision

We will keep scripts only under `template/scripts/`. Root hooks and workflows point at that path
through a `SCRIPTS` variable inside a REPO-SPECIFIC block. `template-sync.mjs --skip scripts/`
compares everything else.

## Options considered

- **Chosen:** run in place. One copy, honest diffs.
- **Rejected:** root copy plus a sync check. Doubles every diff, and the size gate then needs a mirror exception.
- **Rejected:** symlinks. Git for Windows checks them out as text files unless developer mode is on.

## Consequences

The root is not a byte-for-byte example of a fresh repo: its hooks name `template/scripts`.
Other byte-identical mirrors (docs templates, issue forms) are excluded from the size count instead.

## Enforcement

`npm test` runs `template-sync.mjs --skip scripts/`. RULES.md R20.

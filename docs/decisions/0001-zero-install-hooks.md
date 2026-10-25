# 0001: Zero-install git hooks by default, lefthook opt-in

Status: proposed (owner to confirm)
Date: 2026-10-25
Deciders: Grok Bot (proposed); Moges Johnson to accept or reject

## Context

Hooks that need a separate binary install are skipped on fresh clones and on agent sandboxes,
which is where they matter most. The owner's public shadow-docs and shadow-army repos (and one private repo)
already use `.githooks/` with `scripts/setup-hooks.mjs` and `core.hooksPath`. The agent box
cannot download executables, and lefthook refuses to install while `core.hooksPath` is set.

## Decision

We will ship `.githooks/` plus Node scripts as the default. `npm install` runs `prepare`, which
sets `core.hooksPath`. Repos that want lefthook copy `optional/lefthook.yml`, and
`setup-hooks.mjs` switches to it. If the file exists but the binary does not, it exits 1 and
keeps `.githooks/` active rather than guessing.

## Options considered

- **Chosen:** `.githooks/` + Node. Needs only git and Node, works in Git for Windows' sh.
- **Rejected:** lefthook as the default. Faster with parallel jobs, but it is one more binary per machine and agent sandbox.
- **Rejected:** husky. Same idea as `.githooks/`, plus a dependency.
- **Rejected:** no hooks, CI only. Feedback arrives minutes later and costs Actions minutes.

## Consequences

Hooks are serial, so pre-push takes as long as the test suite. Anyone can bypass them with
`--no-verify`, so CI repeats every gate (`pr-checks.yml`).

## Enforcement

`pr-checks.yml` reruns the same scripts. `template-sync.mjs` keeps the hook stubs identical.

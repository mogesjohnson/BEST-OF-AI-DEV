# 0001: Zero-install git hooks by default, lefthook opt-in

Status: accepted
Date: 2026-10-25
Deciders: Moges Johnson (owner), Grok Bot (proposed)

## Context

Hooks that need a separate binary install are skipped on fresh clones and on agent sandboxes,
which is where they matter most. The owner's shadow-docs, shadow-army and payment-splitter repos
already use `.githooks/` with `scripts/setup-hooks.mjs` and `core.hooksPath`. The agent box
cannot download executables, and lefthook refuses to install while `core.hooksPath` is set.

## Decision

We will ship `.githooks/` plus Node scripts as the default. `npm install` runs `prepare`, which
sets `core.hooksPath`. Repos that want lefthook copy `optional/lefthook.yml`, and
`setup-hooks.mjs` switches to it when both the file and the binary exist.

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

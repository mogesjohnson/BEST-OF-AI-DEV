# shadow-army

**Today:** rules live in `CLAUDE.md`, `agent.md` and `rules.md`, with no `AGENTS.md`.
`orchestratorDelegate.md` is routing policy that `src/core/` reads and tests. CI (`ci.yml`) runs `npm ci`, `tsc --noEmit`, the build and
`vitest`. `pr-format.yml` and `.githooks/commit-msg` enforce subjects that start with
`#<issue>` or `[F<n>]`. Both workflows use `actions/checkout@v4` and `actions/setup-node@v4`.

**Keep:** the CI job and the in-repo commit hook. The many small numbered PRs are the habit the
size gate now checks.

## Steps

1. **One rules file.** Merge `agent.md`, `rules.md` and the rule parts of `CLAUDE.md` into
   `AGENTS.md` and `RULES.md`. Make `CLAUDE.md` a one-line `@AGENTS.md` import. Leave
   `orchestratorDelegate.md` where it is, since the code loads it, and link it from `AGENTS.md`.
2. **Commit format.** Switch the hook and `pr-format.yml` to the template's checkers. Old
   prefixed subjects stay in history. New ones put the issue in a `Refs: #N` footer.
3. **Pin actions** to commit SHAs.
4. **Test script.** Keep `vitest run` and add the template's tests next to it.

**Risk:** step 1 changes what every agent reads in this repo. Do it alone, and run one agent
task on the new rules before step 2.

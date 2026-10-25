# shadow-docs

**Today:** a Next.js docs site, also used as a submodule in Personal-Portfolio. It has an
`AGENTS.md` (50 lines) and a separate `CLAUDE.md` (69 lines), so the two can drift. The only
workflow is `pr-format.yml` (`actions/checkout@v4`, `actions/setup-node@v4`). It checks the PR
title, body and every commit for the `#<issue>` or `[F<n>]` prefix, the same rule as
`.githooks/commit-msg`. There is a
`lint` script but no `test` script, and no workflow runs `lint` or `build`.

**Keep:** the layout and style, which this repo's own site copies. The in-repo hook.

## Steps

1. **One rules file.** Move whatever in `CLAUDE.md` isn't in `AGENTS.md` into `AGENTS.md`, then
   make `CLAUDE.md` an `@AGENTS.md` import.
2. **CI.** Add the template's `ci.yml`. It already runs `lint`, `typecheck`, `test` and
   `build` if the scripts exist, so a broken build fails the PR before it reaches the
   portfolio.
3. **Commit format** and **pinned actions**, as in the shared steps.
4. **Submodule note.** After a merge, the portfolio still points at the old commit until its
   own PR moves the pin. Say so in the PR body.

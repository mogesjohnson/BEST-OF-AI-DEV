# Personal-Portfolio

**Today:** a Next.js site with `shadow-docs` as a submodule. `CLAUDE.md` is already a one-line
`@AGENTS.md` import. There are no workflows. Commit subjects start with `[F<n>]`. The README
calls shadow-docs and trace-workbench private, but both are public now.

**Keep:** the `@AGENTS.md` import and the pinned submodule.

## Steps

1. **Fix the stale claims** in the README first. It's the page most people read.
2. **CI.** Add the template's `ci.yml`, which runs `lint` and `build`. If the build reads the
   `shadow-docs` submodule, set `submodules: true` on the checkout step.
3. **Commit format.** New commits use `type(scope): subject` with `Refs: #N`. Old `[F<n>]`
   subjects stay as they are.
4. **Secrets.** Run `scripts/check/secrets.mjs --all` once before adding the hooks, and fix
   anything it finds in a separate PR.

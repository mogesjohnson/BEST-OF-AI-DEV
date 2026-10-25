# trace-workbench

**Today:** the closest to the template. Actions are pinned to commit SHAs with version
comments. `RULES.md` asks for results at their real scope and for blocked runs to be recorded
as blocked. `evidence/` keeps a folder for each alpha. `SPEC.md` governs acceptance, and
`npm test` runs `node --test`. There is one workflow, `verify.yml`.

**Keep:** almost all of it. Several template habits came from here (see
[keep.md](../../practices/keep.md), items 3 to 6).

## Steps

1. **Add the gates it lacks:** the size and format checks (`pr-checks.yml`) and the secret
   scan in the hooks. Merge them with `verify.yml`; don't replace it.
2. **Line up the rule numbers.** Keep its rules as R20 and up, so template rules can be cited
   the same way in every repo.
3. **Agent configs.** Copy `.claude/settings.json` and `.codex/config.toml`, adding its
   `computer:*` scripts (setup, config, doctor) to the ask list, since they configure the
   local machine.

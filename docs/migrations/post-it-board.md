# post-it-board

**Today:** a static board with an MCP server and a Supabase backend. `tests/` has offline
tests (`node tests/run.mjs`, `node tests/topics.mjs`, `bash tests/workflow.sh`) and fixtures,
but there is no `package.json`, and the only workflow,
`inbox.yml`, processes commands rather than running tests. It uses `actions/checkout@v4` and
`actions/setup-node@v4`. `config.js` commits a Supabase anon key.

**Keep:** the tests folder and the MCP server's fixtures.

## Steps

1. **Run the tests in CI.** Add a minimal `package.json` whose `test` script runs the three
   offline test commands, plus the template's `ci.yml`. The browser check needs Playwright, so
   leave it out of CI for now.
2. **The anon key.** Anon keys are meant to be public, but only if row-level security is on
   for every table. Check that, write it down in `AGENTS.md`, and mark the line with a
   `gitleaks:allow` comment so the secret scan treats it as a known value, not a leak.
3. **Pin actions**, including the ones in `inbox.yml`.
4. **Rules.** Add `AGENTS.md` and `RULES.md`. The repo has neither today.

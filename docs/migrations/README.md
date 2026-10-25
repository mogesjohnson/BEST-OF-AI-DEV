# Migration notes

How to bring each of my repos onto the template. These are plans, not changes: no other repo
was edited, and each one moves on its own schedule, one small PR at a time.

The reasons behind each step are in [practices/](../../practices) and the
[why-pages](../why/index.md).

## Steps every repo shares

1. **Start a branch** off fresh `main`, for example `grok/adopt-template`. Keep each step below
   in its own PR so none goes over the 600-line gate.
2. **Rules first.** Copy `AGENTS.md`, `RULES.md`, `CLAUDE.md` and `GEMINI.md` from
   [`template/`](../../template). Fill the `<!-- REPO-SPECIFIC -->` slots, and move any rules the
   repo already has into `AGENTS.md` or numbered rules from R20 up. `CLAUDE.md` and `GEMINI.md`
   stay as one-line `@AGENTS.md` imports.
3. **Checks and hooks.** Copy `scripts/`, `.githooks/` and `.github/workflows/`. Add the
   `prepare` script from `template/package.json`. If the repo already has a `test` script, keep it
   and run the template's tests from it too (`node scripts/test/run.mjs`).
4. **Agent configs.** Copy `.claude/settings.json`, `.codex/config.toml` and `docs/agents.md`.
   Add the repo's own build and test commands to the allow list.
5. **Pin actions.** Replace every `@v4`-style tag with a full commit SHA and a version comment,
   as the template's workflows do. Update the pins by hand, or add a Dependabot config for
   `github-actions`.
6. **Fill the PR template** on the migration PR itself. That's the first real test of the
   Validation and Size sections.

On Windows, run `template\scripts\test-windows.ps1` after step 3. See
[windows.md](../../template/docs/windows.md).

## Per repo

| Repo | Visibility | Biggest gap | Notes |
| --- | --- | --- | --- |
| shadow-army | public | four rule files, no AGENTS.md | [shadow-army.md](shadow-army.md) |
| shadow-docs | public | two separate rule files; CI checks only the format | [shadow-docs.md](shadow-docs.md) |
| post-it-board | public | tests don't run in CI; committed anon key | [post-it-board.md](post-it-board.md) |
| trace-workbench | public | already close; mostly a reference | [trace-workbench.md](trace-workbench.md) |
| Personal-Portfolio | public | no CI; stale README claims | [personal-portfolio.md](personal-portfolio.md) |
| private repos | private | no CI; prose-only rules | [private-repos.md](private-repos.md) |

Order of work: Personal-Portfolio and shadow-docs first, because they are the public face.
Then shadow-army, post-it-board and the private repos. trace-workbench last, since it needs the least.

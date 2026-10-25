# BEST OF AI DEV

Moges Johnson's template and source of truth for AI-first development: the practices worth
keeping, drop-in agent rules for every new repo, and a docs site on why each practice matters.

Most of this repo was written by a coding agent through small, self-reviewed pull requests,
under the rules it ships. The repo holds itself to the same template it offers, and the gaps
are listed below instead of hidden.

## What's here

| Path | What it is |
| --- | --- |
| [`template/`](template) | Files to drop into a new repo: `AGENTS.md`, `RULES.md`, vendor imports, hooks, checks, workflows and agent configs. Repo-specific parts are marked `<!-- REPO-SPECIFIC -->`. |
| [`practices/`](practices) | A review of my own repos: [what to keep](practices/keep.md) and [what to change](practices/change.md). |
| [`docs/why/`](docs/why/index.md) | Eleven pages on why each practice exists, each with sources. |
| [`docs/migrations/`](docs/migrations) | A plan for moving each of my repos onto the template. |
| [`docs/decisions/`](docs/decisions) | Decision records for this repo, such as zero-install hooks and lines-not-commits for size. |
| [`site/`](site) | A static Next.js site that renders `docs/why/`, styled after shadow-docs. |

This repo follows its own [`AGENTS.md`](AGENTS.md) and [`RULES.md`](RULES.md), which are the
template's copies with this repo's slots filled in.

## Use it

Start a new repo from `template/`, or move an existing one with the
[shared migration steps](docs/migrations/README.md). Then fill the `REPO-SPECIFIC` slots.

On Windows (PowerShell 5.1, Node 20 or newer), check the hooks and checks from a fresh clone:

```powershell
gh repo clone mogesjohnson/BEST-OF-AI-DEV
cd BEST-OF-AI-DEV
npm install
powershell -ExecutionPolicy Bypass -File .\template\scripts\test-windows.ps1
```

`npm install` runs `prepare`, which points `core.hooksPath` at the repo's hooks. No other tools
are needed. Lefthook and gitleaks are optional extras.

## Run the docs site

```powershell
cd site
npm ci
npm run dev
```

Open http://localhost:3000. See [`site/README.md`](site/README.md) for the build and for
hosting under a subpath. The site isn't deployed yet.

## Known gaps

- **Self-merge.** R6 says writers don't merge their own PRs, but every PR here was opened and
  merged by the same account. From #25 on, each merge waited for green checks; #16, #22 and
  #23 were merged before theirs had passed. A ruleset requiring review would fix
  this. That's the owner's call, and none is set up yet.
- **Checks are advisory** until a ruleset marks `pr-checks` as required.
- **Not run here:** gitleaks, lefthook and actionlint, a live agent session against the
  configs, and the checker-change path (its `checker-change` and `size-exception` labels
  don't exist yet).
- [ADR 0004](docs/decisions/0004-commit-and-branch-names.md) on commit and branch names is
  still proposed.

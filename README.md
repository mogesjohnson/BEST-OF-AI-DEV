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

On Windows (PowerShell 5.1, Node 20.9 or newer, which the site also needs), check the hooks and checks from a fresh clone:

```powershell
gh repo clone mogesjohnson/BEST-OF-AI-DEV
cd BEST-OF-AI-DEV
npm install
powershell -ExecutionPolicy Bypass -File .\template\scripts\test-windows.ps1
```

`npm install` runs `prepare`, which points `core.hooksPath` at the repo's hooks. It needs only git
and Node (`gh` is just for the clone). Lefthook and gitleaks are optional extras.

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

## About me

I'm Moges Johnson ([@mogesjohnson](https://github.com/mogesjohnson), on GitHub since December
2023). From my [portfolio](https://github.com/mogesjohnson/Personal-Portfolio), self-reported:

- Computer Science student at Liberty University: BS in Computer Science, Software Engineering
  concentration, minor in Business, expected Spring 2028.
- Handshake AI Fellow since August 2026.
- Software Engineer Intern at NonProfitly, Inc., summer 2026.

Public projects:

- [shadow-army](https://github.com/mogesjohnson/shadow-army): a CLI that commands other AI CLIs
  with isolated context, and its docs site, [shadow-docs](https://github.com/mogesjohnson/shadow-docs).
- [trace-workbench](https://github.com/mogesjohnson/trace-workbench): shared Windows computer
  tools for AI agents, in early development.
- [post-it-board](https://github.com/mogesjohnson/post-it-board) and
  [how-to-post-it](https://github.com/mogesjohnson/how-to-post-it): a corkboard of daily notes,
  and how notes reach it.
- C++ data structures: [Binary_Search_Tree](https://github.com/mogesjohnson/Binary_Search_Tree),
  [LRU_Buffer_Pool](https://github.com/mogesjohnson/LRU_Buffer_Pool) and
  [Self_Organizing_Lists](https://github.com/mogesjohnson/Self_Organizing_Lists).

<!-- TODO(verify): Moges to confirm the bullets above and add anything the portfolio leaves out. -->

No license has been chosen yet, so all rights are reserved for now. <!-- TODO(verify): owner to pick a license. -->

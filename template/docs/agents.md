<!-- BEST-OF-AI-DEV template v1. How each coding agent finds the rules and what it may do.
     Keep this in sync with .claude/settings.json and .codex/config.toml. -->

# Agent setup

AGENTS.md is the only rules file. Every vendor file below either imports it or is read
alongside it. None of them adds rules of its own.

| Agent | Reads | Permissions live in |
| --- | --- | --- |
| Codex | `AGENTS.md` | `.codex/config.toml`, used only after you trust the project |
| Claude Code | `CLAUDE.md`, which imports `@AGENTS.md` | `.claude/settings.json`; personal overrides in `.claude/settings.local.json` (git-ignored) |
| Grok Build | `AGENTS.md` and `CLAUDE.md` in the same folder | its own settings. TODO(verify): a project-level permissions file |
| Gemini CLI, Antigravity | `GEMINI.md`, which imports `@AGENTS.md` | `.gemini/settings.json`. TODO(verify): Antigravity resolves `@` imports the way Gemini CLI does |
| Cursor | `AGENTS.md` | the editor's own settings |

## What the committed configs do

- **Claude Code** allows the repo's own check commands and read-only git. It asks before pushing,
  installing packages, `gh`, `curl`, web fetches and edits to CI, hooks, scripts or
  `package.json`. It denies reading `.env*` and key files, `--no-verify` anywhere in a command,
  `git commit -n`, force pushes (`--force*`, `-f`, `+ref`), `reset --hard`, any mention of
  `core.hooksPath`, git's `--output` and `--ext-diff` (so the read-only allows cannot write files
  or run a diff program), and `rm -rf`. The rules put `*` before the flag, so the flag's position
  does not matter. `scripts/test/agent-config.test.mjs` runs a table of commands through a model
  of the documented matcher. Change a rule and the table tells you what moved.
  Deny and ask rules apply as soon as the file is in the repo. Allow rules wait until you trust the folder.
- **Codex** runs in `workspace-write`: no writes outside the repo and no network from
  commands. Web search uses the cached index. Variables named like keys, secrets or tokens are
  stripped from the command environment; Codex's default keeps them.

## What they do not do

Deny lists are speed bumps, not a sandbox. Claude Code documents that rules do not see through
`git -C <dir> push`, `git -c key=value ...`, a full path such as `/usr/bin/git`, or a script
that runs git for the agent. Combined short flags (`git commit -anm x`) also get past the `-n`
rule. The test file keeps these as named gaps so they stay visible. Treat the list as a
statement of intent that catches honest mistakes; a PreToolUse hook can parse the command
properly if you need more. Real isolation comes from:

1. one worktree per agent, so a bad command damages one branch;
2. Codex's sandbox, or a container or VM for anything you would not run yourself;
3. server-side rules that no local config can skip: a `main` ruleset with required `pr-checks`,
   no force pushes, and a required review by an identity other than the agent's. A new repo has
   none of these until you create them, and the review rule is empty while agents push as you.

Paths outside the repo (`~/.ssh`, cloud credentials) belong in your user-level settings, not
in a committed file.

<!-- REPO-SPECIFIC: tools, MCP servers or commands this repo adds, and why. -->
<!-- /REPO-SPECIFIC -->

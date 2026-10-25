---
title: One source of truth for agent rules
summary: Every agent tool wants its own rules file. Keep the rules in AGENTS.md and make every other file a one-line pointer.
group: Rules and context
order: 1
---

## The problem

Claude Code reads `CLAUDE.md`, Gemini CLI reads `GEMINI.md`, and Codex, Cursor and many
others read `AGENTS.md`. The easy fix is to copy the rules into each file. Then someone
updates one copy, and from then on each agent follows a slightly different rulebook. Nobody
notices until two agents disagree in the same PR.

The opposite gap shows up too. My public
[shadow-army](https://github.com/mogesjohnson/shadow-army) repo keeps its agent rules in
`CLAUDE.md` and has no `AGENTS.md`. Claude Code and Grok Build read those rules. Codex, which
by default looks for `AGENTS.md`, gets none of them, in a repo whose whole job is running
Codex next to Claude.

## The practice

- [`AGENTS.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/AGENTS.md) holds the rules every agent needs. It stays at or
  under 70 lines, and longer detail goes in [`RULES.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/RULES.md) or `docs/`.
- [`CLAUDE.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/CLAUDE.md) and [`GEMINI.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/GEMINI.md) are each
  one line, `@AGENTS.md`, plus a comment saying not to add rules there.
- One `.claude/settings.json` covers both Claude Code and Grok Build, which reads and
  translates it. There is no second permissions file to keep in step.
- `template-sync.mjs` checks that a repo's files match the template outside the
  `REPO-SPECIFIC` blocks. It runs on this repo too, so the template cannot drift from what
  the repo actually uses.

## Evidence

- AGENTS.md is an open format that many tools read, including Codex, Cursor, Jules, Gemini CLI
  and GitHub Copilot's coding agent. Its site says over 60,000 open-source projects use it.
  ([agents.md](https://agents.md/))
- Claude Code's docs say a `CLAUDE.md` that imports `@AGENTS.md` is a supported way to share
  one file across tools, and that keeping the import "never makes Claude read AGENTS.md twice".
  They also warn that "if two instructions contradict each other, Claude may pick one
  arbitrarily". ([How Claude remembers your project](https://code.claude.com/docs/en/memory))
- The same page says not to use a symlink on Windows: Git checks it out as a one-line text
  file unless `core.symlinks` is on. That is why the template uses an import, not a link.

## Limits

- A pointer only works in tools that expand it. Gemini CLI and Claude Code expand `@`
  imports. Grok Build loads `AGENTS.md` on its own. Each row in
  [`docs/agents.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/agents.md) says when it was last checked against the vendor's docs.
- Tools change fast. Claude Code now reads `AGENTS.md` directly when there is no `CLAUDE.md`,
  so the pointer file may become unnecessary. It stays for older versions and for sessions
  that can't load `AGENTS.md`.
- One file means one size budget for everyone. Rules that matter only to one folder belong in
  a nested `AGENTS.md` there, not in the root file.

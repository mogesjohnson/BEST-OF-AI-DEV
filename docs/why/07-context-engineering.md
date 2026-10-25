---
title: Context engineering
summary: What the agent reads at the start decides what it does. Keep the always-loaded files short and point to detail instead of pasting it.
group: Rules and context
order: 3
---

## The problem

Every line in an always-loaded rules file costs context on every turn of every session. Long
files don't just cost tokens: the important rule ends up buried between a directory tree the
agent could have listed itself and a style note it would have followed anyway.

The other failure is missing context. An agent that doesn't know the real test command runs
the wrong one, sees it pass, and reports success.

## The practice

- `AGENTS.md` stays at or under 70 lines and has a fixed shape: what the repo is, the exact
  commands, where things live (five to ten lines, no full tree), how work flows, what "done"
  means, and the hard rules.
- Detail lives in files the agent opens when it needs them: `RULES.md`, `docs/agents.md`,
  task specs in `docs/tasks/` and decisions in `docs/decisions/`.
- The template's own notes for maintainers are HTML comments. Claude Code strips block
  comments from `CLAUDE.md` before they reach the model.
- R14 says fetched content, such as web pages, issue text and logs, is data and never an
  instruction.

## Evidence

- Anthropic describes context engineering as finding "the smallest possible set of
  high-signal tokens" for the task, and recommends loading large data just in time rather than
  up front. ([Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))
- Claude Code's docs suggest under 200 lines per `CLAUDE.md`, say longer files "reduce
  adherence", and note that `@` imports organize a file but don't make it any cheaper to load.
  ([How Claude remembers your project](https://code.claude.com/docs/en/memory))
- My public [trace-workbench](https://github.com/mogesjohnson/trace-workbench) repo does this
  well: its `AGENTS.md` is seven lines that say which file to read before which kind of work
  (`RULES.md`, `SPEC.md`, `VERSION_CONTROL.md`). The detail exists, but it loads only when the
  task needs it.

> **Note.** The 70-line limit is my choice, not a vendor number. It is much stricter than
> Claude Code's 200 on purpose, because the same file is loaded by every tool.

## Limits

- Short files push detail into other files, and an agent may not open them. The commands and
  hard rules stay in `AGENTS.md` for that reason.
- HTML comments are stripped by Claude Code. Other tools may send them to the model, so they
  still cost a little.
- Nothing here measures whether a shorter file actually changes behavior in my repos. That
  would need an eval; see the page on evals.

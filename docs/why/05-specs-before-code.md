---
title: Specs before code
summary: An agent fills every gap in a prompt with a guess. A one-page task spec and short decision records remove the guesses that matter.
group: Change and review
order: 3
---

## The problem

A prompt like "add sharing" leaves hundreds of choices open. The agent picks one for each,
quickly and confidently, and the wrong picks only show up in review, or later. When a reviewer
asks "was this meant to happen?", nothing written down answers.

Decisions decay the same way. Six months later, an agent finds an odd choice, has no record of
why it was made, and "fixes" it back.

## The practice

- Before code, copy [`docs/tasks/0000-template.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/docs/tasks/0000-template.md).
  It fits on one page: problem, outcome, checkable acceptance criteria, in and out of scope,
  constraints, and open questions. If it doesn't fit on one page, it is two tasks.
- "Open questions" must be empty before the agent starts. Anything left there is something
  to ask, not guess.
- In this repo, each PR names its task in a `Tracking:` line, and commits carry `Refs:`.
- When a choice is costly to undo, or an agent would undo it, write a record from
  [`docs/decisions/0000-template.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/docs/decisions/0000-template.md). Records
  are append-only, and a new one supersedes an old one.

## Evidence

- GitHub's Spec Kit post says agents "excel at pattern recognition but still need unambiguous
  instructions", and that a vague prompt "forces the model to guess at potentially thousands of
  unstated requirements".
  ([Spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/))
- Michael Nygard's original ADR post describes the choice a newcomer faces without the reason
  behind a decision: "blindly accept" it or "blindly change it". His fix is short records, one
  or two pages, kept in the repo.
  ([Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions), 2011)
- This repo has one task spec, [`0001-bootstrap`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/tasks/0001-bootstrap.md), that every
  PR points to. It also has four decision records. One is
  [0004](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/decisions/0004-commit-and-branch-names.md): my repos use at least three commit
  styles, so the record compares them and proposes one. It is marked "proposed" until I accept it.

## Limits

- Spec Kit's claims come from the vendor that ships it, with no measured comparison. Treat
  them as reasoning, not proof.
- A spec costs time. A typo fix or a one-line change doesn't need one. The template doesn't
  yet say where that line is, which is a gap to close.
- A spec that is wrong is worse than none, because the agent follows it faithfully. Review the
  spec before the code, and update it when the plan changes.

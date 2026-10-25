---
title: Why these practices
summary: Each page takes one practice from the template, says what problem it solves when agents write most of the code, and shows the evidence.
group: Start here
---

This site explains the `template/` folder in
[BEST-OF-AI-DEV](https://github.com/mogesjohnson/BEST-OF-AI-DEV). The template is the set of
rules, checks and configs I copy into every new repo. Each page here answers one question: why
is this rule here, and what goes wrong without it?

## How to read a page

Every page has the same four parts:

1. **The problem.** What goes wrong when agents write code without the practice.
2. **The practice.** What the template does, and which file does it.
3. **Evidence.** Sources, numbers, or what happened in my own repos. Claims I could not check
   are marked TODO(verify).
4. **Limits.** What the practice does not cover, and what it costs.

## The pages

**Change and review**

- [Small PRs and agent diffs](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/01-small-prs.md)
- [Independent review identity](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/04-review-identity.md)
- [Specs before code](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/05-specs-before-code.md)

**Rules and context**

- [One source of truth for agent rules](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/02-single-source-of-truth.md)
- [Rules enforced by tools, not just written](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/03-enforced-rules.md)
- [Context engineering](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/07-context-engineering.md)

**Verification**

- [Evals and golden tests](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/06-evals-and-golden-tests.md)
- [Agent predictability](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/11-agent-predictability.md)

**Operations**

- [Worktree isolation](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/08-worktree-isolation.md)
- [Cost and CI budget](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/09-cost-and-ci-budget.md)
- [Security](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/10-security.md)

## Where the text lives

The pages are Markdown files in [`docs/why/`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/tree/main/docs/why).
The site renders those files and has no copy of its own. A fix to a page is a normal pull
request against that folder, under the same rules as the rest of the repo.

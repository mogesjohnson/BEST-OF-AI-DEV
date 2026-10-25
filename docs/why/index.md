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

## Where the text lives

The pages are Markdown files in [`docs/why/`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/tree/main/docs/why).
The site renders those files and has no copy of its own. A fix to a page is a normal pull
request against that folder, under the same rules as the rest of the repo.

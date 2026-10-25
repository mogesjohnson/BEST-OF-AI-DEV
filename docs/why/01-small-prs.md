---
title: Small PRs and agent diffs
summary: Agents make big diffs cheap to write but not cheap to review. A hard line limit keeps every change small enough to read.
group: Change and review
order: 1
---

## The problem

An agent can write a 2,000-line change in a few minutes. Reading that change still takes a
person hours, and most people don't spend the hours. They skim it, run it once and approve it.
The cost of a big diff has not gone away. It has moved from the author to the reviewer, and
the reviewer is the one who pays it least carefully.

Big agent diffs also mix things together: the fix, a refactor the agent did on the way, a
renamed helper and some reformatting. A reviewer can't tell which lines matter.

## The practice

- Every PR is one self-contained change, with its tests.
- [`scripts/check/pr-size.mjs`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/scripts/check/pr-size.mjs)
  counts added plus deleted lines against the base branch. It warns at 400 and fails at 600.
  Lockfiles and other generated files don't count.
- It counts lines, never commits. Many small commits inside one PR are fine and make review
  easier.
- The limits can be lowered per repo with environment variables, never raised. A bigger change
  gets split, usually into "refactor first, then the change" or one PR per layer.

## Evidence

- Google's public review guide says 100 lines is "usually a reasonable size" for a change and
  1,000 is "usually too large", and asks authors to keep refactors out of feature changes.
  ([Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html))
- SmartBear's study of 2,500 reviews at Cisco found that reviewers found fewer defects per line
  once a review went past 200 to 400 lines, and that review quality dropped after about an
  hour. Its advice is 100 to 300 lines per sitting.
  ([case study, PDF](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf))
- This repo was built under the same gate: every PR is under 600 lines, and each one was
  reviewed and fixed in follow-up commits before merging. The PR list on GitHub is the record.

> **Caution.** The Cisco study is old (published 2006), run by a company that sells review
> tools, and covers one team. Read the numbers as a rough limit, not a law. The 400 and 600
> lines in the template are my own choice based on it, not a measured optimum.

## Limits

- Line count is a proxy. A 50-line change to auth code can need more care than 500 lines of
  docs. The gate stops the worst case; it does not judge risk.
- Splitting has a cost: more PRs, more waiting, and stacked branches to keep up to date. Google's
  guide suggests stacking changes so the author is not blocked while waiting.
- Generated files are excluded by pattern. A repo with other generated code has to add its
  own patterns, or that code will count.

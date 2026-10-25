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
  Lockfiles, minified files, source maps and `generated/` folders don't count.
- It counts lines, never commits. Many small commits inside one PR are fine and make review
  easier.
- Environment variables can lower the limits for one repo, never raise them. A bigger change
  gets split, usually into "refactor first, then the change" or one PR per layer. The only way
  past 600 is a `size-exception` label plus a written reason in the PR body, so the exception
  is visible to the reviewer.

## Evidence

- Google's public review guide says 100 lines is "usually a reasonable size" for a change and
  1,000 is "usually too large", and asks authors to keep refactors out of feature changes.
  ([Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html))
- SmartBear's study of 2,500 reviews at Cisco found that reviewers found fewer defects per line
  once a review went past 200 to 400 lines, and that review quality dropped after about an
  hour. Its advice is 100 to 300 lines per sitting.
  ([case study, PDF](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf))
- This repo was built under the same gate: every PR is under 600 lines and was self-reviewed
  before merging, with fixes added as follow-up commits. The PR list on GitHub is the record.
  Self-review is weaker than a second reviewer; see the page on review identity.

> **Caution.** The Cisco study is old (published 2006), run by a company that sells review
> tools, and covers one team. Read the numbers as a rough limit, not a law. The 400 and 600
> lines in the template are my own choice based on it, not a measured optimum.

## Limits

- Line count is a proxy. A 50-line change to auth code can need more care than 500 lines of
  docs. The gate stops the worst case; it does not judge risk.
- Splitting has a cost: more PRs, more waiting, and stacked branches to keep up to date. Google's
  guide suggests stacking changes so the author is not blocked while waiting.
- Generated files are excluded by pattern. A repo whose generated code lives somewhere else has
  to add its own patterns in the `REPO-SPECIFIC` block, or that code will count.

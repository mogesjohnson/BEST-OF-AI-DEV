---
title: Independent review identity
summary: A review only counts if someone other than the writer does it. When every agent pushes as you, GitHub can't tell writer from reviewer, so the template says so plainly.
group: Change and review
order: 2
---

## The problem

An agent that reviews its own diff shares the blind spots that produced it. It reads the code
it meant to write, not the code it wrote. A second session of the same model helps a little.
A second session that can't edit files, reads only the diff and the spec, and has to name a
file and line for each problem helps more.

The identity problem is quieter. If every agent uses the owner's GitHub login, GitHub sees one
person who opens, approves and merges everything. Rules that need "someone else" to approve
have nobody to wait for.

## The practice

- [R6](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/RULES.md): writers don't review, and reviewers don't write. Review runs in
  a separate, read-only session.
- The PR template asks the author for evidence (commands and their results) and a review
  checklist, so the reviewer checks claims instead of rebuilding context.
- [`CODEOWNERS`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/.github/CODEOWNERS) lists the sensitive paths, and its header
  says it protects nothing until reviews come from a second identity.
- The end state is a separate reviewer account or GitHub App, plus a ruleset that requires an
  approval from someone other than the last pusher.

## Evidence

- GitHub's docs say "pull request authors cannot approve their own pull requests"
  ([Approving a pull request with required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews)).
  A ruleset can also require "an approval from someone other than the last person to push"
  ([Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)).
- The same page names the problem for agents. One required approval "usually means two people
  are involved", and "that assumption doesn't hold" when Copilot opens a PR under its own app
  identity, so GitHub adds an extra approval by default.
- My public [shadow-army](https://github.com/mogesjohnson/shadow-army) repo already splits the
  roles in its prompts: one agent may review but not fix, and another may build but never
  review. That is the right split. The missing piece is an identity that GitHub can enforce.

> **Disclosure.** Every PR in this repo so far was written, self-reviewed and merged by one
> agent pushing as the owner's account. The self-reviews did find real bugs, which were fixed
> as follow-up commits with `Refs: #N`. But that is the weak form of review this page warns
> about, and R6 is labeled "Enforced by: honor" for that reason.

## Limits

- A second identity costs setup: a bot account or GitHub App, its token, and a ruleset. For a
  solo side project, a separate read-only session may be enough.
- Two models can share a blind spot. A different vendor or a human catches more for risky
  changes such as auth, payments and CI.
- Required reviews slow merges. Keep PRs small (see the small-PRs page) so the wait stays short.

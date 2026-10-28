---
title: Agent predictability
summary: The same task should give the same kind of result every time. Make the setup deterministic, so the only thing left to vary is the model.
group: Verification
order: 2
---

## The problem

Ask an agent the same thing twice and you can get two different branches, commit styles and
test commands. Some of that comes from the model. Much of it comes from the setup: rules that
differ by vendor file, commands that exist only in someone's head, and checks that run in CI
but not locally. Every one of those is a choice the agent makes again on each run.

## The practice

- **One source of rules.** AGENTS.md is canonical. `CLAUDE.md` and `GEMINI.md` only import it, and
  tools that read AGENTS.md directly get the same text. See
  [single source of truth](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/02-single-source-of-truth.md).
- **One definition of "done".** AGENTS.md lists the exact commands, and CI runs those commands
  and nothing else. A rule says one thing; the hook checks the same thing.
- **Fixed shapes.** Branch names, Conventional Commits with an `Agent:` trailer, the PR body's
  sections, and the task and ADR templates make every run's output look the same. A reviewer
  can then spot a missing section at a glance.
- **Tools over choices.** The commit-msg hook, size gate and format checks reject a bad
  result outright, so the agent doesn't have to remember to avoid it.
- **Pinned inputs.** Lockfiles, the two Node versions in `ci.yml` (R16), and SHA-pinned actions keep yesterday's
  passing run from failing today for reasons outside the change.

## Evidence

- Anthropic's eval guide says "agent behavior varies between runs" and separates pass@k (at
  least one of k tries succeeds) from pass^k, "the probability that all k trials succeed".
  As k grows, the two "tell opposite stories". pass^k matters "where users expect reliable
  behavior every time".
  ([Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents))
- A pass^k target is easier to hit when there are fewer places a run can differ. Each fixed
  shape above removes one such place.
- In this repo, `pr-format.mjs` checks every PR's title, body sections and commits, and the
  commit-msg hook checks each commit before it exists. A PR missing its Validation section
  fails the check, so the agent can't leave it out.

## Limits

- Fixed shapes make output consistent, not correct. A well-formed PR can still be wrong,
  which is why review and tests stay.
- The model still varies. Nothing in this template measures pass^k for real agent runs.
  That would take an eval harness with repeated trials.
- Too much structure costs context. Each rule competes for the agent's attention, as
  [context engineering](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/why/07-context-engineering.md)
  explains, so keep only the shapes that a check enforces.

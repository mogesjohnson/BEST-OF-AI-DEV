---
title: Evals and golden tests
summary: When agents edit the rules and the checks, the checks need tests of their own. Test what a run leaves behind, not what it prints.
group: Verification
order: 1
---

## The problem

An agent that changes a check also decides whether the check still works. If the test only
looks at the check's source, for example "the deny list contains this string", any
rewrite that keeps the string passes, even when the rule stops matching anything.

Output tests have the same weakness. A script can print "kept" and still delete the file.
An agent reads the output, sees what it expected, and moves on.

## The practice

- **Behavior tables over string checks.** `scripts/test/agent-config.test.mjs` runs a table
  of real commands through a model of Claude Code's documented matcher. It asserts deny, ask
  or allow for each one. A rule edit that changes any outcome fails with the command's name.
- **Named gaps.** Commands the rules are known to miss sit in their own "known gaps" test. If
  a gap closes, the test fails, and the docs get updated in the same PR.
- **Test the file that runs.** The PR gates' logic lives in `scripts/check/gate.mjs`, not in
  workflow shell. `gate.test.mjs` runs that file in scratch repos, on Windows and Linux, and
  checks that every step in `pr-checks.yml` goes through it, so the workflow can't drift away
  from its test.
- **Outcome over output.** The worktree cleanup self-test checks that `.env` still exists on
  disk after `-Apply`, not only that the log says "keep".
- **Real fixtures for gate exemptions.** The revert exemption is tested with a real
  `git revert` in a scratch repo, so the test uses the message git actually writes.
- All of this runs in `npm test`, locally and in CI, in a few seconds. A slow suite gets
  skipped.

## Evidence

- Anthropic's eval guide separates the transcript from the outcome. A booking agent might say
  "Your flight has been booked", but "the outcome is whether a reservation exists in the
  environment's SQL database". It also says regression evals "should have a nearly 100% pass
  rate", so any drop means something broke.
  ([Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), Jan 2026)
- In this repo, the first agent-config test checked rule strings. A code review found that
  moving a flag later in the command, as in `git commit -m x --no-verify`, got past every deny
  rule while the test stayed green. PR #20 replaced the string checks with the behavior table.
- PR #29 later narrowed the `core.hooksPath` rule. The same table showed that every old
  bypass was still denied, and that `git config --get core.hooksPath` had moved from deny to
  allow.
- Before PR #27, the Windows self-test ran the cleanup script only as a dry run, with no
  ignored files in the fixtures. It passed. A review of the script found that `-Apply` would
  delete a `.env`. The new test runs `-Apply` and checks the disk afterwards.

## Limits

- The matcher is a model of the documented rules, not Claude Code itself. If the real
  matcher behaves differently, the table won't notice. A live session test would, and this
  repo has none yet.
- These are deterministic tests of deterministic scripts. Evaluating the agents themselves
  takes repeated trials and graders, which this template doesn't include.
- A table only covers the cases someone thought to write down. The named-gaps list admits
  that; it doesn't fix it.

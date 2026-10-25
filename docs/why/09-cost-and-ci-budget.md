---
title: Cost and CI budget
summary: Agents push often, so each push should cost seconds. Run checks locally first, filter CI by path, cancel stale runs, and cap every job's time.
group: Operations
order: 2
---

## The problem

A person pushes a few times a day. An agent that fixes review comments one by one can push a
dozen times an hour, and each push starts every workflow. A slow suite then wastes minutes
and money. It also teaches the agent to wait on CI rather than run the checks itself.

## The practice

- **Local first.** The same `npm test` runs in the pre-push hook and in CI. Usually CI just
  confirms what the hook already showed, so a red CI run is rare and worth reading.
- **Path filters.** `ci.yml` skips PRs that touch only Markdown and docs. `site.yml` runs only
  when `site/`, `docs/why/` or the workflow itself changes. `pr-checks.yml` has no filter,
  because it checks the title, body, commits and size, which every PR has.
- **Cancel stale runs.** Every workflow has a `concurrency` group with
  `cancel-in-progress: true`, so a new push stops the run for the old one.
- **Cap every job.** `timeout-minutes` is 5 for the gates, and 10 for the tests and the
  site build. A hung job fails
  fast and doesn't burn the default six hours.
- **Required checks must always run.** Only `pr-checks` should be required. A path-filtered
  workflow that's required leaves skipped PRs waiting forever, which is why `ci` and `site`
  say so in a comment.
- **Standard runners only.** Hosted Windows and macOS builds are available on demand
  (`workflow_dispatch` with an `os` input), not on every push.

## Evidence

- GitHub's billing docs: "GitHub Actions usage is free for self-hosted runners and for public
  repositories that use standard GitHub-hosted runners." Larger runners "are always charged
  for, even when used by public repositories". Private repositories use a monthly quota of
  minutes.
  ([GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions))
- In this repo, recent runs took 7 to 12 seconds for `pr-checks` and 9 to 17 seconds for `ci`.
  `site` took 27 to 45 seconds, and it ran only on the PRs that touched the site. Two `site`
  runs were cancelled when a newer push came in, as intended.
- While this repo was private, Actions runs were blocked on billing, and the local hooks were
  the only gate. Work continued because the checks did not live only in CI.

## Limits

- Path filters trust that the paths are right. If a page outside `docs/why/` starts
  affecting the site build, `site` won't run until someone updates the filter.
- Cancelling runs means a PR's history shows cancelled runs. Look at the latest run, not
  the count.
- Free minutes don't make the local machine free. The pre-push hook adds a few seconds to
  every push, and a slow test suite would cost the same time there.

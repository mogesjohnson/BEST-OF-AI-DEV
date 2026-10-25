# Change

Habits from my repos that cost time or trust once agents did most of the work. Each one names
what replaces it and what the replacement costs.

## 1. Rules spread over several files

**Seen in:** shadow-army has `CLAUDE.md`, `agent.md`, `rules.md` and `orchestratorDelegate.md`,
and no `AGENTS.md`. Each agent tool reads a different subset.

**Why change:** two copies of a rule drift, and an agent follows whichever copy it loaded.

**Instead:** `AGENTS.md` is the only source. `CLAUDE.md` and `GEMINI.md` contain one import
line. See [single source of truth](../docs/why/02-single-source-of-truth.md).

**Cost:** one migration PR per repo, and vendor-only settings still need their own files.

## 2. Rules written only as prose

**Seen in:** several repos, including private ones, keep important rules (size budgets,
branch rules, what never to commit) in Markdown with no hook or check behind them.

**Why change:** an agent treats prose as a strong suggestion. It follows it most of the time,
but not when the context is full or the rule is far from the task.

**Instead:** each rule in `RULES.md` ends with an *Enforced by:* line. "Honor" is allowed, but
it has to be written down, so the weak spots are visible. See
[tools vs written rules](../docs/why/03-enforced-rules.md).

## 3. Absolute machine paths in tracked files

**Seen in:** one private repo, where a large share of tracked files contain the owner's
Windows home path.

**Why change:** the repo only works on one machine, it leaks a username, and agents copy the
paths into new files.

**Instead:** use repo-relative paths, and placeholders such as `@@HOME@@` in docs.
`scripts/check/secrets.mjs` rejects personal Windows, macOS and Linux home paths at
commit time.

## 4. Actions pinned to a tag

**Seen in:** post-it-board, shadow-army and shadow-docs use `actions/checkout@v4` and
`actions/setup-node@v4`.

**Why change:** a tag can be moved, and in the tj-actions incident it was. These are
first-party actions, so the risk is low, but the habit carries over to third-party ones.

**Instead:** use full commit SHAs with the release in a comment, as trace-workbench already
does.

**Cost:** pins need updating by hand or by Dependabot.

## 5. Tracker-prefix commit subjects

**Seen in:** shadow-army and shadow-docs require `#<issue> <action>` or `[F<n>] <action>`, and
Personal-Portfolio uses `[F<n>]`.

**Why change:** the link to the issue is worth keeping, but the subject can't say what kind of
change it is. That makes `git log` hard to filter and changelogs hard to generate. This one is
a judgement call, not a defect.

**Instead:** use Conventional Commits (`fix(scope): …`) with the issue in a `Refs: #N` footer.
The commit-msg hook checks the subject and rejects subjects that start with an issue number or
use closing keywords.

## 6. Claims that go stale

**Seen in:** Personal-Portfolio's README describes the shadow-docs submodule and
trace-workbench as private. Both repos are public now.

**Why change:** agents read the README as fact and repeat it, so a stale line spreads to new
docs and PRs.

**Instead:** put the date next to any claim about state ("as of …"), keep checked facts in one
file, and mark anything unchecked as TODO(verify). The README here follows that rule.

## 7. No CI at all

**Seen in:** Personal-Portfolio has no workflows, and neither do two private desktop app
repos.

**Why change:** without CI, "it passed on my machine" is the only evidence, and agents can't
see a red check.

**Instead:** use the template's `ci.yml`. It runs one `npm test`, filtered by path, in about
10 seconds. Public repos run it for free. See [cost and CI budget](../docs/why/09-cost-and-ci-budget.md).

## 8. Keys committed without a note

**Seen in:** post-it-board commits a Supabase anon key in several files.

**Why change:** that key is designed to be public, but only with row-level security on. A
reader, human or agent, can't tell whether that choice was deliberate, and the next key might
not be safe to publish.

**Instead:** the secret scan flags it. Keep it with a `gitleaks:allow` comment that says why
it's safe, and document the RLS policy.

## 9. Merging my own agents' PRs as the only review

**Seen in:** in shadow-army, shadow-docs, post-it-board, trace-workbench and
Personal-Portfolio, the account that opened each merged PR also merged it. This repo does the
same. RULES.md R6 asks for review by someone other than the writer, and this repo's own PRs
break that rule. See
[review identity](../docs/why/04-review-identity.md).

**Instead:** use a ruleset that requires one approval from a code owner, plus a second agent
or person as the reviewer. That ruleset isn't set up yet. It's the owner's decision.

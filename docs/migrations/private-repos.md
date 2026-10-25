# Private repos

replay-studio, switchyard and Obsidian-codex-setup. These notes are deliberately general: the repos are private, so nothing here quotes them or links into them.

**Today, in general terms:**
- None of the three has a workflow.
- One keeps its rules as prose in a workflow doc. That doc includes a line budget for every PR,
  which is a good rule with nothing enforcing it. The same repo refers to absolute paths on a
  single machine, which break on any other checkout.
- One desktop app repo was published as a single commit, so its history says little about how
  it was built.

## Steps

1. **Paths first.** Replace machine paths with paths relative to the repo, or with environment
   variables listed in `AGENTS.md`. Run the secret scan, which also flags user-profile paths.
2. **Turn the written budget into the size gate.** `pr-size.mjs` warns at 400 and fails at 600.
   `PR_SIZE_TARGET` and `PR_SIZE_LIMIT` can lower those numbers but not raise them.
3. **Add CI**, even if it starts with only the format and size gates. A green check on a private
   repo still costs Actions minutes, so keep jobs short (see
   [cost and CI budget](../why/09-cost-and-ci-budget.md)).
4. **From now on, small PRs.** Old history stays as it is. New work goes through PRs, so the
   next person can see how it was built.

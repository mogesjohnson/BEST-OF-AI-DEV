---
title: Rules enforced by tools, not just written
summary: An agent reads a rule as a suggestion. Every rule in the template names what enforces it, and "honor" is an honest answer, not a default.
group: Rules and context
order: 2
---

## The problem

A rules file is part of the prompt. The model weighs it against everything else it has read,
and it can lose that weighing: late in a long session, after a tool error, or when a fetched
web page says something different. A rule that only lives in prose holds until the first time
it is inconvenient.

The opposite mistake is just as common: a rules file that says "CI enforces this" when no CI
job or ruleset does. The reader trusts a gate that isn't there.

## The practice

Every rule in [`RULES.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/template/RULES.md) ends with *Enforced by:* and names the tool,
or says "honor" when nothing but the text enforces it. Then the template moves rules from honor
to tools where it can:

| Rule | Tool |
| --- | --- |
| Commit format | `.githooks/commit-msg` and the `pr-checks` workflow |
| PR size | `pr-size.mjs` on pre-push and in `pr-checks` |
| No secrets or personal paths | `secrets.mjs` on pre-commit and in CI, gitleaks when installed |
| No force-push or `--no-verify` from an agent | deny rules in `.claude/settings.json` |
| Template and root in sync | `template-sync.mjs` in `npm test` |

The hooks need no install step beyond `node scripts/setup-hooks.mjs`, which sets
`core.hooksPath`. Lefthook is optional.

## Evidence

- Claude Code's docs say `CLAUDE.md` is "context, not enforced configuration", and that to
  block an action "regardless of what Claude decides" you use settings or a hook instead.
  ([How Claude remembers your project](https://code.claude.com/docs/en/memory))
- While this repo was being built, the commit hook rejected an agent's commit for a
  73-character subject. The 72-character rule is in `AGENTS.md`, which the agent had read.
  The hook caught what the prose did not.
- A behavior test of the deny rules found that a prefix pattern like `git push --force*`
  missed `git push origin --force`. The fix and the remaining gaps are in
  [`docs/agents.md`](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/agents.md). Without the test, the rules would have looked fine.

## Limits

- Local hooks can be skipped with `--no-verify`, and deny rules don't see through
  `git -C`, scripts or full binary paths. They are speed bumps. Only a server-side ruleset
  is a wall, and this repo does not have one yet; `RULES.md` says so.
- CI gates only block a merge if a ruleset marks them required. Until then they are
  advisory, and the rules say that too.
- Some rules can't be checked by a tool, such as "stay inside the task". Those stay honor
  rules, and a reviewer checks them.

---
title: Security
summary: Agent-written code fails security checks often, and agents run with your credentials. Scan every commit, pin every action, and keep secrets out of reach rather than trusting rules.
group: Operations
order: 3
---

## The problem

Code that works isn't necessarily safe. An agent also runs on your machine as you: it can
read `.env`, print a token into a log, or add a third-party action that later changes under
you. Written rules ("never commit secrets") only cover the cases the agent remembers.

## The practice

- **Scan before the commit exists.** `scripts/check/secrets.mjs --staged` runs in the
  pre-commit hook and checks the added lines and file names. It covers private keys; AWS,
  GitHub, OpenAI, Anthropic, xAI, Google, Slack and Stripe keys; JWTs; and personal home
  paths. CI runs `--all` on every PR. gitleaks runs locally when it's installed.
- **Never print the secret.** Findings name the file, line and rule, never the value, so the
  scan can't leak what it finds.
- **Pin actions to a full commit SHA**, with the release name in a comment. Set
  `persist-credentials: false` on checkout and `permissions: contents: read` by default.
- **No third-party actions in the gates.** The checks are plain Node scripts in the repo, so
  a compromised marketplace action can't touch them.
- **Deny reading secrets.** The Claude Code settings deny `Read` of `.env`, `.pem` and `.key`
  files. They also deny `git show`, `git log` and `git diff` of those paths, and git output
  redirected to files. See
  [docs/agents.md](https://github.com/mogesjohnson/BEST-OF-AI-DEV/blob/main/docs/agents.md).
- **Fetched text is data** (RULES.md R14). Commands suggested by a web page, an issue or a log
  aren't run.

## Evidence

- Veracode tested over 100 models on 80 tasks that could be written safely or unsafely. In
  45% of cases, the model added a known OWASP Top 10 flaw. Newer and larger models didn't
  do significantly better.
  ([2025 GenAI Code Security Report](https://www.veracode.com/resources/analyst-reports/2025-genai-code-security-report/))
- In March 2025, attackers moved many version tags of `tj-actions/changed-files` to a
  malicious commit (CVE-2025-30066). The action was used by over 23,000 repositories, and the
  commit printed CI secrets into workflow logs. Workflows pinned to a full commit SHA kept
  running the code they had reviewed.
  ([GitHub advisory](https://github.com/tj-actions/changed-files/security/advisories/GHSA-mw4p-6x4p-x5m5),
  [NVD](https://nvd.nist.gov/vuln/detail/cve-2025-30066))
- One of the owner's public repos commits a Supabase anon key. That key is designed to ship
  to browsers, so it is safe only when row-level security is on. The scanner flags it as a
  JWT anyway, so the choice has to be deliberate, with a `gitleaks:allow` comment.
- A review of this repo's allow list found that read-only git commands could still print
  `.env`, for example `git show HEAD:.env` or `git diff --no-index`. PR #29 closed both gaps
  and added them to the deny table.

## Limits

- Deny rules are speed bumps. An agent that can run `node` or `python` can read any file.
  Real protection means keeping secrets off the machine, or running in a sandbox that lacks
  them.
- The built-in patterns are a short list. gitleaks covers far more, but CI doesn't install
  it, and that's a deliberate choice to avoid a third-party action. Install it locally.
- Scanning stops new leaks, not old ones. Removing a secret from the tip leaves it in git
  history, so rotate the secret. Don't count on rewriting history.
- None of this finds the OWASP-style flaws Veracode measured. That takes code review, tests
  and a static analyzer for your language.

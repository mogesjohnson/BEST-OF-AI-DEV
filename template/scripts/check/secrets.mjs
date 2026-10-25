#!/usr/bin/env node
// BEST-OF-AI-DEV template v1. Secret and personal-path scan (RULES.md R12).
//
//   node scripts/check/secrets.mjs --staged   added lines in the index (pre-commit)
//   node scripts/check/secrets.mjs --all      every tracked file as checked out (CI)
//
// Uses gitleaks when it is on PATH, and always runs the built-in patterns below,
// because gitleaks does not know about personal paths. A line ending in a
// "gitleaks:allow" comment is skipped by both. Exit 0 clean, 1 findings, 2 git error.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PATTERNS = [
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/],
  ['OpenAI or Anthropic key', /\bsk-(ant-|proj-)?[A-Za-z0-9_-]{32,}/],
  ['xAI key', /\bxai-[A-Za-z0-9]{40,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Stripe live key', /\b[rs]k_live_[A-Za-z0-9]{20,}/],
  ['JWT (Supabase keys are JWTs too)', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/],
  ['personal Windows path', /\b[A-Za-z]:[\\/]+Users[\\/]+(?!(Public|Default|<|\.\.\.|…|%))[^\\/\s"'`<>]+/i],
  ['personal home path', /(?<![\w.])\/(Users|home)\/(?!(runner|node|user|<|\.\.\.|…|\$))[a-z][\w.-]+\//],
];
export const BAD_FILES = [/(^|\/)\.env(\.(?!example$|sample$|template$)[\w.-]+)?$/, /\.(pem|p12|pfx|key)$/, /(^|\/)id_(rsa|ed25519|ecdsa)$/];
const ALLOW = /gitleaks:allow/;

/** Returns findings for one file's lines: { file, line, rule }. Never returns the secret itself. */
export function scanLines(file, lines) {
  const findings = [];
  if (BAD_FILES.some((re) => re.test(file))) findings.push({ file, line: 0, rule: 'file that should never be committed' });
  lines.forEach(([no, text]) => {
    if (ALLOW.test(text)) return;
    for (const [rule, re] of PATTERNS) if (re.test(text)) findings.push({ file, line: no, rule });
  });
  return findings;
}

/** Parses `git diff --cached -U0` into Map(file -> [[lineNo, text]]) of added lines. */
export function addedLines(diff) {
  const files = new Map();
  let file = null;
  let no = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line === '+++ /dev/null' ? null : line.slice(6);
      if (file) files.set(file, []);
    } else if (line.startsWith('@@')) {
      no = Number(/\+(\d+)/.exec(line)[1]);
    } else if (file && line.startsWith('+')) {
      files.get(file).push([no++, line.slice(1)]);
    }
  }
  return files;
}

const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

function collect(mode) {
  if (mode === '--staged') return addedLines(git(['-c', 'core.quotePath=false', 'diff', '--cached', '-U0', '--no-color', '--no-ext-diff', '--diff-filter=ACMR']));
  const files = new Map();
  for (const file of git(['ls-files', '-z']).split('\0').filter(Boolean)) {
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { continue; } // deleted in the worktree
    if (text.includes('\0')) { files.set(file, []); continue; } // binary: check the name only
    files.set(file, text.split('\n').map((t, i) => [i + 1, t]));
  }
  return files;
}

function gitleaks(mode) {
  const args = mode === '--staged' ? ['git', '--pre-commit', '--staged', '--redact', '--no-banner'] : ['git', '--redact', '--no-banner'];
  const r = spawnSync('gitleaks', args, { stdio: 'inherit' });
  if (r.error) return 'missing';
  return r.status === 0 ? 'pass' : 'fail';
}

function main(argv) {
  const mode = argv[0];
  if (mode !== '--staged' && mode !== '--all') {
    console.error('secrets: usage: node scripts/check/secrets.mjs --staged|--all');
    return 2;
  }
  let files;
  try { files = collect(mode); } catch (err) { console.error(`secrets: git failed: ${err.message.split('\n')[0]}`); return 2; }
  const findings = [...files].flatMap(([file, lines]) => scanLines(file, lines));
  for (const f of findings) console.error(`secrets: ${f.file}${f.line ? `:${f.line}` : ''}: ${f.rule}`);
  const leaks = process.env.SECRETS_SKIP_GITLEAKS ? 'skipped' : gitleaks(mode);
  if (leaks === 'missing') console.log('secrets: gitleaks not on PATH; built-in patterns only. Install it for full coverage.');
  const ok = findings.length === 0 && leaks !== 'fail';
  console.log(`secrets: ${ok ? 'pass' : 'fail'} (${files.size} files, built-in findings: ${findings.length}, gitleaks: ${leaks})`);
  if (!ok) console.error('secrets: remove the value and rotate it if it was real. Mark a known test value with a gitleaks:allow comment.');
  return ok ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  process.exitCode = main(process.argv.slice(2));
}

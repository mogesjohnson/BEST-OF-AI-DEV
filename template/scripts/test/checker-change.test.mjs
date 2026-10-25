// BEST-OF-AI-DEV template v1. Run with: node scripts/test/run.mjs
// Runs the "Use the checkers from the base commit" step of pr-checks.yml in a scratch repo,
// so the checker-change path (RULES.md R15) is tested, not just described.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withoutGitEnv } from '../lib/git-env.mjs';

const workflow = fileURLToPath(new URL('../../.github/workflows/pr-checks.yml', import.meta.url));
const skip = process.platform === 'win32' && 'needs bash; this step only runs on Linux runners';

function stepScript() {
  const lines = readFileSync(workflow, 'utf8').split(/\r?\n/);
  const start = lines.findIndex((l) => l.includes('name: Use the checkers from the base commit'));
  const run = lines.findIndex((l, i) => i > start && l.trim() === 'run: |');
  const out = [];
  for (const l of lines.slice(run + 1)) {
    if (l.trim() && !l.startsWith(' '.repeat(10))) break;
    out.push(l.slice(10));
  }
  return out.join('\n');
}

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: withoutGitEnv() });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
}

function scratch(changeChecker) {
  const dir = mkdtempSync(join(tmpdir(), 'bod-cc-'));
  git(dir, 'init', '-q');
  git(dir, 'config', 'user.email', 'test@example.invalid');
  git(dir, 'config', 'user.name', 'test');
  mkdirSync(join(dir, 'scripts', 'check'), { recursive: true });
  writeFileSync(join(dir, 'scripts', 'check', 'pr-size.mjs'), '// v1\n');
  git(dir, 'add', '.');
  git(dir, 'commit', '-qm', 'base');
  const base = git(dir, 'rev-parse', 'HEAD');
  const file = changeChecker ? join(dir, 'scripts', 'check', 'pr-size.mjs') : join(dir, 'README.md');
  writeFileSync(file, '// v2\n');
  git(dir, 'add', '.');
  git(dir, 'commit', '-qm', 'head');
  return { dir, base, head: git(dir, 'rev-parse', 'HEAD') };
}

function pick({ changeChecker, labels, body }) {
  const repo = scratch(changeChecker);
  const envFile = join(repo.dir, 'github-env');
  writeFileSync(envFile, '');
  try {
    const r = spawnSync('bash', ['-e', '-c', stepScript()], {
      cwd: repo.dir,
      encoding: 'utf8',
      env: {
        ...withoutGitEnv(),
        BASE_SHA: repo.base,
        HEAD_SHA: repo.head,
        SCRIPTS: 'scripts',
        RUNNER_TEMP: join(repo.dir, 'tmp'),
        GITHUB_ENV: envFile,
        PR_LABELS: labels,
        PR_BODY: body,
      },
    });
    return { status: r.status, checks: readFileSync(envFile, 'utf8').trim(), out: r.stdout + r.stderr };
  } finally {
    rmSync(repo.dir, { recursive: true, force: true });
  }
}

test('without the label, the base copy runs even when the PR changes a checker', { skip }, () => {
  const r = pick({ changeChecker: true, labels: '', body: 'Checker change: loosen it' });
  assert.equal(r.status, 0, r.out);
  assert.match(r.checks, /tmp\/base\/scripts\/check$/);
});

test('label, line and checker diff together run the PR copy', { skip }, () => {
  const r = pick({ changeChecker: true, labels: 'docs,checker-change', body: 'x\nChecker change: tighten it' });
  assert.equal(r.status, 0, r.out);
  assert.equal(r.checks, 'CHECKS=scripts/check');
});

test('the label without a Checker change line fails', { skip }, () => {
  const r = pick({ changeChecker: true, labels: 'checker-change', body: 'no reason given' });
  assert.notEqual(r.status, 0);
  assert.equal(r.checks, '');
});

test('the label on a PR that changes no checker fails', { skip }, () => {
  const r = pick({ changeChecker: false, labels: 'checker-change', body: 'Checker change: nothing' });
  assert.notEqual(r.status, 0);
  assert.equal(r.checks, '');
});

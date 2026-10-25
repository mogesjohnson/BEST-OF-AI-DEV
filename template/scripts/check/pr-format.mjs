#!/usr/bin/env node
// BEST-OF-AI-DEV template v1. Checks a PR's title, body and every commit message in it.
//
//   PR_TITLE=... PR_BODY=... node scripts/check/pr-format.mjs [--base <ref>]
//
// CI passes the title and body through env vars, never by pasting them into a shell line.
// Locally, omit PR_TITLE and PR_BODY to check only the commits. Exit 0 pass, 1 fail, 2 error.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkMessage, checkSubject, CLOSING } from './commit-format.mjs';

export const SECTIONS = ['Summary', 'Validation', 'Size', 'Review checklist', 'Risks and follow-ups'];
const STATUS_LINE = /^\s*[-*]\s*(pass|fail|blocked|not_run)\b/m;

export function checkBody(body) {
  const text = body.replace(/\r/g, '').replace(/<!--[\s\S]*?-->/g, '');
  // Quoted examples in code are not links; GitHub does not act on them either.
  const prose = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const problems = [];
  for (const s of SECTIONS) if (!new RegExp(`^##\\s+${s}\\s*$`, 'mi').test(text)) problems.push(`body is missing the "## ${s}" section`);
  if (!/^Tracking:[ \t]*\S/m.test(text)) problems.push('body needs a "Tracking:" line (an issue, a task spec path, or "none")');
  const validation = (text.split(/^##\s+Validation\s*$/mi)[1] || '').split(/^##\s/m)[0];
  if (!STATUS_LINE.test(validation)) problems.push('Validation needs at least one "- pass|fail|blocked|not_run: ..." line');
  if (CLOSING.test(prose)) problems.push('body uses a closing keyword; write "Refs: #N" so the issue stays open until accepted');
  return problems;
}

/** Splits `git log --format=%H%x00%B%x1e` output into [{ sha, message }]. */
export function parseLog(out) {
  return out.split('\x1e').map((r) => r.replace(/^\n/, '')).filter((r) => r.includes('\0')).map((r) => {
    const [sha, message] = r.split('\0');
    return { sha: sha.trim(), message };
  });
}

function main(argv) {
  const i = argv.indexOf('--base');
  const base = i === -1 ? process.env.BASE_SHA || 'origin/main' : argv[i + 1];
  if (!base || base.startsWith('--')) {
    console.error('usage: pr-format.mjs [--base <ref>]  (PR_TITLE, PR_BODY, BASE_SHA, HEAD_SHA from env)');
    return 2;
  }
  const problems = [];
  if (process.env.PR_TITLE !== undefined) problems.push(...checkSubject(process.env.PR_TITLE).map((p) => `title: ${p}`));
  if (process.env.PR_BODY !== undefined) problems.push(...checkBody(process.env.PR_BODY));
  let commits;
  try {
    commits = parseLog(execFileSync('git', ['log', '--no-merges', '--format=%H%x00%B%x1e', `${base}..${process.env.HEAD_SHA || 'HEAD'}`], { encoding: 'utf8' }));
  } catch (err) {
    console.error(`pr-format: cannot read commits since ${base}. Fetch it first. (${err.message.split('\n')[0]})`);
    return 2;
  }
  for (const c of commits) problems.push(...checkMessage(c.message).map((p) => `commit ${c.sha.slice(0, 7)}: ${p}`));
  if (problems.length) {
    console.error(`pr-format: fail (${problems.length})`);
    for (const p of problems) console.error(`  - ${p}`);
    return 1;
  }
  console.log(`pr-format: pass (${commits.length} commits${process.env.PR_BODY !== undefined ? ', title and body' : ''})`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  process.exitCode = main(process.argv.slice(2));
}

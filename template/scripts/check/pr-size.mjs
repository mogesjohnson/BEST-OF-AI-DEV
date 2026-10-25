#!/usr/bin/env node
// BEST-OF-AI-DEV template v1. PR size gate (RULES.md R8). Counts changed lines, never commits.
//
//   node scripts/check/pr-size.mjs [--base <ref>]     default base: origin/main
//
// Counts added + deleted lines in `git diff BASE...HEAD`, so later commits that undo earlier
// ones do not inflate the total. Excludes lockfiles, generated files and, in a repo with a
// template/ mirror, root files byte-identical to their template/ copy.
// Exception: label "size-exception" plus a "Size exception: <reason>" line in the PR body
// (CI reads PR_LABELS and PR_BODY), or SIZE_EXCEPTION="<reason>" locally.
// Exit 0 pass, 1 over the limit, 2 usage or git error.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMIT = Number(process.env.PR_SIZE_LIMIT || 600);
export const TARGET = Number(process.env.PR_SIZE_TARGET || 400);

export const EXCLUDE = [
  '**/package-lock.json', '**/pnpm-lock.yaml', '**/yarn.lock', '**/bun.lockb', '**/Cargo.lock',
  '**/poetry.lock', '**/uv.lock', '**/Gemfile.lock', '**/go.sum', '**/composer.lock',
  '**/*.min.js', '**/*.min.css', '**/*.map', '**/generated/**', 'evidence/**',
  // REPO-SPECIFIC: extra excluded globs, one per line, each with a reason comment.
  // /REPO-SPECIFIC
];
const MIRROR_DIR = 'template';

export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      i++;
      if (glob[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*';
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}
const EXCLUDE_RE = EXCLUDE.map(globToRegExp);
export const isExcluded = (path) => EXCLUDE_RE.some((re) => re.test(path));

/** Parses `git diff --numstat -z` output into { path, added, deleted, binary }. */
export function parseNumstat(out) {
  const parts = out.split('\0');
  const rows = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    const [added, deleted, path] = parts[i].split('\t');
    let file = path;
    if (path === '') { i += 2; file = parts[i]; } // rename: old and new paths follow
    rows.push({ path: file, added: added === '-' ? 0 : Number(added), deleted: deleted === '-' ? 0 : Number(deleted), binary: added === '-' });
  }
  return rows;
}

export function exceptionReason(env) {
  if (env.SIZE_EXCEPTION && env.SIZE_EXCEPTION.trim().length >= 10) return env.SIZE_EXCEPTION.trim();
  const labelled = (env.PR_LABELS || '').split(',').map((s) => s.trim()).includes('size-exception');
  // Same line only, and not inside an HTML comment (the PR template's example is one).
  const body = (env.PR_BODY || '').replace(/<!--[\s\S]*?(-->|$)/g, '');
  const m = /^Size exception:[ \t]*(\S.{9,})$/im.exec(body);
  return labelled && m ? m[1].trim() : null;
}

export function summarize(rows, isMirror = () => false) {
  const counted = [];
  const skipped = [];
  for (const r of rows) (isExcluded(r.path) || isMirror(r.path) ? skipped : counted).push(r);
  const added = counted.reduce((n, r) => n + r.added, 0);
  const deleted = counted.reduce((n, r) => n + r.deleted, 0);
  return { added, deleted, total: added + deleted, files: counted.length, skipped, binaries: counted.filter((r) => r.binary) };
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function mirrorCheck(head) {
  let tree;
  try { tree = git(['ls-tree', '-r', head]); } catch { return () => false; }
  const blobs = new Map();
  for (const line of tree.split('\n')) {
    const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(line);
    if (m) blobs.set(m[2], m[1]);
  }
  return (path) => !path.startsWith(`${MIRROR_DIR}/`) && blobs.has(`${MIRROR_DIR}/${path}`) && blobs.get(path) === blobs.get(`${MIRROR_DIR}/${path}`);
}

function main(argv) {
  const i = argv.indexOf('--base');
  const base = i === -1 ? process.env.BASE_SHA || 'origin/main' : argv[i + 1];
  if (!base || base.startsWith('--')) {
    console.error('pr-size: usage: node scripts/check/pr-size.mjs [--base <ref>]');
    return 2;
  }
  const head = process.env.HEAD_SHA || 'HEAD';
  let rows;
  try {
    rows = parseNumstat(git(['diff', '--numstat', '-z', '-M', `${base}...${head}`]));
  } catch (err) {
    console.error(`pr-size: cannot diff ${base}...${head}. Fetch the base branch first. (${err.message.split('\n')[0]})`);
    return 2;
  }
  const s = summarize(rows, mirrorCheck(head));
  const verdict = s.total > LIMIT ? 'fail' : s.total > TARGET ? 'pass (over the target; consider splitting)' : 'pass';
  console.log(`pr-size: ${s.total} changed lines (+${s.added}/-${s.deleted}) in ${s.files} files; ${s.skipped.length} excluded. Limit ${LIMIT}, target ${TARGET}: ${verdict}`);
  if (s.binaries.length) console.log(`pr-size: binary files are not line-counted; justify them in the PR: ${s.binaries.map((b) => b.path).join(', ')}`);
  if (s.total <= LIMIT) return 0;
  const reason = exceptionReason(process.env);
  if (reason) {
    console.log(`pr-size: size exception accepted: ${reason}`);
    return 0;
  }
  console.error('pr-size: split this into stacked PRs, or add the size-exception label and a "Size exception: <reason>" line.');
  return 1;
}

// Case-insensitive compare: on Windows the drive letter case can differ.
if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  process.exitCode = main(process.argv.slice(2));
}

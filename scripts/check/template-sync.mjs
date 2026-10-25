#!/usr/bin/env node
// BEST-OF-AI-DEV template v1. Reports drift between a repo and the BEST-OF-AI-DEV template.
//
//   node scripts/check/template-sync.mjs                      (inside BEST-OF-AI-DEV: template/ vs root)
//   node scripts/check/template-sync.mjs --template <dir>     (any repo: <dir> vs this repo)
//
// Repo-specific text is ignored in two forms, in any comment syntax:
//   block: a line containing "REPO-SPECIFIC:" through a line containing "/REPO-SPECIFIC"
//   tail:  a line containing "REPO-SPECIFIC-BELOW" and everything after it
// Exit 0 when in sync, 1 on drift, 2 on usage errors.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Template files a repo may skip, with the reason. Keep this list short.
export const OPTIONAL = new Map([
  ['GEMINI.md', 'only needed when a Gemini or Antigravity agent works in the repo'],
  ['optional/', 'opt-in extras; copy only what you use'],
]);

export function stripRepoSpecific(text) {
  const out = [];
  let inBlock = false;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    if (line.includes('REPO-SPECIFIC-BELOW')) {
      out.push('<<repo-specific tail>>');
      return out.join('\n');
    }
    if (!inBlock && line.includes('REPO-SPECIFIC:')) {
      inBlock = true;
      out.push('<<repo-specific>>');
    }
    if (inBlock) {
      if (line.includes('/REPO-SPECIFIC')) inBlock = false;
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

export function listFiles(dir, base = dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...listFiles(full, base));
    else files.push(relative(base, full).split(sep).join('/'));
  }
  return files.sort();
}

export function isOptional(path) {
  for (const key of OPTIONAL.keys()) {
    if (key.endsWith('/') ? path.startsWith(key) : path === key) return true;
  }
  return false;
}

export function compare(templateDir, repoDir) {
  const problems = [];
  for (const path of listFiles(templateDir)) {
    const target = join(repoDir, path);
    if (!existsSync(target)) {
      if (!isOptional(path)) problems.push(`missing: ${path}`);
      continue;
    }
    const want = stripRepoSpecific(readFileSync(join(templateDir, path), 'utf8'));
    const have = stripRepoSpecific(readFileSync(target, 'utf8'));
    if (want !== have) problems.push(`differs: ${path}`);
  }
  return problems;
}

function main(argv) {
  const root = process.cwd();
  const flag = argv.indexOf('--template');
  const templateDir = flag === -1 ? join(root, 'template') : argv[flag + 1];
  if (!templateDir || !existsSync(templateDir)) {
    console.error(`template-sync: template directory not found: ${templateDir ?? '(none)'}`);
    return 2;
  }
  const problems = compare(templateDir, root);
  if (problems.length === 0) {
    console.log('template-sync: pass (all shared files match outside REPO-SPECIFIC blocks)');
    return 0;
  }
  console.error(`template-sync: fail, ${problems.length} file(s) drifted from the template:`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('Copy the template version, then re-apply your REPO-SPECIFIC blocks.');
  return 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = main(process.argv.slice(2));
}

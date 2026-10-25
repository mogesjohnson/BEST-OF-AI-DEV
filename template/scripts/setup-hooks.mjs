#!/usr/bin/env node
// BEST-OF-AI-DEV template v1. Points Git at the versioned hooks in .githooks/.
// Runs from "npm install" (the prepare script) or by hand. Safe to run twice.
// Worktrees share this setting, so every agent worktree gets the same hooks.
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

let top;
try {
  top = git(['rev-parse', '--show-toplevel']);
} catch {
  console.log('setup-hooks: not a git checkout, skipped');
  process.exit(0);
}
const dir = join(top, '.githooks');
if (!existsSync(dir)) {
  console.error('setup-hooks: .githooks/ not found');
  process.exit(1);
}
for (const name of readdirSync(dir)) {
  try {
    chmodSync(join(dir, name), 0o755);
  } catch {
    // Windows ignores modes; Git for Windows runs hooks without them.
  }
}
git(['config', 'core.hooksPath', '.githooks']);
console.log(`setup-hooks: core.hooksPath = .githooks (${readdirSync(dir).join(', ')})`);

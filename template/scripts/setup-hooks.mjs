#!/usr/bin/env node
// BEST-OF-AI-DEV template v1. Points Git at the versioned hooks in .githooks/.
// Runs from "npm install" (the prepare script) or by hand. Safe to run twice.
// Worktrees share this setting, so every agent worktree gets the same hooks.
// If the repo root has lefthook.yml (see optional/lefthook.yml) and lefthook is
// installed, it clears core.hooksPath and runs "lefthook install" instead.
import { execFileSync, spawnSync } from 'node:child_process';
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
if (existsSync(join(top, 'lefthook.yml'))) {
  const local = join(top, 'node_modules', '.bin', process.platform === 'win32' ? 'lefthook.cmd' : 'lefthook');
  const bin = existsSync(local) ? local : 'lefthook';
  try { git(['config', '--unset', 'core.hooksPath']); } catch { /* not set */ }
  // .cmd shims need a shell on Windows; quote the path because user folders contain spaces.
  const win = process.platform === 'win32';
  const r = spawnSync(win ? `"${bin}"` : bin, ['install'], { cwd: top, stdio: 'inherit', shell: win });
  if (r.status === 0) {
    console.log('setup-hooks: lefthook installed the hooks from lefthook.yml');
    process.exit(0);
  }
  console.log('setup-hooks: lefthook.yml found but lefthook is not installed; using .githooks/ instead');
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

// End-to-end: a throwaway repo (with a space in its path, like C:\Users\Moges Johnson)
// gets the hooks, rejects a bad commit, accepts a good one, and the size gate counts lines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

function run(cwd, cmd, args, env = {}) {
  return spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
}

test('hooks and size gate work in a fresh repo with a spaced path', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bod hooks '));
  try {
    cpSync(join(root, '.githooks'), join(dir, '.githooks'), { recursive: true });
    cpSync(join(root, 'scripts'), join(dir, 'scripts'), { recursive: true });
    const g = (...a) => run(dir, 'git', a);
    g('init', '-q', '-b', 'main');
    g('config', 'user.email', 'test@example.invalid');
    g('config', 'user.name', 'test');
    assert.equal(run(dir, process.execPath, ['scripts/setup-hooks.mjs']).status, 0);
    assert.equal(g('config', 'core.hooksPath').stdout.trim(), '.githooks');

    g('add', '-A');
    const bad = g('commit', '-q', '-m', 'Added the scripts.');
    assert.notEqual(bad.status, 0, 'bad subject must be rejected');
    assert.match(bad.stderr, /commit-msg: rejected/);
    assert.equal(g('commit', '-q', '-m', 'chore: add scripts').status, 0);

    g('switch', '-q', '-c', 'feat');
    writeFileSync(join(dir, 'a.txt'), 'x\n'.repeat(700));
    writeFileSync(join(dir, 'package-lock.json'), '{}\n'.repeat(5000));
    g('add', '-A');
    assert.equal(g('commit', '-q', '-m', 'feat: add a big file').status, 0);
    const size = (env) => run(dir, process.execPath, ['scripts/check/pr-size.mjs', '--base', 'main'], env);
    const over = size({ SIZE_EXCEPTION: '' });
    assert.equal(over.status, 1);
    assert.match(over.stdout, /700 changed lines .* 1 excluded/);
    assert.equal(size({ SIZE_EXCEPTION: 'test of the exception path' }).status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

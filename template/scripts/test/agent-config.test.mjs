// Guards the committed agent configs against a well-meant "just allow everything" edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const claudePath = new URL('.claude/settings.json', root);
const codexPath = new URL('.codex/config.toml', root);

test('Claude settings are strict JSON and keep the safety denies', { skip: !existsSync(claudePath) }, () => {
  const { permissions } = JSON.parse(readFileSync(claudePath, 'utf8'));
  for (const rule of ['Read(./.env)', 'Read(./.env.*)', 'Bash(git push --force *)', 'Bash(git commit --no-verify *)', 'Bash(git config core.hooksPath *)']) {
    assert.ok(permissions.deny.includes(rule), `deny is missing ${rule}`);
  }
  assert.ok(permissions.ask.includes('Bash(git push *)'), 'pushing must ask');
  const wide = permissions.allow.filter((r) => /^(Bash|Edit|Write)(\(\*[ *]*\))?$/.test(r));
  assert.deepEqual(wide, [], 'allow must not contain blanket Bash, Edit or Write');
  assert.equal(permissions.defaultMode, undefined, 'do not set a default mode in the shared file');
});

test('Codex config stays sandboxed', { skip: !existsSync(codexPath) }, () => {
  const toml = readFileSync(codexPath, 'utf8').replace(/#.*$/gm, '');
  assert.match(toml, /^sandbox_mode\s*=\s*"(workspace-write|read-only)"/m);
  assert.match(toml, /^approval_policy\s*=\s*"on-request"/m);
  assert.match(toml, /^network_access\s*=\s*false/m);
  assert.doesNotMatch(toml, /danger-full-access/);
});

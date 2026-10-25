import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addedLines, scanLines } from '../check/secrets.mjs';

// Fake values are assembled at runtime so this file never contains one.
const fake = {
  github: 'ghp' + '_' + 'a'.repeat(36),
  aws: 'AKIA' + 'B'.repeat(16),
  xai: 'xai' + '-' + 'c'.repeat(44),
  jwt: 'eyJ' + 'a'.repeat(20) + '.eyJ' + 'b'.repeat(30) + '.' + 'c'.repeat(30),
  pem: '-----BEGIN ' + 'RSA PRIVATE KEY-----',
};

const scan = (text, file = 'src/a.ts') => scanLines(file, [[1, text]]).map((f) => f.rule);

test('catches common token shapes', () => {
  for (const [kind, value] of Object.entries(fake)) assert.equal(scan(`const k = "${value}";`).length, 1, kind);
});

test('catches personal paths but not placeholders', () => {
  const users = 'Users';
  assert.deepEqual(scan(`cd C:\\${users}\\Moges Johnson\\code`), ['personal Windows path']);
  assert.deepEqual(scan(`see /${users}/moges/dev/x`), ['personal home path']);
  assert.deepEqual(scan('cd C:\\Users\\<you>\\code'), []);
  assert.deepEqual(scan('personal paths (`C:\\Users\\...`)'), []);
  assert.deepEqual(scan('runs-on /home/runner/work'), []);
  assert.deepEqual(scan('path: "$env:USERPROFILE\\code"'), []);
});

test('flags files that should never be committed', () => {
  assert.equal(scanLines('.env', []).length, 1);
  assert.equal(scanLines('apps/api/.env.local', []).length, 1);
  assert.equal(scanLines('certs/server.pem', []).length, 1);
  assert.equal(scanLines('.env.example', []).length, 0);
});

test('gitleaks:allow skips a known test value', () => {
  assert.deepEqual(scan(`const k = "${fake.aws}"; // gitleaks:allow`), []);
});

test('reads only added lines with their numbers from a -U0 diff', () => {
  const diff = ['diff --git a/x b/x', '--- a/x', '+++ b/x', '@@ -3,0 +4,2 @@', '+one', '+two', '+++ /dev/null'].join('\n');
  assert.deepEqual(addedLines(diff).get('x'), [[4, 'one'], [5, 'two']]);
});

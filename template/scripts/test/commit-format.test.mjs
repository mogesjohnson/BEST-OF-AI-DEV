import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkMessage, checkSubject } from '../check/commit-format.mjs';

test('accepts conventional subjects', () => {
  for (const s of ['feat: add x', 'fix(api): handle 429', 'refactor(ui/nav)!: drop old props', 'docs(AGENTS.md)'.toLowerCase() + ': x']) {
    assert.deepEqual(checkSubject(s), [], s);
  }
});

test('rejects bad subjects with a reason', () => {
  assert.match(checkSubject('Added stuff')[0], /type\(scope\)/);
  assert.match(checkSubject('feat: x'.padEnd(80, 'y')).join(), /limit is 72/);
  assert.match(checkSubject('fix: handle 429.').join(), /period/);
  assert.match(checkSubject('fix: handle 429, closes #12').join(), /closing keywords/);
  assert.match(checkSubject('[F12] add thing').join(), /type\(scope\)/);
});

test('exempts merge, revert and fixup subjects', () => {
  for (const s of ['Merge branch main into grok/x', 'Revert "feat: add x"', 'fixup! feat: add x']) {
    assert.deepEqual(checkMessage(s), [], s);
  }
});

test('checks the body: blank line and closing keywords', () => {
  assert.match(checkMessage('feat: a\nbody right away').join(), /blank line/);
  assert.match(checkMessage('feat: a\n\nThis fixes #3 for real.').join(), /body/);
  assert.match(checkMessage('feat: a\n\nResolves: owner/repo#9').join(), /body/);
  assert.deepEqual(checkMessage('feat: a\n\nWhy it matters.\n\nRefs: #3\nAgent: grok-bot'), []);
  assert.deepEqual(checkMessage('fix: a\n\nfix the 3 flaky tests'), [], 'plain "fix" in prose is fine');
});

test('ignores git comments, CRLF and the scissors section', () => {
  const raw = '# Please enter the commit message\r\nfeat: a\r\n\r\nbody\r\n# ------------------------ >8 ------------------------\r\ncloses #1\r\n';
  assert.deepEqual(checkMessage(raw), []);
  assert.deepEqual(checkMessage('# only comments\n\n'), ['empty commit message']);
});

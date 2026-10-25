import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkBody, parseLog, SECTIONS } from '../check/pr-format.mjs';
import { checkMessage, PR_EXEMPT } from '../check/commit-format.mjs';
import { withoutGitEnv } from '../lib/git-env.mjs';

const filled = `## Summary\n\nAdds x.\n\nTracking: none\n\n## Validation\n\n- pass: \`npm test\`\n- blocked: Actions billing\n\n## Size\n\npr-size: 10\n\n## Review checklist\n\n- [x] ok\n\n## Risks and follow-ups\n\nnone\n`;

test('a filled-in template body passes', () => {
  assert.deepEqual(checkBody(filled), []);
});

const template = readFileSync(new URL('../../.github/pull_request_template.md', import.meta.url), 'utf8');

test('the untouched PR template fails on every placeholder', () => {
  const problems = checkBody(template).join('\n');
  assert.match(problems, /Tracking:/);
  assert.match(problems, /at least one/);
  for (const s of ['Summary', 'Size', 'Risks and follow-ups']) assert.match(problems, new RegExp(`## ${s}" is still the template`));
});

test('adding only "Tracking: none" to the template is not enough', () => {
  const lazy = template.replace(/^Tracking:.*$/m, 'Tracking: none');
  assert.ok(checkBody(lazy).length >= 3, checkBody(lazy).join());
});

test('a status line needs evidence', () => {
  assert.match(checkBody(filled.replace('- blocked: Actions billing', '- not_run:')).join(), /no command or evidence/);
});

test('missing sections, status lines and closing keywords are reported', () => {
  assert.equal(checkBody('fixed it').length, SECTIONS.length + 2);
  assert.match(checkBody(filled.replace('- pass:', 'pass:').replace('- blocked:', 'blocked:')).join(), /at least one/);
  const moved = filled.replace('- pass: `npm test`\n- blocked: Actions billing', 'tested').replace('none\n', '- pass: in the wrong section\n');
  assert.match(checkBody(moved).join(), /at least one/, 'status lines must sit under Validation');
  assert.match(checkBody(`${filled}\nCloses #4`).join(), /closing keyword/);
  assert.deepEqual(checkBody(`${filled}\n<!-- closes #4 in a comment is ignored -->`), []);
  assert.deepEqual(checkBody(`${filled}\nIt rejects \`closes #12\` in commits.`), [], 'quoted examples are fine');
});

test('parses git log records', () => {
  const out = 'abc\0feat: a\n\nbody\n\x1e\ndef\0fix: b\n\x1e\n';
  assert.deepEqual(parseLog(out), [{ sha: 'abc', message: 'feat: a\n\nbody\n' }, { sha: 'def', message: 'fix: b\n' }]);
});

const script = fileURLToPath(new URL('../check/pr-format.mjs', import.meta.url));
const gate = (env) => spawnSync(process.execPath, [script, '--base', 'HEAD'], { encoding: 'utf8', env: { ...withoutGitEnv(), ...env } });

test('Dependabot PRs are skipped; others with its title are not', () => {
  const title = 'Bump lodash from 4.17.20 to 4.17.21';
  assert.equal(gate({ PR_AUTHOR: 'dependabot[bot]', PR_TITLE: title, PR_BODY: 'Bumps lodash.' }).status, 0);
  assert.equal(gate({ PR_AUTHOR: 'someone', PR_TITLE: title, PR_BODY: 'Bumps lodash.' }).status, 1);
});

test('a GitHub revert PR passes with its generated body', () => {
  assert.equal(gate({ PR_TITLE: 'Revert "feat: add x"', PR_BODY: 'Reverts owner/repo#12' }).status, 0);
  assert.equal(gate({ PR_TITLE: 'feat: add x', PR_BODY: 'Reverts owner/repo#12' }).status, 1, 'only with a revert title');
});

test('the PR gate rejects fixup!, squash! and Merge subjects', () => {
  for (const s of ['fixup! feat: add x', 'squash! feat: add x', 'Merge branch main into feat']) {
    assert.notDeepEqual(checkMessage(s, '#', PR_EXEMPT), [], s);
    assert.deepEqual(checkMessage(s), [], `${s} is still fine locally`);
  }
  assert.deepEqual(checkMessage('Revert "feat: add x"', '#', PR_EXEMPT), []);
});

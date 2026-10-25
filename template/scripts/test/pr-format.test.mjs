import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkBody, parseLog } from '../check/pr-format.mjs';

const filled = `## Summary\n\nAdds x.\n\nTracking: none\n\n## Validation\n\n- pass: \`npm test\`\n- blocked: Actions billing\n\n## Size\n\npr-size: 10\n\n## Review checklist\n\n- [x] ok\n\n## Risks and follow-ups\n\nnone\n`;

test('a filled-in template body passes', () => {
  assert.deepEqual(checkBody(filled), []);
});

test('the untouched PR template still fails: no real tracking line', () => {
  const raw = readFileSync(new URL('../../.github/pull_request_template.md', import.meta.url), 'utf8');
  assert.deepEqual(checkBody(raw), ['body needs a "Tracking:" line (an issue, a task spec path, or "none")']);
});

test('missing sections, status lines and closing keywords are reported', () => {
  assert.equal(checkBody('fixed it').length, SECTIONS_COUNT + 2);
  assert.match(checkBody(filled.replace('- pass:', 'pass:').replace('- blocked:', 'blocked:')).join(), /at least one/);
  assert.match(checkBody(`${filled}\nCloses #4`).join(), /closing keyword/);
  assert.deepEqual(checkBody(`${filled}\n<!-- closes #4 in a comment is ignored -->`), []);
  assert.deepEqual(checkBody(`${filled}\nIt rejects \`closes #12\` in commits.`), [], 'quoted examples are fine');
});
const SECTIONS_COUNT = 5;

test('parses git log records', () => {
  const out = 'abc\0feat: a\n\nbody\n\x1e\ndef\0fix: b\n\x1e\n';
  assert.deepEqual(parseLog(out), [{ sha: 'abc', message: 'feat: a\n\nbody\n' }, { sha: 'def', message: 'fix: b\n' }]);
});

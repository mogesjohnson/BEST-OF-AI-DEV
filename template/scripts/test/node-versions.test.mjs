// RULES.md R16: the Node versions ci.yml tests, R16's text and package.json "engines" agree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
// BEST-OF-AI-DEV keeps its scripts in template/, so check its repo root as well.
const parent = join(root, '..');
const roots = basename(root) === 'template' && existsSync(join(parent, '.github/workflows/ci.yml')) ? [root, parent] : [root];

/** NODE_OLDEST and NODE_NEWEST from ci.yml's env block. */
export function ciVersions(yml) {
  const get = (name) => Number(new RegExp(`^\\s*${name}:\\s*(\\d+)\\s*$`, 'm').exec(yml)?.[1]);
  return { oldest: get('NODE_OLDEST'), newest: get('NODE_NEWEST') };
}

/** The text of R16, from its title to its Enforced-by line. */
export function r16(rules) {
  return /\*\*R16\.[\s\S]*?\*Enforced by:\*/.exec(rules)?.[0] || '';
}

test('ciVersions and r16 read the shapes they expect', () => {
  assert.deepEqual(ciVersions('env:\n  NODE_OLDEST: 22\n  NODE_NEWEST: 26\n'), { oldest: 22, newest: 26 });
  assert.ok(Number.isNaN(ciVersions('node-version: 22').oldest), 'a bare node-version is not the env pair');
  assert.equal(r16('**R15. x** *Enforced by:* y'), '');
});

for (const dir of roots) {
  const read = (p) => readFileSync(join(dir, p), 'utf8');
  const where = dir === root ? basename(root) : 'repo root';

  test(`ci.yml, R16 and engines name the same Node versions (${where})`, () => {
    const yml = read('.github/workflows/ci.yml');
    const { oldest, newest } = ciVersions(yml);
    assert.ok(oldest < newest, `ci.yml needs NODE_OLDEST below NODE_NEWEST, got ${oldest} and ${newest}`);
    // setup-node must read the pair, so a hard-coded version cannot slip past this test.
    assert.match(yml, /node-version: \$\{\{ matrix\.os == 'windows-latest' && env\.NODE_NEWEST \|\| env\.NODE_OLDEST \}\}/);
    const rule = r16(read('RULES.md'));
    assert.match(rule, new RegExp(`Node ${oldest} on Linux`), 'R16 must name the Linux version');
    assert.match(rule, new RegExp(`Node ${newest} on Windows`), 'R16 must name the Windows version');
    assert.equal(JSON.parse(read('package.json')).engines?.node, `>=${oldest} <${newest + 1}`);
  });
}

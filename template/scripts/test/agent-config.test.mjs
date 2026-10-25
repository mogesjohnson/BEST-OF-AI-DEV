// Guards the committed agent configs against a well-meant "just allow everything" edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const claudePath = new URL('.claude/settings.json', root);
const codexPath = new URL('.codex/config.toml', root);

/**
 * A model of Claude Code's documented Bash rule matching (code.claude.com/docs/en/permissions,
 * read 2026-10-25): "*" matches any text, spaces included; a trailing " *" that is the only
 * wildcard also matches the bare command; deny and ask apply if any subcommand of a compound
 * command matches. It is a model, so it checks intent, not Claude Code itself.
 */
export function bashRuleMatches(rule, command) {
  const m = /^Bash\((.*)\)$/.exec(rule);
  if (!m) return false;
  const pattern = m[1].replace(/:\*$/, ' *');
  const re = new RegExp(`^${pattern.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`, 's');
  const bare = (pattern.match(/\*/g) || []).length === 1 && pattern.endsWith(' *') ? pattern.slice(0, -2) : null;
  return command.split(/\s*(?:&&|\|\||;|\|)\s*/).some((sub) => re.test(sub.trim()) || sub.trim() === bare);
}

export function decide(permissions, command) {
  for (const kind of ['deny', 'ask', 'allow']) {
    if ((permissions[kind] || []).some((r) => bashRuleMatches(r, command))) return kind;
  }
  return 'ask';
}

test('the rule model follows the documented examples', () => {
  assert.ok(bashRuleMatches('Bash(ls *)', 'ls'));
  assert.ok(!bashRuleMatches('Bash(ls *)', 'lsof'));
  assert.ok(bashRuleMatches('Bash(git log * main)', 'git log --output= main'));
  assert.ok(!bashRuleMatches('Bash(* --help *)', 'npm --help'));
  assert.ok(bashRuleMatches('Bash(rm *)', 'cd /tmp && rm -rf x'));
});

test('Claude settings are strict JSON with no blanket allows', { skip: !existsSync(claudePath) }, () => {
  const { permissions } = JSON.parse(readFileSync(claudePath, 'utf8'));
  const wide = permissions.allow.filter((r) => /^(Bash|Edit|Write)(\(\*[ *]*\))?$/.test(r));
  assert.deepEqual(wide, [], 'allow must not contain blanket Bash, Edit or Write');
  for (const rule of ['Read(./.env)', 'Read(./.env.*)']) assert.ok(permissions.deny.includes(rule), `deny is missing ${rule}`);
  assert.equal(permissions.defaultMode, undefined, 'do not set a default mode in the shared file');
});

test('Claude settings deny the bypasses wherever the flag sits', { skip: !existsSync(claudePath) }, () => {
  const { permissions } = JSON.parse(readFileSync(claudePath, 'utf8'));
  const expect = {
    deny: [
      'git commit --no-verify -m x', 'git commit -m x --no-verify', 'git push --no-verify', 'git merge main --no-verify',
      'git commit -n -m x', 'git commit -m x -n', 'npm test && git commit -m x -n',
      'git push --force', 'git push origin main --force', 'git push --force-with-lease', 'git push -f origin main',
      'git push origin main -f', 'git push origin +main',
      'git reset --hard', 'git reset HEAD~1 --hard',
      'git config core.hooksPath /dev/null', 'git config --local core.hooksPath x', 'git -c core.hooksPath=/dev/null commit -m x',
      'git diff --output=/tmp/x', 'git log -p --output x', 'git show HEAD --output=x', 'git diff --ext-diff',
      'rm -rf node_modules', 'rm -fr dist',
    ],
    ask: ['git push', 'git push -u origin grok/topic', 'npm install left-pad', 'gh pr create', 'curl https://example.com'],
    allow: ['npm test', 'git status', 'git diff', 'git diff --stat main', 'git log --oneline -5', 'git log -n 5', 'git show HEAD'],
  };
  for (const [want, commands] of Object.entries(expect)) {
    for (const c of commands) assert.equal(decide(permissions, c), want, c);
  }
});

test('known gaps stay written down', { skip: !existsSync(claudePath) }, () => {
  // Not matched by any rule; docs/agents.md lists them. If one starts matching, update the docs.
  const { permissions } = JSON.parse(readFileSync(claudePath, 'utf8'));
  for (const c of ['git -C . push --force', 'git commit -anm x', '/usr/bin/git push --force']) {
    assert.notEqual(decide(permissions, c), 'deny', c);
  }
});

test('Codex config stays sandboxed', { skip: !existsSync(codexPath) }, () => {
  const toml = readFileSync(codexPath, 'utf8').replace(/#.*$/gm, '');
  assert.match(toml, /^sandbox_mode\s*=\s*"(workspace-write|read-only)"/m);
  assert.match(toml, /^approval_policy\s*=\s*"on-request"/m);
  assert.match(toml, /^network_access\s*=\s*false/m);
  assert.doesNotMatch(toml, /danger-full-access/);
});

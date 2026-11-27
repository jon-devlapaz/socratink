import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const runner = resolve('scripts/unlisted-tests.mjs');
const root = process.cwd();

function repo(files) {
	const dir = mkdtempSync(join(tmpdir(), 'unlisted-'));
	for (const [file, text] of Object.entries(files)) {
		mkdirSync(join(dir, file, '..'), { recursive: true });
		writeFileSync(join(dir, file), text);
	}
	execFileSync('git', ['init', '-q'], { cwd: dir });
	execFileSync('ln', ['-s', join(root, 'node_modules'), join(dir, 'node_modules')]);
	return dir;
}

const pass = (name) => `import test from 'node:test'; test('${name}', () => console.log('RAN ${name}'));`;
const scripts = {
	check: 'pnpm test:named && pnpm run test:quoted',
	'test:named': 'node --test scripts/named.test.mjs src/group/*.test.ts',
	'test:quoted': "node --test 'src/quoted/*.test.ts'",
	'test:outside': 'node --test scripts/outside.test.mjs',
};

test('a test the gate does not reach runs, and tests check already runs are left to their scripts', () => {
	const dir = repo({
		'package.json': JSON.stringify({ type: 'module', scripts }),
		'scripts/named.test.mjs': pass('named'),
		'src/group/globbed.test.ts': pass('globbed'),
		'src/quoted/q.test.ts': pass('quoted'),
		'scripts/outside.test.mjs': pass('outside'),
		'scripts/new.test.mjs': pass('new'),
	});
	const run = spawnSync(process.execPath, [runner], { cwd: dir, encoding: 'utf8' });
	assert.equal(run.status, 0, run.stderr);
	assert.match(run.stdout, /RAN new/);
	assert.match(run.stdout, /RAN outside/, 'a script outside check does not count');
	assert.doesNotMatch(run.stdout, /RAN named|RAN globbed|RAN quoted/);
});

test('a failing unlisted test fails the gate', () => {
	const dir = repo({
		'package.json': JSON.stringify({ type: 'module', scripts }),
		'scripts/broken.test.mjs': "import test from 'node:test'; test('broken', () => { throw new Error('no'); });",
	});
	assert.notEqual(spawnSync(process.execPath, [runner], { cwd: dir, encoding: 'utf8' }).status, 0);
});

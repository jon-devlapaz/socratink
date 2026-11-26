import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';

const script = resolve('scripts/check-file-size.mjs');

async function repository(t) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-file-size-'));
	t.after(() => rm(directory, { recursive: true, force: true }));
	execFileSync('git', ['init', '--quiet', directory]);
	await mkdir(join(directory, 'scripts'));
	await mkdir(join(directory, '.cache'));
	const write = (name, value) => writeFile(join(directory, name), value);
	await write('.gitignore', '.cache/\n');
	await write('scripts/conversation-client.test.mjs', '');
	execFileSync('git', ['add', '.gitignore', 'scripts/conversation-client.test.mjs'], { cwd: directory });
	return { write, check: () => spawnSync(process.execPath, [script], { cwd: directory, encoding: 'utf8' }) };
}

describe('check-file-size command', () => {
	it('accepts source at or below the limit and ignores generated output', async (t) => {
		const { write, check } = await repository(t);
		await write('.cache/generated.ts', '\n'.repeat(1_001));
		await write('under.ts', '\n'.repeat(999));
		await write('at-limit.ts', '\n'.repeat(1_000));
		const run = check();
		assert.ifError(run.error);
		assert.equal(run.status, 0);
		assert.equal(run.stderr, '');
	});

	it('reports oversized tracked and untracked source, including a last line without a newline', async (t) => {
		const { write, check } = await repository(t);
		await write('new.ts', '\n'.repeat(1_000) + 'last line');
		await write('scripts/conversation-client.test.mjs', '\n'.repeat(1_001));
		const run = check();
		assert.ifError(run.error);
		assert.equal(run.status, 1);
		const [heading, ...files] = run.stderr.trimEnd().split('\n');
		assert.match(heading, /File size check failed/);
		assert.deepEqual(files.sort(), ['  new.ts: 1001 lines; limit 1000', '  scripts/conversation-client.test.mjs: 1001 lines; limit 1000']);
	});
});

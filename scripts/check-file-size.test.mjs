import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

test('the size gate checks new source before staging and leaves ignored output alone', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-file-size-'));
	const script = resolve('scripts/check-file-size.mjs');
	const check = () => spawnSync(process.execPath, [script], { cwd: directory, encoding: 'utf8' });
	try {
		execFileSync('git', ['init', '--quiet', directory]);
		await mkdir(join(directory, 'scripts'));
		await mkdir(join(directory, '.cache'));
		await writeFile(join(directory, '.gitignore'), '.cache/\n');
		await writeFile(join(directory, 'scripts/conversation-client.test.mjs'), '');
		execFileSync('git', ['add', '.gitignore', 'scripts/conversation-client.test.mjs'], { cwd: directory });
		await writeFile(join(directory, '.cache/generated.ts'), '\n'.repeat(1_001));
		assert.equal(check().status, 0, 'ignored generated output is outside the size gate');
		await writeFile(join(directory, 'new.ts'), '\n'.repeat(1_001));
		const oversized = check();
		assert.equal(oversized.status, 1, 'oversized new source must fail before it is staged');
		assert.match(oversized.stderr, /new\.ts: 1001 lines; limit 1000/);
		await writeFile(join(directory, 'new.ts'), '\n'.repeat(1_000));
		assert.equal(check().status, 0, 'source at the limit is allowed');
		await writeFile(join(directory, 'scripts/conversation-client.test.mjs'), '\n'.repeat(1_001));
		assert.equal(check().status, 1, 'the former oversized test now follows the same size limit');
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});

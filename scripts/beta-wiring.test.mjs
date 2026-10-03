import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

for (const mode of ['active', 'paused']) {
	test(`production app/provider wiring enforces hosted access and key policy (${mode})`, () => {
		const result = spawnSync(process.execPath, [fileURLToPath(new URL('./beta-wiring-fixture.mjs', import.meta.url)), mode], {
			env: { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR, CI: '1' },
			encoding: 'utf8', timeout: 20_000,
		});
		assert.equal(result.error, undefined);
		assert.equal(result.status, 0, result.stdout + result.stderr);
		assert.match(result.stdout, /Production beta wiring passed/);
	});
}

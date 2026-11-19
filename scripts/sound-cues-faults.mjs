import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const cases = {
	assistance: 'marked assistance',
	history: 'restored history',
	off: 'Sound off stays silent',
	motion: 'reduced motion stays silent',
	duplicate: 'duplicate completion',
	'duplicate-guard': 'duplicate completion',
};
for (const [fault, pattern] of Object.entries(cases)) {
	const result = spawnSync(process.execPath, ['--test', `--test-name-pattern=${pattern}`, 'scripts/sound-cues.test.mjs'], {
		env: { ...process.env, SOUND_CUES_FAULT: fault }, encoding: 'utf8', timeout: 60_000,
	});
	process.stdout.write(result.stdout);
	process.stderr.write(result.stderr);
	assert.equal(result.error, undefined, `${fault}: test process must finish`);
	assert.equal(result.status, 1, `${fault}: forbidden tick must fail`);
	assert.match(result.stdout + result.stderr, /ERR_ASSERTION|AssertionError/);
	assert.match(result.stdout + result.stderr, /[123] !== [012]/, `${fault}: sound count must reject the fault`);
	console.log(`Caught planted ${fault} fault.`);
}

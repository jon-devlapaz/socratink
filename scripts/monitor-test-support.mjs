import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

export function monitorResponses(respond) {
	const calls = [];
	const canceled = [];
	return {
		calls,
		canceled,
		async request(input, options) {
			const url = new URL(input);
			calls.push({ url, options });
			const { data, status = 200, bytes } = respond(url);
			if (bytes !== undefined) {
				return new Response(new ReadableStream({
					start(controller) { controller.enqueue(new Uint8Array(bytes)); },
					cancel() { canceled.push(url); },
				}));
			}
			return new Response(typeof data === 'string' ? data : JSON.stringify(data), { status });
		},
	};
}

export function checkMonitorCommand(file, { env, preload, counts, exitCode }) {
	const imports = preload ? ['--import', 'data:text/javascript,' + encodeURIComponent(preload)] : [];
	const run = spawnSync(process.execPath, [...imports, file], { env, encoding: 'utf8', timeout: 5_000 });
	assert.ifError(run.error);
	assert.equal(run.status, exitCode);
	assert.deepEqual(JSON.parse(run.stdout), counts);
	assert.equal(run.stderr, '');
}

export async function runSilentMonitor(t, run) {
	const stdout = t.mock.method(process.stdout, 'write', () => true);
	const stderr = t.mock.method(process.stderr, 'write', () => true);
	let result;
	try {
		result = await run();
	} finally {
		stdout.mock.restore();
		stderr.mock.restore();
	}
	assert.equal(stdout.mock.callCount(), 0, 'unexpected monitor output');
	assert.equal(stderr.mock.callCount(), 0, 'unexpected monitor error output');
	return result;
}

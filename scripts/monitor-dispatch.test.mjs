import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Failures: public or preview invocation, missing credentials, changed dispatch
// target, HTTP/network failure, and private error text entering the logs.
test('scheduled entry point dispatches only the production monitor', async (t) => {
	const { default: handler } = await import('../api/runtime-monitor.ts');
	const originalFetch = globalThis.fetch;
	const originalError = console.error;
	const originalEnv = { ...process.env };
	const privateText = 'SYNTHETIC_PRIVATE_TOKEN_AND_ERROR';
	const cases = [
		['production', {}, 200, 1],
		['preview', { environment: 'preview' }, 204, 0],
		['missing environment', { environment: '' }, 204, 0],
		['public request', { headers: {} }, 400, 0],
		['wrong schedule', { headers: { 'ce-type': 'com.vercel.schedule.v1beta', 'ce-vssschedulename': 'other' } }, 400, 0],
		['wrong method', { method: 'GET' }, 400, 0],
		['missing credential', { token: '' }, 503, 0],
		['denied dispatch', { status: 403 }, 502, 1],
		['redirect rejected', { status: 302 }, 502, 1],
		['unexpected success body', { status: 200 }, 502, 1],
		['network failure', { network: true }, 502, 1],
	];
	try {
		for (const [name, options, status, expectedCalls] of cases) await t.test(name, async () => {
			process.env.VERCEL_ENV = options.environment ?? 'production';
			process.env.MONITOR_GITHUB_TOKEN = options.token ?? privateText;
			const calls = [];
			const errors = [];
			console.error = (...args) => errors.push(args);
			globalThis.fetch = async (url, init) => {
				calls.push({ url, ...init });
				if (options.network) throw new Error(privateText);
				return new Response(options.status ? privateText : null, { status: options.status ?? 204 });
			};
			const response = await handler.fetch(new Request('https://local.invalid/api/runtime-monitor', {
				method: options.method ?? 'POST', headers: options.headers ?? {
					'ce-type': 'com.vercel.schedule.v1beta', 'ce-vssschedulename': 'runtime-monitor',
				},
			}));
			assert.equal(response.status, status);
			assert.ok(!(await response.text()).includes(privateText));
			assert.equal(calls.length, expectedCalls);
			assert.deepEqual(errors, status === 503 ? [['runtime_monitor_dispatch_unconfigured']]
				: status === 502 ? [['runtime_monitor_dispatch_failed']] : []);
			for (const call of calls) {
				assert.equal(call.url, 'https://api.github.com/repos/jon-devlapaz/socratink/actions/workflows/runtime-monitor.yml/dispatches');
				assert.equal(call.method, 'POST');
				assert.equal(call.redirect, 'error');
				assert.ok(call.signal instanceof AbortSignal);
				assert.equal(call.headers.Authorization, `Bearer ${privateText}`);
				assert.deepEqual(JSON.parse(call.body), { ref: 'main' });
			}
		});
	} finally {
		globalThis.fetch = originalFetch;
		console.error = originalError;
		process.env = originalEnv;
	}
});

test('schedule is private and fits the current Hobby interval', async () => {
	const config = JSON.parse(await readFile('vercel.json', 'utf8'));
	assert.deepEqual(config.functions['api/runtime-monitor.ts'].experimentalTriggers, [{ type: 'schedule/v1beta' }]);
	assert.deepEqual(config.schedules['runtime-monitor'], { schedule: '*/15 * * * *', jitter: 15, function: 'api/runtime-monitor' });
});

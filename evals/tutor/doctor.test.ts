import assert from 'node:assert/strict';
import test from 'node:test';
import { doctor } from './doctor.ts';

// Failure cases: CI falls back to a local model when its secret is missing, a
// broken route is reported as ready, and the report prints a credential.
const keys = ['AI_GATEWAY_API_KEY', 'VERCEL_OIDC_TOKEN', 'VERCEL', 'GITHUB_ACTIONS', 'JON_LOCAL_BASE_URL', 'JON_LOCAL_API_KEY', 'JON_LOCAL_MODEL_ID'];

async function withEnv(values: Record<string, string>, run: () => Promise<void>) {
	const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
	for (const key of keys) delete process.env[key];
	Object.assign(process.env, values);
	try { await run(); } finally {
		for (const key of keys) {
			if (saved[key] === undefined) delete process.env[key];
			else process.env[key] = saved[key];
		}
	}
}

const none = () => [];

test('a gateway key that answers is ready, and the report never shows it', () => withEnv({ AI_GATEWAY_API_KEY: 'secret-key-value' }, async () => {
	const report = await doctor({ local: false, minutes: 60, load: none, probe: async () => undefined });
	assert.equal(report.problem, undefined);
	assert.ok(report.lines.includes('Route: AI Gateway'));
	assert.ok(report.lines.includes('Credential: AI_GATEWAY_API_KEY'));
	assert.equal(report.lines.join('\n').includes('secret-key-value'), false);
}));

test('in CI an empty secret is named as the problem, never replaced by a local model', () => withEnv({ AI_GATEWAY_API_KEY: '', GITHUB_ACTIONS: 'true' }, async () => {
	let probed = false;
	const report = await doctor({ local: false, gateway: true, minutes: 60, load: none, probe: async () => { probed = true; return undefined; } });
	assert.match(report.problem ?? '', /No AI Gateway credential.*secret of the tutor-eval environment/);
	assert.equal(probed, false, 'no request is sent without a credential');
}));

test('a route that refuses the tiny request is not ready, with its reason', () => withEnv({ AI_GATEWAY_API_KEY: 'k' }, async () => {
	const report = await doctor({ local: false, minutes: 60, load: none, probe: async () => 'HTTP 503 no usable provider key' });
	assert.equal(report.problem, 'HTTP 503 no usable provider key');
}));

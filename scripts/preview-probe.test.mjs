import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

// Failures: a non-preview build that calls the model, a failed preview call that lets the
// build pass, a passing call that fails it, or provider error text in the build log.
// Needs `pnpm build` first: the script reads dist/tutor-probe.mjs.
const secret = 'SYNTHETIC_PROVIDER_ERROR_AND_KEY';
const fakeGateway = (status, body) => 'data:text/javascript,' + encodeURIComponent(`
globalThis.fetch = async () => { console.log('PROVIDER_CALLED'); return new Response(${JSON.stringify(body)},
	{ status: ${status}, headers: { 'content-type': ${JSON.stringify(status === 200 ? 'text/event-stream' : 'application/json')} } }); };`);
const chunk = (delta, finish = null) => `data: ${JSON.stringify({ id: 'c', object: 'chat.completion.chunk', created: 1,
	model: 'm', choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`;
const okStream = chunk({ role: 'assistant', content: 'ok' }) + chunk({}, 'stop') + 'data: [DONE]\n\n';

function build(environment, gateway) {
	const env = { PATH: process.env.PATH, VERCEL: '1', AI_GATEWAY_API_KEY: 'synthetic-gateway-key', ...environment };
	for (const name of Object.keys(env)) if (env[name] === undefined) delete env[name];
	const args = gateway ? ['--import', gateway, 'scripts/preview-probe.mjs'] : ['scripts/preview-probe.mjs'];
	const run = spawnSync(process.execPath, args, { env, encoding: 'utf8' });
	return { code: run.status, out: run.stdout + run.stderr };
}

test('a production or local build calls no model', () => {
	for (const VERCEL_ENV of ['production', undefined]) {
		const run = build({ VERCEL_ENV }, fakeGateway(400, secret));
		assert.equal(run.code, 0);
		assert.equal(run.out, '');
	}
});

test('a preview build passes on a real reply', () => {
	const run = build({ VERCEL_ENV: 'preview' }, fakeGateway(200, okStream));
	assert.equal(run.code, 0);
	assert.match(run.out, /PROVIDER_CALLED/);
	assert.match(run.out, /Preview tutor call: ok in \d+ ms\./);
});

test('a preview build fails on a provider error and logs the status only', () => {
	const run = build({ VERCEL_ENV: 'preview' }, fakeGateway(400, JSON.stringify({ error: { message: secret } })));
	assert.equal(run.code, 1);
	assert.match(run.out, /Preview tutor call failed: provider status 400\./);
	assert.doesNotMatch(run.out, new RegExp(secret));
});

test('a preview build without a model key fails without a call', () => {
	const run = build({ VERCEL_ENV: 'preview', AI_GATEWAY_API_KEY: undefined }, fakeGateway(200, okStream));
	assert.equal(run.code, 1);
	assert.doesNotMatch(run.out, /PROVIDER_CALLED/);
	assert.match(run.out, /no model key in the build/);
});

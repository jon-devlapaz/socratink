import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveChatModel } from '../src/inference/operator.ts';

// Failures: a probe that passes on an error, an empty or reasoning-only reply, or a
// rate limit; a retry on anything but 429; a request shape that drifts from what a
// learner's turn sends; provider error text in the logs; a call outside its schedule.
const { default: probe } = await import('../src/server/tutor-probe.ts');
const privateText = 'SYNTHETIC_PROVIDER_ERROR_AND_KEY';
const key = 'synthetic-gateway-key';
const chunk = (delta, finish = null) => `data: ${JSON.stringify({ id: 'c', object: 'chat.completion.chunk', created: 1,
	model: 'm', choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`;
const reply = (delta) => () => new Response(chunk({ role: 'assistant', ...delta }) + chunk({}, 'stop') + 'data: [DONE]\n\n',
	{ status: 200, headers: { 'content-type': 'text/event-stream' } });
const status = (code) => () => new Response(JSON.stringify({ error: { message: privateText } }),
	{ status: code, headers: { 'content-type': 'application/json' } });
const timeout = () => { throw new DOMException(privateText, 'TimeoutError'); };
const scheduled = { 'ce-type': 'com.vercel.schedule.v1beta', 'ce-vssschedulename': 'tutor-probe' };

async function run({ responses = [], environment = 'production', headers = scheduled, method = 'POST', gatewayKey = key } = {}) {
	const saved = { ...process.env };
	const originals = { fetch: globalThis.fetch, error: console.error, log: console.log };
	const calls = [], errors = [], logs = [];
	Object.assign(process.env, { VERCEL: '1', VERCEL_ENV: environment, AI_GATEWAY_API_KEY: gatewayKey });
	if (!gatewayKey) delete process.env.AI_GATEWAY_API_KEY;
	delete process.env.VERCEL_OIDC_TOKEN;
	globalThis.fetch = async (input, init) => {
		const request = new Request(input, init);
		calls.push({ url: request.url, auth: request.headers.get('authorization'), body: JSON.parse(await request.text()),
			timed: request.signal instanceof AbortSignal, at: Date.now() });
		const next = responses[calls.length - 1];
		assert.ok(next, 'unexpected extra provider call');
		return next();
	};
	console.error = (...args) => errors.push(args.join(' '));
	console.log = (...args) => logs.push(args.join(' '));
	try {
		const response = await probe.fetch(new Request('https://local.invalid/api/tutor-probe', { method, headers }));
		return { status: response.status, calls, errors, logs };
	} finally {
		Object.assign(globalThis, { fetch: originals.fetch });
		console.error = originals.error; console.log = originals.log;
		for (const name of Object.keys(process.env)) if (!(name in saved)) delete process.env[name];
		Object.assign(process.env, saved);
	}
}

const failed = (providerStatus) => [JSON.stringify({ event: 'socratink_failure', category: 'probe_failed', providerStatus })];

test('a non-empty reply passes and logs only ok and latency', async () => {
	const result = await run({ responses: [reply({ content: 'ok' })] });
	assert.equal(result.status, 200);
	assert.deepEqual(result.errors, []);
	assert.equal(result.logs.length, 1);
	const line = JSON.parse(result.logs[0]);
	assert.deepEqual(Object.keys(line), ['event', 'status', 'latencyMs']);
	assert.equal(line.event, 'socratink_probe');
	assert.equal(line.status, 'ok');
	assert.ok(Number.isInteger(line.latencyMs));
});

test('the probe sends the learner route: gateway, model, key and hosted limits', async () => {
	const hosted = resolveChatModel({ VERCEL: '1', AI_GATEWAY_API_KEY: key });
	const { calls } = await run({ responses: [reply({ content: 'ok' })] });
	assert.equal(calls.length, 1);
	const [call] = calls;
	assert.equal(call.url, `${hosted.baseUrl}/chat/completions`);
	assert.equal(call.auth, `Bearer ${key}`);
	assert.equal(call.body.model, hosted.modelId);
	assert.equal(call.body.max_tokens ?? call.body.max_completion_tokens, hosted.maxTokens);
	assert.equal(call.body.stream, true);
	assert.ok(call.timed);
	assert.deepEqual(call.body.tools, undefined);
	assert.deepEqual(call.body.messages, [{ role: 'user', content: 'Reply with the single word: ok' }]);
});

for (const [name, responses, providerStatus, calls] of [
	['HTTP 400', [status(400)], 400, 1],
	['HTTP 500 is not retried', [status(500)], 500, 1],
	['429 twice', [status(429), status(429)], 429, 2],
	['timeout', [timeout], null, 1],
	['empty reply', [reply({ content: '' })], 200, 1],
	['reasoning without reply text', [reply({ reasoning_content: 'thinking about ok' })], 200, 1],
]) test(`${name} fails with probe_failed and its status only`, async () => {
	const result = await run({ responses });
	assert.equal(result.status, 502);
	assert.equal(result.calls.length, calls);
	assert.deepEqual(result.errors, failed(providerStatus));
	assert.deepEqual(result.logs, []);
	assert.ok(!JSON.stringify(result).includes(privateText));
	if (calls === 2) assert.ok(result.calls[1].at - result.calls[0].at >= 4_900);
});

test('429 then a reply passes after one retry', async () => {
	const result = await run({ responses: [status(429), reply({ content: 'ok' })] });
	assert.equal(result.status, 200);
	assert.equal(result.calls.length, 2);
	assert.ok(result.calls[1].at - result.calls[0].at >= 4_900);
	assert.deepEqual(result.errors, []);
});

test('a production deploy without a gateway credential fails without a call', async () => {
	const result = await run({ gatewayKey: '' });
	assert.equal(result.status, 503);
	assert.deepEqual(result.calls, []);
	assert.deepEqual(result.errors, failed(null));
});

test('only the production schedule event calls the model', async () => {
	for (const [options, code] of [
		[{ environment: 'preview' }, 204],
		[{ environment: '' }, 204],
		[{ headers: {} }, 400],
		[{ headers: { ...scheduled, 'ce-vssschedulename': 'runtime-monitor' } }, 400],
		[{ method: 'GET' }, 400],
	]) {
		const result = await run(options);
		assert.equal(result.status, code);
		assert.deepEqual(result.calls, []);
		assert.deepEqual(result.errors, []);
	}
});

test('Vercel runs the probe once a day at 13:00 UTC', async () => {
	const config = JSON.parse(await readFile('vercel.json', 'utf8'));
	assert.deepEqual(config.functions['api/tutor-probe.ts'].experimentalTriggers, [{ type: 'schedule/v1beta' }]);
	assert.deepEqual(config.schedules['tutor-probe'], { schedule: '0 13 * * *', function: 'api/tutor-probe' });
});

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createStreamClient } from '../src/ui/client/conversation-stream.ts';
import { chatModelHeader } from '../src/config/chat-model.ts';
import { chatAutoModelHeader } from '../src/config/chat-auto.ts';
import { namespacedConversationId } from '../src/config/session.ts';
import { mergeCookies, mintSessionFixture } from './session-fixture.mjs';
import { writeModelResponse } from './request-path-smoke-transport.mjs';

// Failure cases: the HTTP model header is lost; overlapping users share a key or
// selection; a foreign owner reaches the provider; revoke leaves the next turn on
// a deleted key; revoking Alice also changes Bob; replies persist to the wrong trail.
// An admitted provider failure must log without prompt/key/user data; successful
// or aborted turns must stay quiet, and one settlement must not duplicate logs.
const out = resolve(process.env.REQUEST_PATH_SMOKE_OUT ?? '.cache/verification-2026-11-08/request-path');
const builtApp = resolve(process.env.REQUEST_PATH_SMOKE_DIST ?? 'dist');
const calls = [];
const checks = [];
const errors = [];
const syntheticKeys = { alice: 'synthetic-request-alice', bob: 'synthetic-request-bob', operator: 'synthetic-request-operator' };
const replyText = 'Synthetic request-path reply.';
const privatePrompt = 'private-failure-prompt-sentinel';
const pending = [];
let overlapTimer;
let appProcess;
let appDirectory;
let appError = '';
let failureLogCategories = [];
let frameworkStderrExposure;
let failure;

function listen(server) {
	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			server.off('error', reject);
			resolve(server.address().port);
		});
	});
}

const fakeProvider = createServer(async (request, response) => {
	try {
		assert.equal(request.method, 'POST');
		assert.ok(['/v1/responses', '/v1/chat/completions'].includes(request.url));
		let body = '';
		for await (const chunk of request) body += chunk;
		const payload = JSON.parse(body);
		assert.equal(payload.stream, true);
		const owner = Object.keys(syntheticKeys).find((key) => request.headers.authorization === `Bearer ${syntheticKeys[key]}`);
		assert.ok(owner, 'provider must receive only one of the synthetic credentials');
		const prompt = JSON.stringify(payload.input ?? payload.messages);
		if (prompt.includes('synthetic-abort-check')) {
			calls.push({ owner, model: payload.model, path: request.url, marker: 'aborted' });
			response.writeHead(200, { 'content-type': 'text/event-stream' });
			response.flushHeaders();
			return;
		}
		if (prompt.includes(privatePrompt)) {
			calls.push({ owner, model: payload.model, path: request.url, marker: 'provider-failure' });
			response.writeHead(500, { 'content-type': 'application/json', 'x-should-retry': 'false' });
			response.end(JSON.stringify({ error: { message: `Invalid API key. ${privatePrompt} ${syntheticKeys.operator}` } }));
			return;
		}
		const marker = [...prompt.matchAll(/alice-first|bob-first|alice-revoked|bob-after-revoke/g)].at(-1)?.[0];
		assert.ok(marker, 'provider request must belong to a synthetic turn');
		calls.push({ owner, model: payload.model, path: request.url, marker });
		const complete = () => writeModelResponse(response, { path: request.url, model: payload.model,
			text: `${replyText} ${marker}`, id: `resp_${marker}` });
		if (calls.length <= 2) {
			pending.push(complete);
			if (pending.length === 1) overlapTimer = setTimeout(() => {
				errors.push('Two model requests did not overlap within 10 seconds.');
				for (const finish of pending.splice(0)) finish();
			}, 10_000);
			if (pending.length === 2) {
				clearTimeout(overlapTimer);
				checks.push('two provider requests overlapped before either response');
				for (const finish of pending.splice(0)) finish();
			}
		} else complete();
	} catch (error) {
		errors.push(error.message);
		response.writeHead(500).end('Synthetic transport assertion failed.');
	}
});

async function waitForApp(origin) {
	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		assert.equal(appProcess.exitCode, null, `app exited: ${appError}`);
		try {
			if ((await fetch(`${origin}/healthz`)).ok) return;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	throw new Error(`App readiness timed out: ${appError}`);
}

async function keyRequest(origin, session, method, apiKey) {
	const response = await fetch(`${origin}/api/openai-key`, {
		method, headers: { cookie: session.cookie, 'content-type': 'application/json' },
		...(apiKey ? { body: JSON.stringify({ apiKey }) } : {}),
		signal: AbortSignal.timeout(10_000),
	});
	assert.equal(response.status, 200, `${method} key must be admitted`);
	session.cookie = mergeCookies(response, session.cookie);
	return response.json();
}

async function turn(origin, session, nonce, marker, model) {
	const url = `${origin}/api/agents/chat/${encodeURIComponent(namespacedConversationId(session.userId, nonce))}`;
	const headers = () => ({ cookie: session.cookie, [chatModelHeader]: model, [chatAutoModelHeader]: 'auto:smart' });
	const response = await fetch(url, { method: 'POST', headers: { ...headers(), 'content-type': 'application/json' },
		body: JSON.stringify({ kind: 'user', body: `Synthetic check ${marker}.` }), signal: AbortSignal.timeout(15_000) });
	assert.equal(response.status, 202, `${marker} must be admitted`);
	session.cookie = mergeCookies(response, session.cookie);
	const admission = await response.json();
	const client = createStreamClient({ url, headers });
	const reply = await client.read(admission, { signal: AbortSignal.timeout(15_000) });
	assert.equal(reply.text, `${replyText} ${marker}`);
	return { url, marker, model, headers, client };
}

try {
	const providerPort = await listen(fakeProvider);
	const probe = createServer();
	const appPort = await listen(probe);
	await new Promise((resolve) => probe.close(resolve));
	appDirectory = await mkdtemp(join(tmpdir(), 'socratink-request-path-'));
	await cp(builtApp, join(appDirectory, 'dist'), { recursive: true });
	await symlink(resolve('node_modules'), join(appDirectory, 'node_modules'), 'dir');
	const providerOrigin = `http://127.0.0.1:${providerPort}`;
	appProcess = spawn(process.execPath, ['--import', resolve('scripts/request-path-smoke-preload.mjs'), 'dist/server.mjs'], {
		cwd: appDirectory, stdio: ['ignore', 'ignore', 'pipe'],
		env: {
			PATH: process.env.PATH, NODE_ENV: 'development', PORT: String(appPort),
			SESSION_SECRET: 'synthetic-request-path-session-secret',
			CREDENTIALS_SECRET: 'synthetic-request-path-credentials-secret',
			REQUEST_PATH_SMOKE_PROVIDER_ORIGIN: providerOrigin,
			JON_LOCAL_BASE_URL: `${providerOrigin}/v1`, JON_LOCAL_MODEL_ID: 'auto',
			JON_LOCAL_API_KEY: syntheticKeys.operator,
		},
	});
	appProcess.stderr.on('data', (chunk) => { appError += chunk; });
	const origin = `http://127.0.0.1:${appPort}`;
	await waitForApp(origin);
	const [alice, bob] = await Promise.all([mintSessionFixture(origin), mintSessionFixture(origin)]);
	assert.notEqual(alice.userId, bob.userId);
	for (const [owner, session] of [['alice', alice], ['bob', bob]]) {
		assert.deepEqual(await keyRequest(origin, session, 'PUT', syntheticKeys[owner]),
			{ kind: 'openai', openai: true, openrouter: false });
	}
	checks.push('two real signed sessions saved distinct keys through PUT');
	const first = await Promise.all([
		turn(origin, alice, 'first', 'alice-first', 'openai/gpt-5-mini'),
		turn(origin, bob, 'first', 'bob-first', 'openai/gpt-5'),
	]);
	assert.deepEqual(errors, []);
	assert.deepEqual([...calls].sort((a, b) => a.marker.localeCompare(b.marker)), [
		{ owner: 'alice', model: 'gpt-5-mini', path: '/v1/responses', marker: 'alice-first' },
		{ owner: 'bob', model: 'gpt-5', path: '/v1/responses', marker: 'bob-first' },
	]);
	checks.push('actual signed model headers reached the provider with each user’s own key');
	for (const method of ['GET', 'POST']) {
		const rejected = await fetch(first[0].url, { method, headers: { cookie: bob.cookie, 'content-type': 'application/json' },
			...(method === 'POST' ? { body: JSON.stringify({ kind: 'user', body: 'Synthetic foreign owner.' }) } : {}) });
		assert.equal(rejected.status, 403);
		assert.equal((await rejected.json()).error.type, 'forbidden');
		bob.cookie = mergeCookies(rejected, bob.cookie);
	}
	assert.equal(calls.length, 2, 'foreign reads and writes must not reach the provider');
	checks.push('foreign-owner reads and writes rejected without another model call');
	assert.deepEqual(await keyRequest(origin, alice, 'DELETE'), { kind: 'operator', openai: false, openrouter: false });
	const status = await fetch(`${origin}/api/chat-route`, { headers: { cookie: alice.cookie } });
	assert.deepEqual(await status.json(), { kind: 'operator', openai: false, openrouter: false });
	await turn(origin, alice, 'first', 'alice-revoked', 'openai/gpt-5-mini');
	await turn(origin, bob, 'first', 'bob-after-revoke', 'openai/gpt-5');
	assert.deepEqual(calls.slice(2), [
		{ owner: 'operator', model: 'auto:smart', path: '/v1/chat/completions', marker: 'alice-revoked' },
		{ owner: 'bob', model: 'gpt-5', path: '/v1/responses', marker: 'bob-after-revoke' },
	]);
	checks.push('DELETE removes Alice’s key; her next turn in the same conversation uses operator selection; Bob retains his own key');
	for (const entry of first) {
		const history = await entry.client.history();
		const serialized = JSON.stringify(history);
		assert.ok(serialized.includes(`${replyText} ${entry.marker}`));
		assert.equal(serialized.includes(entry.marker === 'alice-first' ? 'bob-first' : 'alice-first'), false);
	}
	checks.push('completed replies persist only in their owner’s conversation');
	assert.deepEqual(errors, []);
	assert.equal(calls.length, 4);
	assert.equal(appError.includes('socratink_failure'), false, 'successful turns must not log a failure');
	const abortSession = await mintSessionFixture(origin);
	const abortUrl = `${origin}/api/agents/chat/${encodeURIComponent(namespacedConversationId(abortSession.userId, 'abort'))}`;
	const abortClient = createStreamClient({ url: abortUrl, headers: { cookie: abortSession.cookie } });
	const abortAdmission = await abortClient.send({ message: { kind: 'user', body: 'synthetic-abort-check' } });
	for (let attempt = 0; attempt < 100 && !calls.some((call) => call.marker === 'aborted'); attempt += 1) {
		await new Promise((resolve) => setTimeout(resolve, 25));
	}
	assert.ok(calls.some((call) => call.marker === 'aborted'), 'abort check must reach the provider');
	const aborted = await fetch(`${abortUrl}/abort`, { method: 'POST', headers: { cookie: abortSession.cookie } });
	assert.equal(aborted.status, 200);
	await assert.rejects(abortClient.read(abortAdmission, { signal: AbortSignal.timeout(10_000) }),
		(error) => error.name !== 'TimeoutError');
	assert.equal((await abortClient.history()).settlements.at(-1)?.outcome, 'aborted');
	assert.equal(appError.includes('socratink_failure'), false, 'learner cancellation must not log a failure');
	checks.push('successful turns and learner cancellation do not emit failure logs');
	const failureSession = await mintSessionFixture(origin);
	const failureUrl = `${origin}/api/agents/chat/${encodeURIComponent(namespacedConversationId(failureSession.userId, 'failure'))}`;
	const failureClient = createStreamClient({ url: failureUrl, headers: { cookie: failureSession.cookie } });
	const failedAdmission = await failureClient.send({ message: { kind: 'user', body: privatePrompt } });
	let didFail = false;
	try {
		await failureClient.read(failedAdmission, { signal: AbortSignal.timeout(30_000) });
	} catch (error) {
		assert.notEqual(error.name, 'TimeoutError', 'provider failure must settle, not time out');
		didFail = true;
	}
	assert.ok(didFail, 'admitted provider failure must reach the client');
	const failureHistory = await failureClient.history();
	assert.equal(failureHistory.settlements.at(-1)?.outcome, 'failed');
	for (let attempt = 0; attempt < 40 && !appError.includes('"category":"submission_recovery"'); attempt += 1) {
		await new Promise((resolve) => setTimeout(resolve, 25));
	}
	const failureLines = appError.split('\n').filter((line) => line.includes('socratink_failure'));
	failureLogCategories = failureLines.map((line) => JSON.parse(line).category);
	frameworkStderrExposure = {
		prompt: appError.includes(privatePrompt),
		credential: Object.values(syntheticKeys).some((value) => appError.includes(value)),
		learnerId: appError.includes(failureSession.userId),
	};
	assert.equal(failureLogCategories.filter((category) => category === 'submission_failed').length, 1,
		'one terminal background failure must produce one terminal failure log');
	assert.ok(failureLogCategories.includes('submission_recovery'), 'contained recovery failure must also be observable');
	for (const line of failureLines) {
		const record = JSON.parse(line);
		assert.ok(['submission_failed', 'submission_recovery'].includes(record.category));
		assert.deepEqual(record, { event: 'socratink_failure', category: record.category });
	}
	for (const privateValue of [privatePrompt, ...Object.values(syntheticKeys), failureSession.userId,
		alice.userId, bob.userId, failureSession.cookie]) {
		assert.equal(failureLines.join('\n').includes(privateValue), false,
			'Socratink failure records must not reveal learner or credential data');
	}
	checks.push('admitted provider HTTP 500 emits one terminal failure and a recovery signal, both payload-free');
} catch (error) {
	failure = error;
} finally {
	clearTimeout(overlapTimer);
	if (appProcess?.exitCode === null) {
		appProcess.kill('SIGTERM');
		const killTimer = setTimeout(() => appProcess.kill('SIGKILL'), 5000);
		await new Promise((resolve) => appProcess.once('exit', resolve));
		clearTimeout(killTimer);
	}
	fakeProvider.closeAllConnections();
	await new Promise((resolve) => fakeProvider.close(resolve));
	if (appDirectory) await rm(appDirectory, { recursive: true, force: true });
	await mkdir(out, { recursive: true });
	await writeFile(join(out, 'proof.json'), `${JSON.stringify({
		passed: !failure, node: process.version, command: 'node scripts/request-path-smoke.mjs', builtApp,
		entry: 'built dist/server.mjs → real src/app routes → real provider SDK → fake HTTP transport',
		checks, calls, errors, failureLogCategories, frameworkStderrExposure,
		...(failure ? { failure: failure.message } : {}),
		limits: ['Synthetic signed guest sessions, not OAuth login.', 'SQLite storage; PostgreSQL has a separate check.',
			'Fake provider HTTP responses; no live model or provider account was used.', 'Revocation applies to later admissions, not already admitted work.',
			'Dependencies may separately print raw provider errors to stderr; payload-free assertions cover only the added Socratink failure records.',
			'OpenAI Responses does not expose responseModel in the installed provider SDK; optional saved route metadata is absent. Model selection is verified at the HTTP transport.'],
	}, null, 2)}\n`);
}
if (failure) throw failure;
console.log(`Request-path smoke passed: ${checks.length} checks, ${calls.length} provider calls. Artifact: ${join(out, 'proof.json')}`);

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStreamClient } from '../src/ui/client/conversation-stream.ts';
import { mergeCookies } from './session-fixture.mjs';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export function gate() {
	let release;
	const promise = new Promise((resolve) => { release = resolve; });
	return { promise, release };
}
export async function until(check, label, timeout = 10_000) {
	const end = Date.now() + timeout;
	while (Date.now() < end) {
		if (await check()) return;
		await delay(40);
	}
	throw new Error(`Timed out: ${label}`);
}
export async function listen(server) {
	await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
	return server.address().port;
}
export async function close(server) {
	if (!server?.listening) return;
	server.closeAllConnections();
	await new Promise((resolve) => server.close(resolve));
}

// Synthetic transport only. Keep the normal application, auth, provider selection,
// browser SDK, and durable storage in the path exercised by each test.
export async function startFixture() {
	const plans = new Map();
	const calls = [];
	const errors = [];
	const secrets = new Map([['synthetic-durable-operator-key', 'operator']]);
	const held = new Set();
	const server = createServer(async (request, response) => {
		try {
			let raw = '';
			for await (const chunk of request) raw += chunk;
			if (request.url === '/oauth/token') {
				const code = new URLSearchParams(raw).get('code');
				assert.match(code, /^synthetic-[a-z]+$/);
				response.writeHead(200, { 'content-type': 'application/json' });
				response.end(JSON.stringify({ access_token: code }));
				return;
			}
			if (request.url === '/oauth/userinfo') {
				const subject = request.headers.authorization?.replace('Bearer ', '');
				assert.match(subject, /^synthetic-[a-z]+$/);
				response.writeHead(200, { 'content-type': 'application/json' });
				response.end(JSON.stringify({ sub: subject, email: `${subject}@example.invalid`, email_verified: true }));
				return;
			}
			assert.ok(['/v1/responses', '/v1/chat/completions'].includes(request.url));
			const body = JSON.parse(raw);
			const prompt = JSON.stringify(body.input ?? body.messages);
			const marker = prompt.match(/DURABLE_[A-Z_]+/g)?.at(-1);
			const plan = plans.get(marker);
			assert.ok(plan?.length, `No synthetic response planned for ${marker}`);
			const step = plan.shift();
			const key = request.headers.authorization?.replace('Bearer ', '');
			assert.ok(secrets.has(key), 'Provider must receive a known synthetic key');
			calls.push({ marker, path: request.url, key: secrets.get(key), model: body.model });
			if (step.afterReasoning) held.add(step.afterReasoning);
			if (step.before) held.add(step.before);
			if (step.before) await step.before.promise;
			if (step.fail) {
				response.writeHead(500, { 'content-type': 'application/json' });
				response.end(JSON.stringify({ error: { message: `${marker} ${key}` } }));
				return;
			}
			await writePlannedResponse(response, { ...step, path: request.url, model: body.model,
				id: `synthetic_${calls.length}` });
		} catch (error) {
			errors.push(String(error));
			if (!response.headersSent) response.writeHead(500);
			response.end('Synthetic fixture failed.');
		}
	});
	const origin = `http://127.0.0.1:${await listen(server)}`;
	return {
		origin, calls, errors, secrets,
		plan(marker, ...steps) { assert.match(marker, /^DURABLE_[A-Z_]+$/); plans.set(marker, steps); },
		count(marker) { return calls.filter((call) => call.marker === marker).length; },
		async stop() { for (const item of held) item.release(); await close(server); },
	};
}

async function writePlannedResponse(response, step) {
	const { path, id, model, reasoning, tools = [], text = '', afterReasoning } = step;
	response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache',
		'x-routed-via': encodeURIComponent('synthetic/routed-model'), 'x-fallback-attempts': '1' });
	const emit = (event) => response.write(`data: ${JSON.stringify(event)}\n\n`);
	if (path === '/v1/chat/completions') {
		const base = { id, object: 'chat.completion.chunk', created: 0, model };
		const delta = (value, finish = null) => emit({ ...base, choices: [{ index: 0, delta: value, finish_reason: finish }] });
		delta({ role: 'assistant', content: '' });
		if (reasoning) delta({ reasoning_content: reasoning });
		if (afterReasoning) await afterReasoning.promise;
		if (text) delta({ content: text });
		if (tools.length) delta({ tool_calls: tools.map((tool, index) => ({ index,
			id: `call_${id}_${index}`, type: 'function', function: { name: tool.name, arguments: JSON.stringify(tool.arguments) } })) });
		delta({}, tools.length ? 'tool_calls' : 'stop');
		response.end('data: [DONE]\n\n');
		return;
	}
	const output = [];
	emit({ type: 'response.created', response: { id } });
	if (reasoning) {
		const item = { id: `rs_${id}`, type: 'reasoning', summary: [{ type: 'summary_text', text: reasoning }] };
		emit({ type: 'response.output_item.added', output_index: 0, item: { ...item, summary: [] } });
		emit({ type: 'response.reasoning_summary_text.delta', output_index: 0, summary_index: 0, delta: reasoning });
		if (afterReasoning) await afterReasoning.promise;
		emit({ type: 'response.output_item.done', output_index: 0, item });
		output.push(item);
	} else if (afterReasoning) await afterReasoning.promise;
	for (const [index, tool] of tools.entries()) {
		const item = { id: `fc_${id}_${index}`, type: 'function_call', call_id: `call_${id}_${index}`,
			name: tool.name, arguments: JSON.stringify(tool.arguments), status: 'completed' };
		const output_index = output.length;
		emit({ type: 'response.output_item.added', output_index, item: { ...item, arguments: '' } });
		emit({ type: 'response.function_call_arguments.delta', output_index, delta: item.arguments });
		emit({ type: 'response.output_item.done', output_index, item });
		output.push(item);
	}
	if (text) {
		const item = { id: `msg_${id}`, type: 'message', role: 'assistant', status: 'completed',
			content: [{ type: 'output_text', text, annotations: [] }] };
		const output_index = output.length;
		emit({ type: 'response.output_item.added', output_index, item: { ...item, content: [] } });
		emit({ type: 'response.output_text.delta', output_index, content_index: 0, delta: text });
		emit({ type: 'response.output_item.done', output_index, item });
		output.push(item);
	}
	emit({ type: 'response.completed', response: { id, status: 'completed', model, output,
		usage: { input_tokens: 8, output_tokens: 8, total_tokens: 16 } } });
	response.end();
}

export function appFactory(fixture, { databaseUrl, secrets: suppliedSecrets,
	dist = process.env.DURABLE_SMOKE_DIST || resolve('dist') } = {}) {
	const directories = new Set();
	const processes = new Set();
	const logs = [];
	const rawLogs = [];
	const secrets = suppliedSecrets ?? {
		SESSION_SECRET: randomBytes(32).toString('hex'), CREDENTIALS_SECRET: randomBytes(32).toString('hex'),
	};
	for (const name of ['SESSION_SECRET', 'CREDENTIALS_SECRET']) {
		assert.equal(typeof secrets[name], 'string', `${name} must be supplied explicitly or generated for this test`);
		assert.ok(secrets[name].length > 0);
	}
	function redact(value) {
		let text = String(value);
		for (const secret of [...Object.values(secrets), ...fixture.secrets.keys(), databaseUrl].filter(Boolean)) {
			text = text.replaceAll(secret, '[redacted]');
		}
		return text;
	}
	return {
		logs, redact, hasRawLog: (value) => rawLogs.some((read) => read().includes(value)),
		async start({ entry = 'server.mjs', directory } = {}) {
			if (!directory) {
				directory = await mkdtemp(join(tmpdir(), 'socratink-durable-smoke-'));
				directories.add(directory);
				await cp(dist, join(directory, 'dist'), { recursive: true });
				await symlink(resolve('node_modules'), join(directory, 'node_modules'), 'dir');
			}
			const reserve = createServer();
			const port = await listen(reserve);
			await close(reserve);
			const origin = `http://127.0.0.1:${port}`;
			const child = spawn(process.execPath, ['--import', fileURLToPath(new URL('./postgres-smoke-preload.mjs', import.meta.url)),
				`dist/${entry}`], { cwd: directory, env: {
				PATH: process.env.PATH, NODE_ENV: databaseUrl ? 'production' : 'development', PORT: String(port), ...secrets,
				...(databaseUrl ? { DATABASE_URL: databaseUrl } : {}),
				JON_LOCAL_BASE_URL: `${fixture.origin}/v1`, JON_LOCAL_MODEL_ID: 'auto',
				JON_LOCAL_API_KEY: 'synthetic-durable-operator-key', POSTGRES_SMOKE_FIXTURE_ORIGIN: fixture.origin,
				GOOGLE_CLIENT_ID: 'synthetic-google-client', GOOGLE_CLIENT_SECRET: 'synthetic-google-secret',
				AUTH_REDIRECT_BASE_URL: origin,
			}, stdio: ['ignore', 'pipe', 'pipe'] });
			processes.add(child);
			let rawLog = '';
			rawLogs.push(() => rawLog);
			for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => {
				rawLog += String(chunk);
				logs.push(`[${entry}] ${redact(chunk)}`);
			});
			const stop = async (signal = 'SIGTERM') => {
				if (child.exitCode !== null || child.signalCode !== null) return;
				const exited = new Promise((resolve) => child.once('exit', resolve));
				child.kill(signal);
				const timer = setTimeout(() => child.kill('SIGKILL'), 5_000);
				await exited;
				clearTimeout(timer);
			};
			await until(async () => {
				assert.equal(child.exitCode, null, `Built ${entry} exited: ${redact(rawLog)}`);
				try { return (await fetch(`${origin}/healthz`, { signal: AbortSignal.timeout(500) })).ok; } catch { return false; }
			}, 'built application readiness', 15_000);
			return { origin, directory, stop, log: () => rawLog };
		},
		async stop() {
			for (const child of processes) {
				if (child.exitCode !== null || child.signalCode !== null) continue;
				const exited = new Promise((resolve) => child.once('exit', resolve));
				child.kill('SIGKILL');
				await exited;
			}
			for (const directory of directories) await rm(directory, { recursive: true, force: true });
		},
	};
}

export function clientFor(app, session, nonce, headers = {}) {
	const id = nonce.includes(':') ? nonce : `${session.userId}:${nonce}`;
	return createStreamClient({ url: `${app.origin}/api/agents/chat/${encodeURIComponent(id)}`,
		headers: { cookie: session.cookie, ...headers } });
}
export async function sendText(client, text, options = {}) {
	const signal = AbortSignal.timeout(20_000);
	const admission = await client.send({ message: { kind: 'user', body: text }, signal });
	const reply = await client.read(admission, { signal, ...options });
	return { admission, reply, history: await client.history({ signal }) };
}
export function userMessages(history) {
	return history.messages.filter((message) => message.role === 'user');
}
export async function storeKey(app, session, key) {
	const response = await fetch(`${app.origin}/api/openai-key`, { method: 'PUT',
		headers: { cookie: session.cookie, 'content-type': 'application/json' }, body: JSON.stringify({ apiKey: key }) });
	assert.equal(response.status, 200, 'synthetic learner key must store through normal API');
}
export async function oauth(app, session, code) {
	const login = await fetch(`${app.origin}/api/auth/google/login`, { redirect: 'manual', headers: { cookie: session.cookie } });
	assert.equal(login.status, 302);
	const state = new URL(login.headers.get('location')).searchParams.get('state');
	const callback = await fetch(`${app.origin}/api/auth/google/callback?code=${code}&state=${encodeURIComponent(state)}`, {
		redirect: 'manual', headers: { cookie: mergeCookies(login, session.cookie) },
	});
	assert.equal(callback.status, 302);
	assert.equal(callback.headers.get('location'), '/');
	const cookie = mergeCookies(callback, session.cookie);
	const response = await fetch(`${app.origin}/api/session`, { headers: { cookie } });
	assert.equal(response.status, 200);
	return { ...await response.json(), cookie };
}

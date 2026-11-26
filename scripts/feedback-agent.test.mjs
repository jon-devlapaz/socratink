import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { describe, it } from 'node:test';
import { feedback } from '../src/config/feedback.ts';
import { sendAgentFeedback } from '../src/server/modem-feedback.ts';
import { getAuthDb } from '../src/server/auth-runtime.ts';
import { openEngine } from '../src/server/durable/engine.ts';
import { startFixture, until } from './durable-smoke-support.mjs';

test('tutor sends one approved draft with the right account on its Modem connection', async () => {
	const workspace = process.cwd();
	const directory = await mkdtemp(join(tmpdir(), 'socratink-feedback-agent-'));
	const fixture = await startFixture();
	const token = 'synthetic-channel-token';
	const originalToken = process.env.VITE_MODEM_FEEDBACK_TOKEN;
	const originalFetch = globalThis.fetch;
	const databaseEnv = ['DATABASE_URL', 'NODE_ENV', 'VERCEL'].map((key) => [key, process.env[key]]);
	const modem = [];
	let engine;
	try {
		process.chdir(directory);
		for (const [key] of databaseEnv) delete process.env[key];
		process.env.VITE_MODEM_FEEDBACK_TOKEN = token;
		const authDb = getAuthDb();
		const accounts = [
			await authDb.createUser('learner-one', 'élève@example.invalid'),
			await authDb.createUser('learner-two', 'second@example.invalid'),
		];
		await authDb.createAlias('former-guest', accounts[0].id);
		globalThis.fetch = async (url, init) => {
			if (url !== feedback.mcp) return originalFetch(url, init);
			const { headers } = init;
			assert.equal(headers.get('Authorization'), `Bearer ${token}`);
			const request = init.body ? JSON.parse(init.body) : { method: init.method };
			const user = JSON.parse(decodeURIComponent(headers.get('X-Modem-App-User')));
			const context = JSON.parse(headers.get('X-Modem-App-Context'));
			assert.match(context.session_id, /^[0-9a-f]{64}$/);
			assert.equal(context.client, 'Socratink tutor');
			modem.push({ method: request.method, user, context, args: request.params?.arguments });
			const session = `fixture-${user.id}`;
			if (request.method === 'initialize') return new Response(
				`event: message\ndata: ${JSON.stringify({ jsonrpc: '2.0', id: request.id, result: { protocolVersion: '2025-03-26' } })}\n\n`,
				{ headers: { 'Content-Type': 'text/event-stream', 'Mcp-Session-Id': session } },
			);
			assert.equal(headers.get('Mcp-Session-Id'), session);
			assert.equal(headers.get('Mcp-Protocol-Version'), '2025-03-26');
			if (request.method === 'notifications/initialized') return new Response(null, { status: 202 });
			if (request.method === 'DELETE') return new Response(null, { status: 204 });
			assert.equal(request.method, 'tools/call');
			assert.equal(request.params.name, 'submit_feedback');
			return Response.json({ jsonrpc: '2.0', id: request.id, result: { structuredContent: { id: 'receipt' } } });
		};

		engine = await openEngine({
			target: { kind: 'sqlite', filename: join(directory, 'pi.sqlite') },
			resolveModel: async () => ({
				provider: 'jon-local', modelId: 'synthetic', apiKey: 'synthetic-durable-operator-key',
				baseUrl: fixture.origin + '/v1', contextWindow: 128_000, maxTokens: 4096,
			}),
		});
		const messages = ['The question card did not show choices.', 'The menu was hard to find.'];
		const owners = ['former-guest', accounts[1].id];
		const markers = ['DURABLE_FEEDBACK_ONE', 'DURABLE_FEEDBACK_TWO'];
		const report = (message) => ({
			name: 'submit_feedback', arguments: { message, category: 'user_feedback' },
		});
		for (const [index, owner] of owners.entries()) {
			const draft = messages[index];
			const marker = markers[index];
			const conversation = owner + ':feedback';
			const offer = `This goes to the Socratink team through Modem. Your account email goes with it.\n\nFeedback draft:\n${draft}\nReply "Send feedback" to send this report.`;
			fixture.plan(marker,
				{ tools: [report(draft)] }, { text: offer },
				{ tools: [report('Different message')] }, { text: offer },
				{ tools: [report(draft), report(draft)] }, { text: offer },
				{ tools: [report(draft)] }, { tools: [report(draft)] }, { text: 'Modem accepted the feedback.' },
			);
			for (const [turn, text] of [`Feedback about the app ${marker}`, 'Send feedback', 'Send feedback', 'Send feedback'].entries()) {
				const id = await engine.submit(conversation, text);
				await until(async () => (await engine.snapshot(conversation)).submissions.some((item) => item.id === id && item.outcome === 'completed'), 'feedback turn settlement');
				assert.equal(modem.filter(({ method }) => method === 'tools/call').length, index + Number(turn === 3));
			}
		}
		assert.deepEqual(fixture.errors, []);
		assert.deepEqual(modem.filter(({ method }) => method === 'tools/call').map(({ user, args }) => ({ user, args })), accounts.map(({ id, email }, index) => ({
			user: { id, email }, args: { message: messages[index], category: 'user_feedback' },
		})));
		assert.equal(new Set(modem.map(({ context }) => context.session_id)).size, 2);
	} finally {
		globalThis.fetch = originalFetch;
		if (originalToken === undefined) delete process.env.VITE_MODEM_FEEDBACK_TOKEN;
		else process.env.VITE_MODEM_FEEDBACK_TOKEN = originalToken;
		for (const [key, value] of databaseEnv) if (value !== undefined) process.env[key] = value;
		await engine?.close();
		await fixture.stop();
		process.chdir(workspace);
		await rm(directory, { recursive: true, force: true });
	}
});

describe('sendAgentFeedback', () => {
	const initialize = 'initialize';
	const ready = 'notifications/initialized';
	const send = 'tools/call';
	const close = 'DELETE';
	const context = { session_id: 'test-feedback-session', client: 'Socratink tutor', environment: 'test' };
	const args = { message: 'Keep my place.', category: 'user_feedback' };

	async function deliver(t, answers) {
		const methods = [];
		const submitted = [];
		t.mock.method(globalThis, 'fetch', async (url, init) => {
			const rpc = init.body && JSON.parse(init.body);
			const method = rpc?.method ?? init.method;
			methods.push(method);
			if (method === send) submitted.push({
				url, params: rpc.params, account: init.headers.get('X-Modem-App-User'),
			});
			const reply = answers[method];
			if (reply instanceof Error) throw reply;
			return typeof reply === 'function' ? reply(rpc.id) : reply;
		});
		const outcome = await sendAgentFeedback('synthetic-channel', undefined, context, args);
		return { outcome, methods, submitted };
	}

	function session(callResult) {
		return {
			[initialize]: (id) => Response.json({ id, result: { protocolVersion: '2025-03-26' } }, {
				headers: { 'Mcp-Session-Id': 'synthetic-modem-session' },
			}),
			[ready]: new Response(null, { status: 202 }),
			[send]: callResult,
			[close]: new Response(null, { status: 204 }),
		};
	}

	for (const [name, callResult, outcome] of [
		['a receipt in a text response', (id) => Response.json({ id, result: { content: [{ type: 'text', text: '{"id":"receipt"}' }] } }), 'accepted'],
		['Modem declines the report', (id) => Response.json({ id, result: { isError: true } }), 'rejected'],
		['the reply has no receipt', (id) => Response.json({ id, result: {} }), 'unconfirmed'],
		['the connection drops after submission', new Error('Connection closed'), 'unconfirmed'],
	]) {
		it(name, async (t) => {
			const result = await deliver(t, session(callResult));
			assert.equal(result.outcome, outcome);
			assert.deepEqual(result.submitted, [{
				url: feedback.mcp, params: { name: 'submit_feedback', arguments: args }, account: null,
			}]);
			assert.deepEqual(result.methods, [initialize, ready, send, close]);
		});
	}

	it('Modem is unavailable before submission', async (t) => {
		const result = await deliver(t, { [initialize]: new Error('Connection refused') });
		assert.equal(result.outcome, 'unavailable');
		assert.deepEqual(result.submitted, []);
		assert.deepEqual(result.methods, [initialize]);
	});
});

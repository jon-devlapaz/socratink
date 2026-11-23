import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import type { WireMessage, WirePart } from '../../src/config/chat-wire.ts';
import { behaviourRules, type BehaviourRuleId } from '../../src/learning/behaviour-rules.ts';
import { markRevealRetryBodies } from '../../src/learning/mark-reveal.ts';
import { presentQuestionRetryBodies } from '../../src/learning/present-question.ts';
import type { EngineOptions } from '../../src/server/durable/contract.ts';
import { questionsIn, replyChecks } from './checks.ts';
import { scenarios } from './scenarios.ts';
import { runEval, type ScenarioResult } from './run.ts';

// The checks must pass a tutor that follows the policy and fail a scripted tutor with
// each known bug. Both tutors are fakes at the model provider; no real model is called.

const reply = (text: string, extra: WirePart[] = []): WireMessage =>
	({ role: 'assistant', id: 'x:assistant', display: 'visible', submissionId: 'x', parts: [{ type: 'text', text, state: 'done' }, ...extra] });
const failing = (message: WireMessage) => replyChecks(message).filter((c) => c.status === 'fail').map((c) => c.check);

test('the reply from #136 fails on its internal notes', () => {
	const text = 'Alright, no answer shown.\n\nWhat happens to blue light when it hits air molecules?\n\n(no reveal — this was a question only)';
	assert.deepEqual(failing(reply(text)), ['no-internal-notes', 'ends-on-question']);
});

test('two questions fail; a skill map fence and a quoted question do not count', () => {
	assert.deepEqual(failing(reply('What is a vector? And what is a scalar?')), ['one-question']);
	const map = '```text\nWhy? ███░░ 3/5\n```\n\n> Is this a quote?\n\nWhich force pulls the apple down?';
	assert.deepEqual(failing(reply(map)), []);
	assert.deepEqual(questionsIn(map), ['Which force pulls the apple down?']);
});

test('a short tag such as "Why or why not?" is part of the question before it', () => {
	assert.deepEqual(failing(reply('Would any place still have seasons? Why or why not?')), []);
	assert.deepEqual(failing(reply('Why or why not? What is a vector?')), ['one-question']);
});

test('a tutor card counts as the question, and a teaching cue needs a recorded reveal', () => {
	const card: WirePart = { type: 'data-questionnaire', data: { kind: 'question', submitLabel: 'Submit',
		items: [{ name: 'item', prompt: 'Which is denser?', required: true, multiple: false, choices: [{ value: 'a', label: 'Ice' }, { value: 'b', label: 'Water' }] }] } };
	assert.deepEqual(failing(reply('Good start. What do you think?', [card])), ['one-question']);
	assert.deepEqual(failing(reply('The key idea is density. What floats?')), ['reveal-marked']);
	assert.deepEqual(failing(reply('The key idea is density. What floats?', [{ type: 'data-reveal', data: { kind: 'partial' } }])), []);
});

type Request = { learner: string; afterTool: boolean; corrected: boolean };
type Step = { text: string } | { tool: string; args: unknown };
const corrections: string[] = Object.values({ ...markRevealRetryBodies, ...presentQuestionRetryBodies });

/** A fake OpenAI-compatible provider that streams one step chosen by `tutor`. */
async function withProvider<T>(tutor: (request: Request) => Step, run: (resolveModel: EngineOptions['resolveModel']) => Promise<T>): Promise<T> {
	const server = createServer(async (request, response) => {
		let raw = '';
		for await (const chunk of request) raw += chunk;
		const { messages } = JSON.parse(raw) as { messages: { role: string; content: unknown }[] };
		const text = (content: unknown) => typeof content === 'string' ? content
			: Array.isArray(content) ? content.map((part: { text?: string }) => part.text ?? '').join('') : '';
		const users = messages.filter((m) => m.role === 'user').map((m) => text(m.content));
		const step = tutor({ learner: users.findLast((u) => !corrections.includes(u)) ?? '',
			afterTool: messages.at(-1)?.role === 'tool', corrected: corrections.includes(users.at(-1) ?? '') });
		response.writeHead(200, { 'content-type': 'text/event-stream' });
		const emit = (delta: object, finish: string | null = null) =>
			response.write(`data: ${JSON.stringify({ id: 'fake', model: 'fake', choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`);
		if ('tool' in step) {
			emit({ role: 'assistant', tool_calls: [{ index: 0, id: `call_${Math.random().toString(36).slice(2)}`, type: 'function',
				function: { name: step.tool, arguments: JSON.stringify(step.args) } }] });
			emit({}, 'tool_calls');
		} else {
			emit({ role: 'assistant', content: step.text });
			emit({}, 'stop');
		}
		response.end('data: [DONE]\n\n');
	});
	await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
	try {
		const { port } = server.address() as AddressInfo;
		return await run(async () => ({ provider: 'jon-local', modelId: 'fake', apiKey: 'fake',
			baseUrl: `http://127.0.0.1:${port}/v1`, contextWindow: 128000, maxTokens: 4096 }));
	} finally {
		server.closeAllConnections();
		await new Promise((done) => server.close(done));
	}
}

const answer = 'Seasons come from the tilt of Earth\'s axis, about 23.5 degrees, which changes how directly sunlight hits each hemisphere.';
const mark = (args: object): Step => ({ tool: 'mark_reveal', args });

function goodTutor({ learner, afterTool, corrected }: Request): Step {
	const has = (pattern: RegExp) => pattern.test(learner);
	if (corrected) return { text: '' };
	if (afterTool) return { text: has(/hint/i) ? 'Think about where the middle of the list is. Which half could hold the item?'
		: `${answer} If Earth had no tilt, what would happen to the seasons?` };
	if (has(/just tell me/i)) return mark({ kind: 'full_answer', requested: true });
	if (has(/Try once more/)) return { text: 'Which colour of sunlight do you think scatters most in air?' };
	if (has(/don't know|Asked for a hint|hint\?/i)) return mark({ kind: has(/hint/i) ? 'hint' : 'partial' });
	if (has(/reflects the ocean/)) return mark({ kind: 'full_answer' });
	if (has(/vaccines/)) return { tool: 'present_question', args: { prompt: 'What does a vaccine put in your body?', choices: ['A harmless piece of a germ', 'Antibodies'], reasoning: true } };
	return { text: 'Let\'s find your starting point. What do you already know about this?' };
}

/** One known bug per rule. */
function badTutor({ learner, afterTool, corrected }: Request): Step {
	const has = (pattern: RegExp) => pattern.test(learner);
	if (afterTool || corrected) return { text: afterTool ? answer : '' };
	if (has(/just tell me|Try once more|reflects the ocean/)) return mark({ kind: 'full_answer' });
	if (has(/sky is blue/)) return { text: 'Alright, no answer shown. What scatters?\n\n(no reveal — this was a question only)' };
	if (has(/don't know|hint/i)) return { text: 'The key idea is density. Is ice less dense?' };
	if (has(/binary search/)) return { text: 'Which would you like to start with?\n\n- Sorted lists\n- Midpoints' };
	return { text: 'What do you know? And why do you care?' };
}

const failedChecks = (results: ScenarioResult[], scenario: string) =>
	new Set(results.find((r) => r.scenario === scenario)?.checks.filter((c) => c.status === 'fail').map((c) => c.check));

test('a policy-following tutor passes every scenario', async () => {
	const results = await withProvider(goodTutor, (resolveModel) => runEval({ scenarios, resolveModel, turnTimeoutMs: 20_000 }));
	assert.deepEqual(results.flatMap((r) => r.checks.filter((c) => c.status !== 'pass').map((c) => `${r.scenario}: ${c.check} ${c.status} ${c.detail ?? ''}`)), []);
	assert.match(results.find((r) => r.scenario === 'just-tell-me-later')?.turns[1]?.learner ?? '',
		/^Questionnaire answers:\n- What does a vaccine put in your body\?: A harmless piece of a germ, I think/);
	assert.match(results.find((r) => r.scenario === 'try-once-more-no-notes')?.turns.at(-1)?.learner ?? '', /: Try once more$/);
});

test('a tutor with the known bugs fails every behaviour rule, each where expected', async () => {
	const results = await withProvider(badTutor, (resolveModel) => runEval({ scenarios, resolveModel, turnTimeoutMs: 20_000 }));
	const expected: Record<string, BehaviourRuleId[]> = {
		'first-turn-diagnostic': ['one-question'],
		'just-tell-me-first-message': ['just-tell-me'],
		'just-tell-me-later': ['just-tell-me', 'one-question'],
		'try-once-more-no-notes': ['no-internal-notes', 'ends-on-question', 'try-once-more-withholds'],
		'i-dont-know-is-marked': ['dont-know-marked', 'reveal-marked'],
		'hint-is-marked': ['hint-marked', 'choices-boxed'],
	};
	for (const [scenario, checks] of Object.entries(expected)) {
		for (const check of checks) assert.ok(failedChecks(results, scenario).has(check), `${scenario} must fail ${check}`);
	}
	const covered = new Set(Object.values(expected).flat());
	assert.deepEqual(Object.keys(behaviourRules).filter((id) => !covered.has(id as BehaviourRuleId)), [], 'every rule needs a bug the eval catches');
});

test('a turn that fails at the provider records why', async () => {
	const server = createServer(async (request, response) => {
		for await (const _chunk of request) { /* drain */ }
		response.writeHead(400, { 'content-type': 'application/json' });
		response.end(JSON.stringify({ error: { message: 'synthetic bad request' } }));
	});
	await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
	try {
		const { port } = server.address() as AddressInfo;
		const [first] = scenarios;
		assert.ok(first);
		const [result] = await runEval({ scenarios: [first], turnTimeoutMs: 20_000, resolveModel: async () => ({ provider: 'jon-local',
			modelId: 'fake', apiKey: 'fake', baseUrl: `http://127.0.0.1:${port}/v1`, contextWindow: 128000, maxTokens: 4096 }) });
		const failed = result?.checks.find((c) => c.check === 'turn-completed');
		assert.equal(failed?.status, 'fail');
		assert.match(failed?.detail ?? '', /^turn ended failed: .*400/);
	} finally {
		server.closeAllConnections();
		await new Promise((done) => server.close(done));
	}
});

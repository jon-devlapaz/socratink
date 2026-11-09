import assert from 'node:assert/strict';
import { fauxProvider, fauxAssistantMessage } from '@earendil-works/pi-ai/providers/faux';
import { init } from '@flue/runtime';
import { start } from '@flue/runtime/node';
import { Chat } from '../src/agents/chat.ts';
import { takeAssistantText } from '../src/agents/present-question.ts';
import { chatModel } from '../src/config/operator-model.ts';

const calls = new Map();
const unboxed = 'Choose one:\n1. First\n2. Second';
const question = { prompt: 'Which option?', choices: ['First', 'Second'] };
function reply(context) {
	const key = JSON.stringify(context.messages).match(/capture-(alpha|beta|invalid|repeat|failure)/)?.[1];
	assert.ok(key, 'the provider received the admitted learner message');
	const turn = (calls.get(key) ?? 0) + 1;
	calls.set(key, turn);
	let content = [{ type: 'text', text: key === 'beta' ? 'A plain reply.' : unboxed }];
	if ((key === 'alpha' && turn % 2 === 0) || key === 'invalid') content = [{
		type: 'toolCall', id: `${key}-${turn}`, name: 'present_question',
		arguments: key === 'invalid' && turn === 1 ? { prompt: 'Missing choices' } : question,
	}];
	const failed = key === 'failure';
	return fauxAssistantMessage(content, {
		stopReason: failed ? 'error' : content[0].type === 'toolCall' ? 'toolUse' : 'stop',
		...(failed ? { errorMessage: 'Synthetic provider failure' } : {}),
	});
}

const faux = fauxProvider({
	provider: chatModel.providerId, models: [{ id: chatModel.modelId }], tokensPerSecond: Infinity,
});
faux.setResponses(Array.from({ length: 12 }, () => reply));
const runtime = await start({ agents: [Chat], providers: [faux.provider] });
try {
	async function send(key) {
		const agent = init(Chat, { id: `capture-${key}` });
		const receipt = await agent.dispatch(`capture-${key}`);
		return agent.read(receipt, { signal: AbortSignal.timeout(10_000) });
	}
	const [alpha, beta, invalid, repeat] = await Promise.all(['alpha', 'beta', 'invalid', 'repeat'].map(send));
	assert.equal(alpha.data.questionnaire[0].items[0].prompt, question.prompt);
	assert.equal(beta.text, 'A plain reply.');
	assert.equal(invalid.data.questionnaire[0].items[0].prompt, question.prompt);
	assert.ok(repeat.text.includes(unboxed));
	assert.deepEqual(Object.fromEntries(calls), { alpha: 2, beta: 1, invalid: 2, repeat: 2 });
	await send('alpha');
	assert.equal(calls.get('alpha'), 4, 'each new delivery gets its own single retry');
	await assert.rejects(() => send('failure'));
	for (const key of calls.keys()) assert.equal(takeAssistantText(`capture-${key}`), '', 'settled calls release captured text');
	console.log(JSON.stringify({ retry: true, isolated: true, released: true }));
} finally {
	await runtime.stop();
}

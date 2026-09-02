import assert from 'node:assert/strict';
import test from 'node:test';
import { appConfig } from '../src/config/app.config.ts';
import { chatAllowsAutoSelection, parseFreeLlmAutoModelId } from '../src/config/chat-auto.ts';
import {
	applyRequestedAutoModel,
	chatConversationIdFromPath,
	rememberConversationAuto,
	runWithConversationAuto,
	wrapStreamsForChatAuto,
} from '../src/server/chat-auto.ts';

test('parses only the FreeLLMAPI auto strategies Socratink exposes', () => {
	assert.equal(parseFreeLlmAutoModelId('auto:smart'), 'auto:smart');
	assert.equal(parseFreeLlmAutoModelId(' AUTO:FAST '), 'auto:fast');
	assert.equal(parseFreeLlmAutoModelId('auto:cheap'), undefined);
	assert.equal(parseFreeLlmAutoModelId('Qwen/Qwen3'), undefined);
	assert.equal(chatAllowsAutoSelection('auto'), true);
	assert.equal(chatAllowsAutoSelection('minimax/minimax-m2.7'), false);
	assert.equal(
		chatConversationIdFromPath(`${appConfig.chatAgentPath}/b8a5dac1-943b-4f16-b1b7-5216ac87d6eb/stream`),
		'b8a5dac1-943b-4f16-b1b7-5216ac87d6eb',
	);
});

test('rewrites the FreeLLMAPI payload model after admission', () => {
	rememberConversationAuto('conv-1', 'auto:smart');
	const rewritten = runWithConversationAuto('conv-1', () =>
		applyRequestedAutoModel({ model: 'auto', messages: [] }),
	);
	assert.deepEqual(rewritten, { model: 'auto:smart', messages: [] });
	assert.equal(applyRequestedAutoModel({ model: 'auto' }), undefined);
});

test('consumes a remembered auto strategy once and clears a missing header', () => {
	rememberConversationAuto('conv-clear', 'auto:fast');
	rememberConversationAuto('conv-clear', undefined);
	assert.equal(
		runWithConversationAuto('conv-clear', () => applyRequestedAutoModel({ model: 'auto' })),
		undefined,
	);

	rememberConversationAuto('conv-once', 'auto:smart');
	assert.deepEqual(
		runWithConversationAuto('conv-once', () => applyRequestedAutoModel({ model: 'auto' })),
		{ model: 'auto:smart' },
	);
	assert.equal(
		runWithConversationAuto('conv-once', () => applyRequestedAutoModel({ model: 'auto' })),
		undefined,
	);
});

test('provider stream wrapper sends the selected auto strategy', async () => {
	rememberConversationAuto('conv-2', 'auto:reliable');
	const api = {
		stream(_model, _context, options) {
			return options?.onPayload?.({ model: 'auto', stream: true }, {});
		},
		streamSimple() {
			return undefined;
		},
	};
	const wrapped = wrapStreamsForChatAuto(api);
	const payload = await runWithConversationAuto('conv-2', () => wrapped.stream({}, {}, {}));
	assert.deepEqual(payload, { model: 'auto:reliable', stream: true });
});

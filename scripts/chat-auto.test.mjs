import assert from 'node:assert/strict';
import test from 'node:test';
import { chatAllowsAutoSelection, parseFreeLlmAutoModelId } from '../src/config/chat-auto.ts';

test('parses only the FreeLLMAPI auto strategies Socratink exposes', () => {
	assert.equal(parseFreeLlmAutoModelId('auto:smart'), 'auto:smart');
	assert.equal(parseFreeLlmAutoModelId(' AUTO:FAST '), 'auto:fast');
	assert.equal(parseFreeLlmAutoModelId('auto:cheap'), undefined);
	assert.equal(parseFreeLlmAutoModelId('Qwen/Qwen3'), undefined);
	assert.equal(chatAllowsAutoSelection('auto'), true);
	assert.equal(chatAllowsAutoSelection('minimax/minimax-m2.7'), false);
});

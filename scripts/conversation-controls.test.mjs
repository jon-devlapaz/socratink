import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ChatApiError, ChatTurnError } from '../src/config/chat-wire.ts';
import { learnerMessageLengthError } from '../src/config/chat-message.ts';
import { chatRequestControls, chatTurnErrorMessage, unsettledSubmissionFromHistory } from '../src/ui/client/conversation.ts';

describe('learnerMessageLengthError', () => {
	for (const length of [0, 15_999, 16_000, 16_001]) {
		it(`a message with ${length} characters`, () => {
			const expected = length === 16_001 ? 'That message is 16,001 characters. Keep it under 16,000 characters.' : undefined;
			assert.equal(learnerMessageLengthError('é'.repeat(length)), expected);
		});
	}
});

describe('chatRequestControls', () => {
	const ready = { busy: false, composerLocked: false, startOverDisabled: false };
	const busy = { busy: true, composerLocked: true, startOverDisabled: true };
	const locked = { busy: false, composerLocked: true, startOverDisabled: false };
	for (const [name, state, expected] of [
		['idle', { kind: 'idle' }, ready],
		['restoring', { kind: 'restoring' }, busy],
		['waiting', { kind: 'waiting', text: 'Hello' }, busy],
		['canceling', { kind: 'canceling', text: 'Hello' }, busy],
		['outcome unknown', { kind: 'recovery', detail: 'Outcome unknown.', text: 'Hello' }, locked],
		['completed', { kind: 'completed', text: 'Hello', reply: { text: 'Hi', data: {}, submissionId: 's1' } }, ready],
		['aborted', { kind: 'terminal', text: 'Hello', outcome: 'aborted', detail: 'Canceled.' }, ready],
		['failed', { kind: 'terminal', text: 'Hello', outcome: 'failed', detail: 'Failed.' }, ready],
		['rejected', { kind: 'terminal', text: 'Hello', outcome: 'not-admitted', detail: 'Rejected.' }, ready],
		['guest allowance used', { kind: 'terminal', text: 'Hello', outcome: 'not-admitted', code: 'guest_turn_limit', detail: 'Limit reached.' }, locked],
	]) {
		it(name, () => assert.deepEqual(chatRequestControls(state), expected));
	}
});

describe('chatTurnErrorMessage', () => {
	const setupMessage = 'No model provider is set up yet. Please try again later.';
	for (const [name, error, expected] of [
		['provider error', new Error('provider rejected'), 'provider rejected'],
		['nested setup error', new ChatApiError(503, { error: { type: 'inference_unconfigured', message: 'ignored' } }), setupMessage],
		['flat setup error', { body: { type: 'inference_unconfigured' } }, setupMessage],
		['a failed turn with a detail', new ChatTurnError({ submissionId: '13', failure: 'failed', error: 'The model request could not complete.' }), 'The model request could not complete.'],
		['a failed turn without a detail', new ChatTurnError({ submissionId: '13', failure: 'failed' }), 'The reply could not finish.'],
		['a missing terminal event', new ChatTurnError({ submissionId: '13', failure: 'terminal_event_missing' }), 'The reply stopped before it finished.'],
		['empty response', null, 'Unable to get a reply.'],
		['non-object body', { body: 'unavailable' }, 'Unable to get a reply.'],
		['missing error type', { body: { error: {} } }, 'Unable to get a reply.'],
		['invalid error type', { body: { error: { type: 42 } } }, 'Unable to get a reply.'],
	]) {
		it(name, () => assert.equal(chatTurnErrorMessage(error), expected));
	}
});

describe('ChatTurnError', () => {
	it('includes the submission ID in its diagnostic message', () => {
		const error = new ChatTurnError({ submissionId: '13', failure: 'failed', error: 'The model request could not complete.' });
		assert.match(error.message, /submission 13/);
	});
});

describe('unsettledSubmissionFromHistory', () => {
	const earlier = { role: 'user', submissionId: 's1', parts: [{ type: 'text', text: 'Earlier' }] };
	const latest = { role: 'user', submissionId: 's2', parts: [
		{ type: 'text', text: 'First line' }, { type: 'data-reveal', data: {} }, { type: 'text', text: 'Second line' },
	] };
	for (const [name, messages, settlements, expected] of [
		['empty history', [], [], undefined],
		['message without a submission', [{ role: 'user', parts: [] }], [], undefined],
		['latest pending learner message', [earlier, latest], [], { submissionId: 's2', text: 'First line\n\nSecond line' }],
		['assistant text after a pending learner message', [earlier, { role: 'assistant', submissionId: 's1', parts: [] }], [], { submissionId: 's1', text: 'Earlier' }],
		['latest learner message has settled', [earlier, latest], [{ submissionId: 's2', outcome: 'completed' }], undefined],
	]) {
		it(name, () => assert.deepEqual(unsettledSubmissionFromHistory({ messages, settlements }), expected));
	}
});

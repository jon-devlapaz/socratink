import assert from 'node:assert/strict';
import test from 'node:test';
import { FlueApiError, FlueExecutionError } from '@flue/sdk';
import { betaInviteError, betaPausedError, betaSignInError } from '../src/server/beta-access.ts';
import { chatTurnErrorMessage } from '../src/ui/client/conversation.ts';
import * as gate from '../src/ui/chat-gate.ts';
import { applyRequestControlState } from '../src/ui/chat-request-view.ts';

test('beta admission errors are rendered as plain learner messages', () => {
	for (const error of [betaSignInError, betaInviteError, betaPausedError]) {
		const status = error === betaPausedError ? 503 : 403;
		assert.equal(chatTurnErrorMessage(new FlueApiError(status, { error })), error.message);
	}
});

test('beta sign-in uses the existing auth prompt without claiming three guest turns', () => {
	assert.equal(typeof gate.authGateMessage, 'function');
	const terminal = { kind: 'terminal', outcome: 'not-admitted', text: 'synthetic', detail: '' };
	assert.equal(gate.authGateMessage({ ...terminal, code: 'beta_sign_in_required' }), betaSignInError.message);
	assert.match(gate.authGateMessage({ ...terminal, code: 'guest_turn_limit' }), /3 turns/);
	for (const code of ['beta_paused', 'beta_invite_required', 'other_error']) {
		assert.equal(gate.authGateMessage({ ...terminal, code }), undefined);
	}
	assert.equal(gate.authGateMessage({ kind: 'idle' }), undefined);
	assert.equal(gate.authGateMessage({ ...terminal, outcome: 'failed', code: 'beta_sign_in_required' }), undefined);
});

test('execution-time beta failures hide submission diagnostics, including wrapped runtime errors', () => {
	for (const error of [betaInviteError, betaPausedError]) {
		for (const payload of [
			{ name: error.type, message: error.message },
			{ type: error.type, message: error.message },
			{ type: 'operation_failed', message: `dispatch(sub-fixture) failed: ${error.message}`, meta: { reason: error.message } },
		]) {
			assert.equal(chatTurnErrorMessage(new FlueExecutionError({
				target: 'agent_submission', targetId: 'sub-fixture', failure: 'failed', error: payload,
			})), error.message);
		}
	}
	const unknown = new FlueExecutionError({ target: 'agent_submission', targetId: 'sub-fixture', failure: 'failed',
		error: { type: 'operation_failed', message: 'Different failure', meta: { reason: 'unknown' } } });
	assert.equal(chatTurnErrorMessage(unknown), unknown.message);
});

test('admission rejection restores the draft once, without overwriting later edits', () => {
	for (const error of [betaSignInError, betaInviteError, betaPausedError]) {
		const input = { value: '', disabled: true };
		const elements = { input, button: {}, startOver: {},
			core: { classList: { toggle() {} } }, lockup: { classList: { toggle() {} } } };
		const state = { kind: 'terminal', outcome: 'not-admitted', text: 'Keep this learner message.',
			code: error.type, detail: error.message };
		applyRequestControlState(state, elements);
		assert.equal(input.value, state.text);
		assert.equal(input.disabled, false);
		for (const edit of ['The learner revised this message.', '', '   ']) {
			input.value = edit;
			applyRequestControlState(state, elements);
			assert.equal(input.value, edit, 'a duplicate state paint must preserve the edited draft');
		}
	}
});

test('confirmed aborts and failures do not restore an already admitted draft', () => {
	for (const outcome of ['aborted', 'failed']) {
		const input = { value: '', disabled: true };
		applyRequestControlState({ kind: 'terminal', outcome, text: 'Already admitted.', detail: 'Stopped.' }, {
			input, button: {}, startOver: {},
			core: { classList: { toggle() {} } }, lockup: { classList: { toggle() {} } },
		});
		assert.equal(input.value, '');
		assert.equal(input.disabled, false);
	}
});

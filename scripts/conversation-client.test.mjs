import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { FlueExecutionError } from '@flue/sdk';
import {
	ChatRequestCoordinator,
	chatRequestControls,
	chatTurnErrorMessage,
	isLostConversationStream,
	unsettledSubmissionFromHistory,
} from '../src/ui/client/conversation.ts';

const admission = {
	streamUrl: 'http://localhost/conversation',
	offset: '1',
	submissionId: 'sub-1',
	uid: 'instance-1',
};
const reply = { text: 'recovered', data: {}, submissionId: 'sub-1' };
const coordinatorOptions = {
	abortSignal: () => new AbortController().signal,
	settlementSignal: () => new AbortController().signal,
};

function executionError(failure) {
	return new FlueExecutionError({
		target: 'agent_submission',
		targetId: 'sub-1',
		failure,
	});
}

function streamNotFound(source) {
	const error = new Error('HTTP Error 404 at http://localhost/conversation?view=updates');
	error.status = 404;
	if (source === 'json') {
		error.json = { error: { type: 'stream_not_found', message: 'Event stream was not found.' } };
	} else {
		error.body = { error: { type: 'stream_not_found', message: 'Event stream was not found.' } };
	}
	return error;
}

function abortablePendingRead(signal) {
	return new Promise((_, reject) => {
		signal.addEventListener('abort', () => reject(signal.reason), { once: true });
	});
}

test('detects only durable-stream 404 stream_not_found envelopes', () => {
	assert.equal(isLostConversationStream(streamNotFound('json')), true);
	assert.equal(isLostConversationStream(streamNotFound('body')), true);
	const other = new Error('missing');
	other.status = 404;
	other.json = { error: { type: 'agent_instance_not_found' } };
	assert.equal(isLostConversationStream(other), false);
	assert.equal(isLostConversationStream(new Error('network')), false);
});

test('cancel before observed admission stays unknown and never enables resend', async () => {
	let aborts = 0;
	const conversation = {
		async send({ signal }) {
			return abortablePendingRead(signal);
		},
		async read() {
			throw new Error('should not read');
		},
		async abort({ signal }) {
			assert.ok(signal);
			aborts += 1;
			return { aborted: false };
		},
	};
	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const running = coordinator.start('hello');
	const canceled = coordinator.cancel();

	const state = await canceled;
	assert.equal(state.kind, 'recovery');
	assert.equal(state.admission, undefined);
	assert.match(state.detail, /admission is still unknown/i);
	assert.throws(() => coordinator.retry(), /confirmed terminal/);
	assert.equal(await running, state);
	assert.equal((await coordinator.recheck()).kind, 'recovery');
	assert.equal(aborts, 2);
});

test('cancel after admission waits for an aborted settlement before saying Canceled', async () => {
	let reads = 0;
	const conversation = {
		async send() {
			return admission;
		},
		async read(target, { signal }) {
			reads += 1;
			if (reads === 1) return abortablePendingRead(signal);
			assert.equal(target, admission.submissionId);
			throw executionError('aborted');
		},
		async abort() {
			return { aborted: true };
		},
	};
	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const running = coordinator.start('hello');
	await Promise.resolve();
	const state = await coordinator.cancel();

	assert.equal(state.kind, 'terminal');
	assert.equal(state.outcome, 'aborted');
	assert.equal(state.detail, 'Socratink stopped this reply.');
	assert.equal(await running, state);
});

test('renders the reply when completion wins the cancel race', async () => {
	let reads = 0;
	const conversation = {
		async send() {
			return admission;
		},
		async read(target, { signal }) {
			reads += 1;
			if (reads === 1) return abortablePendingRead(signal);
			assert.equal(target, admission.submissionId);
			return reply;
		},
		async abort() {
			return { aborted: false };
		},
	};
	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const running = coordinator.start('hello');
	await Promise.resolve();
	const state = await coordinator.cancel();

	assert.deepEqual(state, { kind: 'completed', text: 'hello', reply });
	assert.equal(await running, state);
});

test('a bounded abort failure becomes recoverable and never claims the reply stopped', async () => {
	const conversation = {
		async send() {
			return admission;
		},
		async read(_target, { signal }) {
			return abortablePendingRead(signal);
		},
		async abort({ signal }) {
			assert.ok(signal);
			throw new DOMException('The operation timed out.', 'TimeoutError');
		},
	};
	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const running = coordinator.start('hello');
	await Promise.resolve();
	const state = await coordinator.cancel();

	assert.equal(state.kind, 'recovery');
	assert.equal(state.admission, admission);
	assert.match(state.detail, /could not be confirmed/i);
	assert.doesNotMatch(state.detail, /stopped this reply/i);
	assert.equal(await running, state);
});

test('an admitted observation failure reattaches to the same submission without sending again', async () => {
	let sends = 0;
	const reads = [];
	const conversation = {
		async send() {
			sends += 1;
			return admission;
		},
		async read(target) {
			reads.push(target);
			if (reads.length === 1) throw new Error('connection lost');
			return reply;
		},
		async abort() {
			throw new Error('should not abort');
		},
	};
	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const state = await coordinator.start('hello');
	assert.equal(state.kind, 'recovery');
	assert.equal(state.admission, admission);

	assert.deepEqual(await coordinator.recheck(), { kind: 'completed', text: 'hello', reply });
	assert.equal(sends, 1);
	assert.deepEqual(reads, [admission, admission.submissionId]);
});

test('reload hydrates an unsettled admission and reads only its submissionId without overlap', async () => {
	let sends = 0;
	const reads = [];
	const conversation = {
		async send() {
			sends += 1;
			throw new Error('reload must not send');
		},
		async read(target) {
			reads.push(target);
			return reply;
		},
		async abort() {
			throw new Error('reload must not abort');
		},
	};
	const restored = unsettledSubmissionFromHistory({
		settlements: [{ submissionId: 'sub-old', outcome: 'completed' }],
		messages: [
			{
				display: 'visible',
				role: 'user',
				submissionId: 'sub-old',
				parts: [{ type: 'text', text: 'settled' }],
			},
			{
				display: 'visible',
				role: 'user',
				submissionId: admission.submissionId,
				parts: [{ type: 'text', text: 'hello' }],
			},
		],
	});
	assert.deepEqual(restored, { text: 'hello', submissionId: admission.submissionId });

	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const hydrated = coordinator.hydrate(restored.text, restored.submissionId);
	assert.equal(hydrated.kind, 'recovery');
	assert.equal(chatRequestControls(hydrated).composerLocked, true);
	assert.throws(() => coordinator.start('overlap'), /already active/);
	assert.deepEqual(await coordinator.recheck(), { kind: 'completed', text: 'hello', reply });
	assert.equal(sends, 0);
	assert.deepEqual(reads, [admission.submissionId]);
});

test('reload does not revive an older unsettled record after a newer submission settled', () => {
	assert.equal(
		unsettledSubmissionFromHistory({
			settlements: [{ submissionId: 'sub-new', outcome: 'completed' }],
			messages: [
				{
					display: 'visible',
					role: 'user',
					submissionId: 'sub-old',
					parts: [{ type: 'text', text: 'old' }],
				},
				{
					display: 'visible',
					role: 'user',
					submissionId: 'sub-new',
					parts: [{ type: 'text', text: 'new' }],
				},
			],
		}),
		undefined,
	);
});

test('Retry resends exactly once only after an aborted settlement is confirmed', async () => {
	let sends = 0;
	let reads = 0;
	let activeAdmissions = 0;
	let maxActiveAdmissions = 0;
	const conversation = {
		async send() {
			sends += 1;
			activeAdmissions += 1;
			maxActiveAdmissions = Math.max(maxActiveAdmissions, activeAdmissions);
			return { ...admission, submissionId: `sub-${sends}` };
		},
		async read(target, { signal }) {
			reads += 1;
			if (reads === 1) return abortablePendingRead(signal);
			if (reads === 2) {
				activeAdmissions -= 1;
				throw executionError('aborted');
			}
			activeAdmissions -= 1;
			return { ...reply, submissionId: target.submissionId };
		},
		async abort() {
			return { aborted: true };
		},
	};
	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const running = coordinator.start('hello');
	await Promise.resolve();
	await coordinator.cancel();
	await running;
	const retried = await coordinator.retry();

	assert.equal(retried.kind, 'completed');
	assert.equal(sends, 2);
	assert.equal(maxActiveAdmissions, 1);
});

test('rejects every overlapping admission attempt', async () => {
	const conversation = {
		async send({ signal }) {
			return abortablePendingRead(signal);
		},
		async read() {
			throw new Error('should not read');
		},
		async abort() {
			return { aborted: false };
		},
	};
	const coordinator = new ChatRequestCoordinator(conversation, coordinatorOptions);
	const running = coordinator.start('first');
	assert.throws(() => coordinator.start('second'), /already active/);
	await coordinator.cancel();
	await running;
});

test('maps user-facing errors without treating cancellation as a generic failure', () => {
	assert.equal(
		chatTurnErrorMessage(streamNotFound('json')),
		'This conversation was interrupted before a reply arrived. Send again or start over.',
	);
	assert.equal(chatTurnErrorMessage(new Error('provider rejected')), 'provider rejected');
});

test('recovery and terminal states lock only the composer while keeping Start over available', () => {
	assert.deepEqual(chatRequestControls({ kind: 'idle' }), {
		busy: false,
		composerLocked: false,
		startOverDisabled: false,
	});
	assert.deepEqual(chatRequestControls({ kind: 'waiting', text: 'hello' }), {
		busy: true,
		composerLocked: true,
		startOverDisabled: true,
	});
	assert.deepEqual(
		chatRequestControls({ kind: 'recovery', text: 'hello', detail: 'Outcome unknown.' }),
		{ busy: false, composerLocked: true, startOverDisabled: false },
	);
	assert.deepEqual(
		chatRequestControls({
			kind: 'terminal',
			text: 'hello',
			outcome: 'aborted',
			detail: 'Canceled.',
		}),
		{ busy: false, composerLocked: true, startOverDisabled: false },
	);
});

test('a recovery action repaints an enabled focused Retry while the composer stays disabled', async (t) => {
	class TestClassList {
		#names = new Set();
		toggle(name, force) {
			if (force) this.#names.add(name);
			else this.#names.delete(name);
		}
	}
	class TestElement extends EventTarget {
		children = [];
		parentElement = null;
		classList = new TestClassList();
		className = '';
		disabled = false;
		textContent = '';
		type = '';
		append(...children) {
			for (const child of children) {
				child.parentElement = this;
				this.children.push(child);
			}
		}
		setAttribute() {}
		replaceChildren(...children) {
			this.children = [];
			this.append(...children);
		}
		querySelector(selector) {
			if (selector === '.request-actions .request-action') {
				return this.descendants().find((node) => node.className === 'request-action') ?? null;
			}
			return null;
		}
		querySelectorAll(selector) {
			return selector === 'button'
				? this.descendants().filter((node) => node.type === 'button')
				: [];
		}
		descendants() {
			return this.children.flatMap((child) => [child, ...child.descendants()]);
		}
		focus() {
			globalThis.document.activeElement = this;
		}
		click() {
			this.dispatchEvent(new Event('click'));
		}
	}
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	globalThis.window = {
		matchMedia: () => ({ matches: true }),
	};
	globalThis.document = {
		activeElement: null,
		createElement: () => new TestElement(),
	};
	t.after(() => {
		if (originalWindow === undefined) delete globalThis.window;
		else globalThis.window = originalWindow;
		if (originalDocument === undefined) delete globalThis.document;
		else globalThis.document = originalDocument;
	});

	const {
		applyRequestControlState,
		buildRequestStateTurn,
		focusAfterRequestStatePaint,
	} = await import('../src/ui/chat-surface.ts');
	const input = new TestElement();
	const button = new TestElement();
	const startOver = new TestElement();
	const core = new TestElement();
	const lockup = new TestElement();
	const activeTurn = new TestElement();
	const elements = { input, button, startOver, core, lockup, activeTurn };
	const terminal = {
		kind: 'terminal',
		text: 'hello',
		outcome: 'aborted',
		detail: 'Socratink stopped this reply.',
	};

	function repaint(state) {
		const action = state.kind === 'recovery'
			? () => Promise.resolve(terminal)
			: () => Promise.resolve(state);
		activeTurn.replaceChildren(
			buildRequestStateTurn(state, action, (result) => {
				void result.then(repaint);
			}),
		);
		applyRequestControlState(state, elements);
		focusAfterRequestStatePaint(state, elements);
	}

	repaint({ kind: 'recovery', text: 'hello', detail: 'Outcome unknown.' });
	const recheck = activeTurn.querySelector('.request-actions .request-action');
	assert.equal(recheck.textContent, 'Recheck');
	assert.equal(recheck.disabled, false);
	assert.equal(document.activeElement, recheck);
	assert.equal(input.disabled, true);
	recheck.click();
	await Promise.resolve();

	const retry = activeTurn.querySelector('.request-actions .request-action');
	assert.equal(retry.textContent, 'Retry');
	assert.equal(retry.disabled, false);
	assert.equal(document.activeElement, retry);
	assert.equal(input.disabled, true);
	assert.equal(button.disabled, true);
});

test('the pending view keeps stable accessible copy and a 10 second latency threshold', async () => {
	const source = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	assert.match(source, /Waiting for Socratink/);
	assert.match(source, /Taking longer than usual\./);
	assert.match(source, /exceptionalLatencyMs = 10_000/);
	assert.match(source, /setAttribute\('role', 'status'\)/);
	assert.doesNotMatch(source, /pendingWordAt|pendingWords|setInterval/);
});

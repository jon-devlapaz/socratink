import assert from 'node:assert/strict';
import test from 'node:test';
import { mountDictation, stripVoiceSendCommand } from '../src/ui/dictation.ts';

class FakeElement {
	listeners = new Map();
	attributes = new Map();
	dataset = {};
	hidden = false;
	disabled = false;
	textContent = '';
	value = '';
	selectionStart = 0;
	selectionEnd = 0;
	childrenBySelector = new Map();

	addEventListener(type, listener) {
		const listeners = this.listeners.get(type) ?? new Set();
		listeners.add(listener);
		this.listeners.set(type, listeners);
	}

	removeEventListener(type, listener) {
		this.listeners.get(type)?.delete(listener);
	}

	emit(type, event = {}) {
		for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
	}

	dispatchEvent(event) {
		this.emit(event.type, event);
		return true;
	}

	click() {
		this.emit('click', { isTrusted: true });
	}

	setAttribute(name, value) {
		this.attributes.set(name, value);
	}

	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}

	querySelector(selector) {
		return this.childrenBySelector.get(selector) ?? null;
	}

	setSelectionRange(start, end) {
		this.selectionStart = start;
		this.selectionEnd = end;
	}
}

class FakeDocument extends FakeElement {
	documentElement = { lang: 'en-US' };
	hidden = false;
}

class FakeRecognition {
	static instances = [];
	listeners = new Map();
	continuous = false;
	interimResults = false;
	lang = '';
	startCalls = 0;
	stopCalls = 0;
	abortCalls = 0;

	constructor() {
		FakeRecognition.instances.push(this);
	}

	addEventListener(type, listener) {
		const listeners = this.listeners.get(type) ?? new Set();
		listeners.add(listener);
		this.listeners.set(type, listeners);
	}

	removeEventListener(type, listener) {
		this.listeners.get(type)?.delete(listener);
	}

	emit(type, event = {}) {
		for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
	}

	start() {
		this.startCalls += 1;
	}

	stop() {
		this.stopCalls += 1;
	}

	abort() {
		this.abortCalls += 1;
	}

	result(results, resultIndex = 0) {
		this.emit('result', {
			resultIndex,
			results: results.map(({ text, final }) => Object.assign([{ transcript: text }], { isFinal: final })),
		});
	}
}

function setup(kind = 'unprefixed') {
	FakeRecognition.instances = [];
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	const originalNavigator = globalThis.navigator;
	const document = new FakeDocument();
	const speech = kind === 'unprefixed'
		? { SpeechRecognition: FakeRecognition }
		: kind === 'prefixed'
			? { webkitSpeechRecognition: FakeRecognition }
			: {};
	globalThis.window = {
		...speech,
		setTimeout,
		clearTimeout,
		setInterval,
		clearInterval,
	};
	globalThis.document = document;
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: { language: 'en-GB' },
	});
	const input = new FakeElement();
	const toggle = new FakeElement();
	const status = new FakeElement();
	const announcement = new FakeElement();
	const error = new FakeElement();
	const timer = new FakeElement();
	const settling = new FakeElement();
	status.childrenBySelector.set('.dictation-announcement', announcement);
	status.childrenBySelector.set('.dictation-error', error);
	status.childrenBySelector.set('.dictation-timer', timer);
	status.childrenBySelector.set('.dictation-settling', settling);

	return {
		document,
		input,
		toggle,
		status,
		announcement,
			error,
			timer,
			settling,
			mount(options = {}) {
				return mountDictation({
					input,
					toggle,
					status,
					onSendRequested() {},
					...options,
				});
		},
		restore() {
			if (originalWindow === undefined) delete globalThis.window;
			else globalThis.window = originalWindow;
			if (originalDocument === undefined) delete globalThis.document;
			else globalThis.document = originalDocument;
			if (originalNavigator === undefined) delete globalThis.navigator;
			else {
				Object.defineProperty(globalThis, 'navigator', {
					configurable: true,
					value: originalNavigator,
				});
			}
		},
	};
}

function startSession(harness, text = '', start = text.length, end = start) {
	harness.input.value = text;
	harness.input.selectionStart = start;
	harness.input.selectionEnd = end;
	const controller = harness.mount();
	harness.toggle.click();
	const recognition = FakeRecognition.instances.at(-1);
	assert.ok(recognition);
	return { controller, recognition };
}

test('detects unprefixed, prefixed, and unsupported constructors', () => {
	for (const kind of ['unprefixed', 'prefixed']) {
		const harness = setup(kind);
		try {
			const controller = harness.mount();
			assert.equal(harness.toggle.hidden, false);
			assert.equal(harness.toggle.disabled, false);
			controller.destroy();
		} finally {
			harness.restore();
		}
	}

	const harness = setup('unsupported');
	try {
		const controller = harness.mount();
		assert.equal(harness.toggle.hidden, true);
		assert.equal(harness.toggle.disabled, true);
		assert.equal(controller.stopForReview(), false);
	} finally {
		harness.restore();
	}
});

test('starts synchronously from click and projects starting, listening, stopping, and idle', () => {
	const harness = setup();
	try {
		const { controller, recognition } = startSession(harness);
		assert.equal(recognition.startCalls, 1);
		assert.equal(recognition.continuous, true);
		assert.equal(recognition.interimResults, true);
		assert.equal(recognition.lang, 'en-US');
		assert.equal(harness.status.dataset.state, 'starting');
		assert.equal(harness.toggle.disabled, true);
		assert.equal(harness.toggle.getAttribute('aria-pressed'), 'false');

		recognition.emit('start');
		assert.equal(harness.status.dataset.state, 'listening');
		assert.equal(harness.toggle.disabled, false);
		assert.equal(harness.toggle.getAttribute('aria-pressed'), 'true');
		assert.equal(harness.toggle.getAttribute('aria-label'), 'Stop dictation');

		harness.toggle.click();
		assert.equal(recognition.stopCalls, 1);
		assert.equal(harness.status.dataset.state, 'stopping');
		assert.equal(harness.toggle.disabled, true);

		recognition.emit('end');
		assert.equal(harness.status.dataset.state, 'idle');
		assert.equal(harness.toggle.getAttribute('aria-pressed'), 'false');
		assert.equal(harness.announcement.textContent, 'Dictation stopped.');
		controller.destroy();
	} finally {
		harness.restore();
	}
});

test('bounds voice activity to the dictation session', () => {
	const harness = setup();
	const calls = [];
	try {
		const controller = harness.mount({
			voiceActivity: {
				start: () => calls.push('start'),
				stop: () => calls.push('stop'),
			},
		});
		harness.toggle.click();
		const recognition = FakeRecognition.instances.at(-1);
		assert.ok(recognition);
		assert.deepEqual(calls, ['start']);
		recognition.emit('start');
		harness.toggle.click();
		assert.deepEqual(calls, ['start', 'stop']);
		recognition.emit('end');
		assert.deepEqual(calls, ['start', 'stop']);
		controller.destroy();
		assert.deepEqual(calls, ['start', 'stop']);
	} finally {
		harness.restore();
	}
});

test('a final Send message command strips itself and submits once after end', () => {
	const harness = setup();
	let sends = 0;
	try {
		harness.input.value = 'Typed';
		harness.input.selectionStart = 5;
		harness.input.selectionEnd = 5;
		const controller = harness.mount({ onSendRequested: () => { sends += 1; } });
		harness.toggle.click();
		const recognition = FakeRecognition.instances.at(-1);
		assert.ok(recognition);
		recognition.emit('start');

		recognition.result([{ text: 'answer. Send message!', final: false }]);
		assert.equal(recognition.stopCalls, 0);
		assert.equal(sends, 0);

		recognition.result([{ text: 'answer. Send message!', final: true }]);
		assert.equal(harness.input.value, 'Typed answer.');
		assert.equal(harness.status.dataset.state, 'stopping');
		assert.equal(harness.settling.textContent, 'Sending');
		assert.equal(recognition.stopCalls, 1);
		assert.equal(sends, 0);

		recognition.emit('end');
		assert.equal(sends, 1);
		assert.equal(harness.status.dataset.state, 'idle');
		assert.equal(harness.announcement.textContent, 'Sending dictated message.');
		recognition.emit('end');
		assert.equal(sends, 1);
		controller.destroy();
	} finally {
		harness.restore();
	}
});

test('matches only Send message in final command position', () => {
	assert.equal(stripVoiceSendCommand('Answer. Send message!'), 'Answer.');
	assert.equal(stripVoiceSendCommand('Answer. send, message'), 'Answer.');
	assert.equal(stripVoiceSendCommand('Answer. Send the message'), undefined);
	assert.equal(stripVoiceSendCommand('I will send message tomorrow'), undefined);
	assert.equal(stripVoiceSendCommand('Send Socriting'), undefined);
});

test('voice send fails closed for empty, non-command, and errored transcripts', () => {
	for (const item of [
		{ speech: 'Send message', expected: '', sends: 0, error: undefined },
		{ speech: 'Socratink can help', expected: 'Socratink can help', sends: 0, error: undefined },
		{ speech: 'Send Socriting', expected: 'Send Socriting', sends: 0, error: undefined },
		{ speech: 'send this message later', expected: 'send this message later', sends: 0, error: undefined },
		{ speech: 'Answer send message', expected: 'Answer', sends: 0, error: 'network' },
	]) {
		const harness = setup();
		let sends = 0;
		try {
			const controller = harness.mount({ onSendRequested: () => { sends += 1; } });
			harness.toggle.click();
			const recognition = FakeRecognition.instances.at(-1);
			assert.ok(recognition);
			recognition.emit('start');
			recognition.result([{ text: item.speech, final: true }]);
			assert.equal(harness.input.value, item.expected);
			if (item.error) recognition.emit('error', { error: item.error });
			else recognition.emit('end');
			assert.equal(sends, item.sends);
			controller.destroy();
		} finally {
			harness.restore();
		}
	}
});

test('updates interim and final results from a non-zero resultIndex without duplication', () => {
	const harness = setup();
	try {
		const { controller, recognition } = startSession(harness, 'Alpha omega', 6);
		recognition.emit('start');
		recognition.result([
			{ text: 'one', final: true },
			{ text: 'two', final: false },
		]);
		assert.equal(harness.input.value, 'Alpha one two omega');

		const settled = [
			{ text: 'one', final: true },
			{ text: 'two', final: true },
		];
		recognition.result(settled, 1);
		recognition.result(settled, 1);
		assert.equal(harness.input.value, 'Alpha one two omega');
		assert.equal(harness.input.selectionStart, 'Alpha one two'.length);
		controller.destroy();
	} finally {
		harness.restore();
	}
});

test('inserts before, inside, and after text with selected replacement and boundary spacing', () => {
	const cases = [
		{ original: 'world', start: 0, end: 0, speech: 'Hello', expected: 'Hello world' },
		{ original: 'Hello world', start: 6, end: 11, speech: 'there', expected: 'Hello there' },
		{ original: 'Hello', start: 5, end: 5, speech: ',', expected: 'Hello,' },
		{ original: '(world)', start: 1, end: 6, speech: 'Hello', expected: '(Hello)' },
	];
	for (const item of cases) {
		const harness = setup();
		try {
			const { controller, recognition } = startSession(
				harness,
				item.original,
				item.start,
				item.end,
			);
			recognition.emit('start');
			recognition.result([{ text: item.speech, final: true }]);
			assert.equal(harness.input.value, item.expected);
			controller.destroy();
		} finally {
			harness.restore();
		}
	}
});

test('trusted typing, paste, and composition edits preserve their value and invalidate late results', () => {
	for (const inputType of ['insertText', 'insertFromPaste', 'insertCompositionText']) {
		const harness = setup();
		try {
			const { controller, recognition } = startSession(harness, 'Before', 6);
			recognition.emit('start');
			harness.input.value = `Learner ${inputType}`;
			harness.input.emit('input', { isTrusted: true, inputType });
			assert.equal(recognition.abortCalls, 1);
			recognition.result([{ text: 'late speech', final: true }]);
			assert.equal(harness.input.value, `Learner ${inputType}`);
			controller.destroy();
		} finally {
			harness.restore();
		}
	}
});

test('stopForReview blocks active submission until recognition ends', () => {
	const harness = setup();
	try {
		const { controller, recognition } = startSession(harness, 'Review ', 7);
		recognition.emit('start');
		recognition.result([{ text: 'this', final: false }]);
		assert.equal(controller.stopForReview(), true);
		assert.equal(recognition.stopCalls, 1);
		assert.equal(controller.stopForReview(), true);
		recognition.result([{ text: 'this', final: true }]);
		recognition.emit('end');
		assert.equal(controller.stopForReview(), false);
		assert.equal(harness.input.value, 'Review this');
		controller.destroy();
	} finally {
		harness.restore();
	}
});

test('a bounded fallback aborts capture when stop never reaches end', async () => {
	const harness = setup();
	try {
		const { controller, recognition } = startSession(harness, 'Review ', 7);
		recognition.emit('start');
		assert.equal(controller.stopForReview(), true);
		await new Promise((resolve) => setTimeout(resolve, 2_050));
		assert.equal(recognition.abortCalls, 1);
		assert.equal(harness.status.dataset.state, 'idle');
		controller.destroy();
	} finally {
		harness.restore();
	}
});

test('cancel and request locking abort capture and ignore late events', () => {
	for (const action of ['cancel', 'lock']) {
		const harness = setup();
		try {
			const { controller, recognition } = startSession(harness, 'Keep', 4);
			recognition.emit('start');
			if (action === 'cancel') controller.cancel();
			else controller.setEnabled(false);
			assert.equal(recognition.abortCalls, 1);
			recognition.result([{ text: 'discarded', final: true }]);
			assert.equal(harness.input.value, 'Keep');
			assert.equal(harness.status.dataset.state, 'idle');
			controller.destroy();
		} finally {
			harness.restore();
		}
	}
});

test('permission denial disables dictation for the page session and never restarts', () => {
	const harness = setup();
	try {
		const { controller, recognition } = startSession(harness);
		recognition.emit('error', { error: 'not-allowed' });
		assert.equal(harness.status.dataset.state, 'error');
		assert.equal(harness.toggle.disabled, true);
		assert.match(harness.error.textContent, /keep typing/i);
		harness.toggle.click();
		assert.equal(FakeRecognition.instances.length, 1);
		controller.setEnabled(true);
		assert.equal(harness.toggle.disabled, true);
		controller.destroy();
	} finally {
		harness.restore();
	}
});

test('unexpected end and backgrounding never leave a false listening state', () => {
	const harness = setup();
	try {
		let session = startSession(harness);
		session.recognition.emit('start');
		session.recognition.emit('end');
		assert.equal(harness.status.dataset.state, 'idle');

		harness.toggle.click();
		const backgrounded = FakeRecognition.instances.at(-1);
		backgrounded.emit('start');
		harness.document.hidden = true;
		harness.document.emit('visibilitychange');
		assert.equal(backgrounded.abortCalls, 1);
		assert.equal(harness.status.dataset.state, 'idle');
		session.controller.destroy();
	} finally {
		harness.restore();
	}
});

test('destroy removes listeners, aborts capture, and prevents late mutation', () => {
	const harness = setup();
	try {
		const { controller, recognition } = startSession(harness, 'Original', 8);
		recognition.emit('start');
		controller.destroy();
		assert.equal(recognition.abortCalls, 1);
		recognition.result([{ text: 'late', final: true }]);
		assert.equal(harness.input.value, 'Original');
		harness.toggle.click();
		assert.equal(FakeRecognition.instances.length, 1);
	} finally {
		harness.restore();
	}
});

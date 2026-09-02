type RecognitionResultLike = Readonly<{
	isFinal: boolean;
	readonly [index: number]: Readonly<{ transcript: string }> | undefined;
}>;

type RecognitionEventLike = Readonly<{
	resultIndex: number;
	results: Readonly<{
		length: number;
		readonly [index: number]: RecognitionResultLike | undefined;
	}>;
}>;

type RecognitionErrorEventLike = Readonly<{ error?: string }>;

type RecognitionListener = (event: never) => void;

type RecognitionLike = {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	abort(): void;
	addEventListener(type: string, listener: RecognitionListener): void;
	removeEventListener(type: string, listener: RecognitionListener): void;
};

type RecognitionConstructor = new () => RecognitionLike;

type SpeechWindow = Window & typeof globalThis & {
	SpeechRecognition?: RecognitionConstructor;
	webkitSpeechRecognition?: RecognitionConstructor;
};

type DictationState = 'idle' | 'starting' | 'listening' | 'stopping' | 'error';

type DictationCompletion =
	| Readonly<{ kind: 'review'; announcement: string }>
	| Readonly<{ kind: 'send'; announcement: string }>;

type DictationSession = {
	recognition: RecognitionLike;
	listeners: Array<readonly [string, RecognitionListener]>;
	before: string;
	after: string;
	committed: string[];
	finalized: Set<number>;
	interim: Map<number, string>;
	completion: DictationCompletion;
	stopVoiceActivity?: () => void;
	stopTimer?: number;
	elapsedTimer?: number;
	startedAt: number;
};

export type DictationController = Readonly<{
	setEnabled(enabled: boolean): void;
	stopForReview(): boolean;
	cancel(): void;
	destroy(): void;
}>;

export type DictationVoiceActivity = Readonly<{
	start(): void;
	stop(): void;
}>;

const stopFallbackMs = 2_000;
const closingPunctuation = /^[,.;:!?%)\]}]/;
const openingPunctuation = /[(\[{“‘]$/;
const sendCommand = /(?:^|\s)send[\s,]+message[\s,.;:!?]*$/iu;

export function stripVoiceSendCommand(text: string): string | undefined {
	const match = sendCommand.exec(text);
	if (!match) return undefined;
	return text.slice(0, match.index).trimEnd();
}

function recognitionConstructor(): RecognitionConstructor | undefined {
	const speechWindow = window as SpeechWindow;
	return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function joinParts(parts: readonly string[]): string {
	let joined = '';
	for (const rawPart of parts) {
		const part = rawPart.trim();
		if (!part) continue;
		const needsSpace = joined !== ''
			&& !/\s$/.test(joined)
			&& !/^\s/.test(part)
			&& !closingPunctuation.test(part)
			&& !openingPunctuation.test(joined);
		joined += `${needsSpace ? ' ' : ''}${part}`;
	}
	return joined;
}

function composeValue(before: string, dictated: string, after: string) {
	const leftSpace = before !== ''
		&& dictated !== ''
		&& !/\s$/.test(before)
		&& !closingPunctuation.test(dictated)
		&& !openingPunctuation.test(before);
	const rightSpace = dictated !== ''
		&& after !== ''
		&& !/\s$/.test(dictated)
		&& !/^\s/.test(after)
		&& !closingPunctuation.test(after)
		&& !openingPunctuation.test(dictated);
	const region = `${leftSpace ? ' ' : ''}${dictated}${rightSpace ? ' ' : ''}`;
	return {
		value: `${before}${region}${after}`,
		selection: before.length + region.length - (rightSpace ? 1 : 0),
	};
}

export function mountDictation(options: Readonly<{
	input: HTMLTextAreaElement;
	toggle: HTMLButtonElement;
	status: HTMLElement;
	voiceActivity?: DictationVoiceActivity;
	onSendRequested: () => void;
}>): DictationController {
	const { input, toggle, status, voiceActivity, onSendRequested } = options;
	const Recognition = recognitionConstructor();
	const announcement = status.querySelector<HTMLElement>('.dictation-announcement');
	const errorCopy = status.querySelector<HTMLElement>('.dictation-error');
	const timer = status.querySelector<HTMLElement>('.dictation-timer');
	const settling = status.querySelector<HTMLElement>('.dictation-settling');
	let state: DictationState = 'idle';
	let enabled = true;
	let destroyed = false;
	let permanentError: string | undefined;
	let session: DictationSession | undefined;
	let programmaticInput = false;

	function announce(text: string) {
		if (announcement) announcement.textContent = text;
	}

	function paint(next: DictationState, message = '') {
		state = next;
		status.dataset.state = next;
		toggle.dataset.state = next;
		const active = next === 'listening' || next === 'stopping';
		toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
		toggle.setAttribute('aria-label', active ? 'Stop dictation' : 'Start dictation');
		toggle.disabled = !enabled
			|| Boolean(permanentError)
			|| next === 'starting'
			|| next === 'stopping';
		if (errorCopy) {
			errorCopy.textContent = next === 'error' ? message : '';
			errorCopy.hidden = next !== 'error';
		}
		if (settling) settling.textContent = next === 'stopping' && session?.completion.kind === 'send'
			? 'Sending'
			: 'Transcribing';
		if (message) announce(message);
	}

	function paintElapsed(active: DictationSession) {
		if (!timer) return;
		const seconds = Math.max(0, Math.floor((Date.now() - active.startedAt) / 1_000));
		const minutes = Math.floor(seconds / 60);
		timer.textContent = `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
	}

	function clearTimers(active: DictationSession) {
		if (active.stopTimer !== undefined) window.clearTimeout(active.stopTimer);
		if (active.elapsedTimer !== undefined) window.clearInterval(active.elapsedTimer);
		active.stopTimer = undefined;
		active.elapsedTimer = undefined;
	}

	function stopVoiceActivity(active: DictationSession) {
		const stop = active.stopVoiceActivity;
		active.stopVoiceActivity = undefined;
		stop?.();
	}

	function finishSession(active: DictationSession, abort: boolean) {
		if (session !== active) return;
		session = undefined;
		clearTimers(active);
		stopVoiceActivity(active);
		for (const [type, listener] of active.listeners) {
			active.recognition.removeEventListener(type, listener);
		}
		active.listeners = [];
		if (abort) {
			try {
				active.recognition.abort();
			} catch {
				// The browser may already have ended capture.
			}
		}
	}

	function cancelSession(active: DictationSession, message = '') {
		finishSession(active, true);
		paint(permanentError ? 'error' : 'idle', permanentError ?? message);
	}

	function isActive(active: DictationSession) {
		return !destroyed && session === active;
	}

	function renderTranscript(active: DictationSession) {
		const interim = [...active.interim.entries()]
			.sort(([left], [right]) => left - right)
			.map(([, text]) => text);
		const dictated = joinParts([...active.committed, ...interim]);
		const composed = composeValue(active.before, dictated, active.after);
		programmaticInput = true;
		input.value = composed.value;
		input.setSelectionRange(composed.selection, composed.selection);
		input.dispatchEvent(new Event('input', { bubbles: true }));
		programmaticInput = false;
	}

	function addRecognitionListener(
		active: DictationSession,
		type: string,
		listener: (event: unknown) => void,
	) {
		const recognitionListener = listener as RecognitionListener;
		active.listeners.push([type, recognitionListener]);
		active.recognition.addEventListener(type, recognitionListener);
	}

	function fail(active: DictationSession, message: string, permanent = false) {
		if (permanent) permanentError = message;
		finishSession(active, true);
		paint('error', message);
	}

	function stop(active: DictationSession, message = '') {
		if (!isActive(active) || state === 'stopping') return;
		if (state === 'starting') {
			cancelSession(active, 'Dictation stopped.');
			return;
		}
		paint('stopping', message);
		clearTimers(active);
		stopVoiceActivity(active);
		try {
			active.recognition.stop();
		} catch {
			cancelSession(active, 'Dictation stopped.');
			return;
		}
		active.stopTimer = window.setTimeout(() => {
			if (!isActive(active)) return;
			cancelSession(active, 'Dictation stopped.');
		}, stopFallbackMs);
	}

	function start() {
		if (!Recognition || destroyed || !enabled || permanentError || session) return;
		const active: DictationSession = {
			recognition: new Recognition(),
			listeners: [],
			before: input.value.slice(0, input.selectionStart),
			after: input.value.slice(input.selectionEnd),
			committed: [],
			finalized: new Set(),
			interim: new Map(),
			completion: { kind: 'review', announcement: 'Dictation stopped.' },
			startedAt: 0,
		};
		session = active;
		active.recognition.continuous = true;
		active.recognition.interimResults = true;
		active.recognition.lang = document.documentElement.lang.trim() || navigator.language;

		addRecognitionListener(active, 'start', () => {
			if (!isActive(active)) return;
			active.startedAt = Date.now();
			paintElapsed(active);
			active.elapsedTimer = window.setInterval(() => paintElapsed(active), 1_000);
			paint('listening', 'Dictation started.');
		});
		addRecognitionListener(active, 'result', (rawEvent) => {
			if (!isActive(active)) return;
			const event = rawEvent as RecognitionEventLike;
			for (let index = event.resultIndex; index < event.results.length; index += 1) {
				const result = event.results[index];
				if (!result) continue;
				const transcript = result[0]?.transcript ?? '';
				if (result.isFinal) {
					active.interim.delete(index);
					if (!active.finalized.has(index)) {
						active.finalized.add(index);
						active.committed.push(transcript);
					}
				} else {
					active.interim.set(index, transcript);
				}
			}
			if (active.interim.size === 0) {
				const dictated = joinParts(active.committed);
				const withoutCommand = stripVoiceSendCommand(dictated);
				if (withoutCommand !== undefined) {
					active.committed = withoutCommand ? [withoutCommand] : [];
					renderTranscript(active);
					active.completion = input.value.trim() === ''
						? { kind: 'review', announcement: 'Nothing to send.' }
						: { kind: 'send', announcement: 'Sending dictated message.' };
					stop(active, active.completion.kind === 'send' ? 'Sending message.' : '');
					return;
				}
			}
			renderTranscript(active);
		});
		addRecognitionListener(active, 'error', (rawEvent) => {
			if (!isActive(active)) return;
			const error = (rawEvent as RecognitionErrorEventLike).error ?? 'unknown';
			switch (error) {
				case 'not-allowed':
				case 'service-not-allowed':
					fail(active, 'Microphone access is unavailable. You can keep typing.', true);
					return;
				case 'audio-capture':
					fail(active, 'No microphone is available. You can keep typing.');
					return;
				case 'network':
					fail(active, "Your browser's speech service is unavailable. You can keep typing.");
					return;
				case 'no-speech':
				case 'nomatch':
					cancelSession(active, 'No speech was recognized. You can keep typing.');
					return;
				case 'aborted':
					cancelSession(active);
					return;
				default:
					fail(active, 'Dictation stopped unexpectedly. You can keep typing.');
			}
		});
		addRecognitionListener(active, 'end', () => {
			if (!isActive(active)) return;
			const completion = active.completion;
			finishSession(active, false);
			paint('idle', completion.announcement);
			if (completion.kind === 'send') onSendRequested();
		});

		paint('starting', 'Starting dictation.');
		try {
			// SpeechRecognition requires start() in the original click gesture.
			if (voiceActivity) {
				active.stopVoiceActivity = () => voiceActivity.stop();
				voiceActivity.start();
			}
			active.recognition.start();
		} catch {
			fail(active, 'Dictation could not start. You can keep typing.');
		}
	}

	function onToggleClick() {
		if (state === 'listening' && session) stop(session);
		else if (state === 'idle' || state === 'error') start();
	}

	function onInput(event: Event) {
		if (programmaticInput || !event.isTrusted || !session) return;
		cancelSession(session, 'Dictation stopped.');
	}

	function onVisibilityChange() {
		if (document.hidden && session) cancelSession(session, 'Dictation stopped.');
	}

	if (!Recognition) {
		toggle.hidden = true;
		toggle.disabled = true;
		return {
			setEnabled() {},
			stopForReview: () => false,
			cancel() {},
			destroy() {},
		};
	}

	toggle.hidden = false;
	toggle.disabled = false;
	toggle.addEventListener('click', onToggleClick);
	input.addEventListener('input', onInput);
	document.addEventListener('visibilitychange', onVisibilityChange);
	paint('idle');

	return {
		setEnabled(next) {
			enabled = next;
			if (!next && session) finishSession(session, true);
			paint(permanentError ? 'error' : 'idle', permanentError ?? '');
		},
		stopForReview() {
			if (!session || state === 'idle' || state === 'error') return false;
			stop(session);
			return true;
		},
		cancel() {
			if (session) cancelSession(session);
		},
		destroy() {
			if (destroyed) return;
			destroyed = true;
			toggle.removeEventListener('click', onToggleClick);
			input.removeEventListener('input', onInput);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			if (session) finishSession(session, true);
			toggle.disabled = true;
		},
	};
}

import { compactMarkdownText, createMarkdownRenderer, type MarkdownRenderer } from './chat-markdown.ts';
import { displayLabel, type DisplayedTurn } from './chat-turns.ts';
import { createQuestionnaire, type QuestionnaireAnswer } from './questionnaire.ts';

const exceptionalLatencyMs = 10_000;
const streamGapMs = 60;

export type TurnStreamSinks = {
	trackRenderer: (renderer: MarkdownRenderer) => void;
	trackTimer: (id: number) => void;
};

export type ActiveTurnOptions = {
	announce?: boolean;
	stagger?: boolean;
	interactive?: boolean;
	stream?: boolean;
};

export type PendingTurnOptions = {
	cancelDisabled: boolean;
	observeRoot: HTMLElement;
	onCancel: () => void;
};

export function createHistoryStep(step: readonly DisplayedTurn[], index: number) {
	const entry = document.createElement('li');
	entry.className = 'history-step';
	const mark = document.createElement('span');
	mark.className = 'history-step-mark';
	mark.textContent = String(index + 1);
	mark.setAttribute('aria-hidden', 'true');
	const body = document.createElement('div');
	body.className = 'history-step-body';
	for (const item of step) {
		const turn = document.createElement('div');
		turn.className = `history-turn ${item.role.toLowerCase()}`;
		const role = document.createElement('span');
		role.className = 'sr-only';
		role.textContent = displayLabel(item.role);
		const copy = document.createElement('p');
		copy.textContent = historyBodyText(item.text);
		turn.append(role, copy);
		body.append(turn);
	}
	entry.append(mark, body);
	return entry;
}

export function createActiveTurn(
	item: DisplayedTurn,
	{ announce = false, stagger = false, interactive = false, stream = false }: ActiveTurnOptions = {},
	sinks: TurnStreamSinks,
	onQuestionnaireSubmit: (answers: QuestionnaireAnswer[]) => void,
) {
	const wrap = document.createElement('div');
	wrap.className = `turn ${item.role.toLowerCase()}`;
	if (announce) wrap.setAttribute('aria-live', 'polite');
	if (stagger) wrap.classList.add('stagger-item');
	appendTurnCopy(wrap, item, stream, sinks);
	if (item.questionnaire && interactive) {
		const questionnaire = item.questionnaire;
		wrap.append(
			createQuestionnaire(questionnaire, (answers) => {
				onQuestionnaireSubmit(answers);
			}),
		);
	}
	return wrap;
}

export function createStarterTurn(onPick: (prompt: string) => void): HTMLElement | null {
	const template = document.querySelector<HTMLTemplateElement>('#starter-template');
	if (!template) return null;
	const wrap = template.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
	if (!wrap) return null;
	for (const chip of wrap.querySelectorAll<HTMLButtonElement | HTMLElement>('.starter-chip, .starter-spark-pill')) {
		chip.addEventListener('click', () => {
			const val = chip.getAttribute('data-prompt') || chip.textContent?.trim() || '';
			if (val) onPick(val);
		});
	}
	return wrap;
}

export function createPendingTurn({ cancelDisabled, observeRoot, onCancel }: PendingTurnOptions) {
	const wrap = document.createElement('div');
	wrap.className = 'turn pending';
	wrap.setAttribute('role', 'status');
	wrap.setAttribute('aria-live', 'polite');
	const body = document.createElement('p');
	const dot = document.createElement('span');
	dot.className = 'pending-dot';
	dot.setAttribute('aria-hidden', 'true');
	const label = document.createElement('span');
	label.className = 'pending-word';
	label.textContent = 'Waiting for Socratink';
	body.append(dot, label);
	const cancel = document.createElement('button');
	cancel.className = 'request-action';
	cancel.type = 'button';
	cancel.disabled = cancelDisabled;
	cancel.textContent = cancel.disabled ? 'Canceling…' : 'Cancel';
	cancel.addEventListener('click', () => {
		cancel.disabled = true;
		cancel.textContent = 'Canceling…';
		onCancel();
	});
	const latency = document.createElement('p');
	latency.className = 'pending-latency';
	latency.textContent = 'Taking longer than usual.';
	latency.hidden = true;
	wrap.append(body, cancel, latency);
	const timer = window.setTimeout(() => {
		if (wrap.isConnected) latency.hidden = false;
	}, exceptionalLatencyMs);
	const observer = new MutationObserver(() => {
		if (wrap.isConnected) return;
		window.clearTimeout(timer);
		observer.disconnect();
	});
	observer.observe(observeRoot, { childList: true });
	return wrap;
}

function appendTurnCopy(
	parent: HTMLElement,
	item: DisplayedTurn,
	stream: boolean,
	sinks: TurnStreamSinks,
) {
	const head = document.createElement('div');
	head.className = 'turn-head';
	const label = document.createElement('span');
	label.className = 'turn-label';
	label.textContent = displayLabel(item.role);
	head.append(label);
	if (item.role === 'Assistant' && item.modelRoute) {
		const routeLabel = document.createElement('span');
		routeLabel.className = 'turn-model';
		routeLabel.textContent = item.modelRoute;
		routeLabel.title = item.modelRoute;
		head.append(routeLabel);
	}
	parent.append(head);
	if (item.role === 'Assistant') {
		const renderer = createMarkdownRenderer();
		sinks.trackRenderer(renderer);
		renderer.update(item.text, { stream, streamGapMs });
		parent.append(renderer.element);
		return;
	}
	const body = document.createElement('p');
	fillTurnBody(body, item.text, stream, sinks.trackTimer);
	parent.append(body);
}

function fillTurnBody(
	body: HTMLParagraphElement,
	text: string,
	stream: boolean,
	trackTimer: (id: number) => void,
) {
	body.replaceChildren();
	if (!text) {
		body.hidden = true;
		return;
	}
	body.hidden = false;
	if (!stream) {
		body.textContent = text;
		return;
	}
	const spans: HTMLSpanElement[] = [];
	for (const token of text.split(/(\s+)/)) {
		if (token === '') continue;
		if (/^\s+$/.test(token)) {
			body.append(token);
			continue;
		}
		const word = document.createElement('span');
		word.className = 'stream-word';
		word.textContent = token;
		body.append(word);
		spans.push(word);
	}
	spans.forEach((word, index) => {
		trackTimer(window.setTimeout(() => word.classList.add('is-in'), index * streamGapMs));
	});
}

function historyBodyText(text: string): string {
	const body = text.startsWith('Questionnaire answers:')
		? text.slice('Questionnaire answers:'.length).replace(/^- /gm, '').trim()
		: text;
	return compactMarkdownText(body);
}

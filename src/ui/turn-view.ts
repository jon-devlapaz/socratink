import { compactMarkdownText } from './chat-markdown-parse.ts';
import { createMarkdownRenderer, type MarkdownRenderer } from './chat-markdown.ts';
import { displayLabel, type DisplayedTurn } from './chat-turns.ts';
import { createQuestionnaire, type QuestionnaireAnswer } from './questionnaire.ts';
import { createSteeringBar, type SteeringKind } from './steering.ts';
import { visibleThinkingStep } from './thinking.ts';
import { createToolCard, createToolList, type DisplayedToolCall } from './tool-card.ts';

const exceptionalLatencyMs = 10_000;
const streamGapMs = 60;

export type TurnStreamSinks = {
	trackRenderer: (renderer: MarkdownRenderer) => void;
};

export type ActiveTurnOptions = {
	announce?: boolean;
	stagger?: boolean;
	interactive?: boolean;
	steering?: boolean;
	stream?: boolean;
};

export type ActiveTurnHandlers = {
	onQuestionnaireSubmit: (answers: QuestionnaireAnswer[]) => void;
	onSteer: (kind: SteeringKind) => void;
};

export type PendingTurnOptions = {
	cancelDisabled: boolean;
	onCancel: () => void;
	tools?: readonly DisplayedToolCall[];
	reasoning?: string;
};

export type PendingTurnSession = {
	readonly element: HTMLElement;
	dispose(): void;
	setReasoning(text: string): void;
	setTools(calls: readonly DisplayedToolCall[]): void;
	setCancelDisabled(disabled: boolean): void;
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
		copy.textContent = historyBodyText(item);
		turn.append(role, copy);
		body.append(turn);
	}
	entry.append(mark, body);
	return entry;
}

export function createActiveTurn(
	item: DisplayedTurn,
	{
		announce = false,
		stagger = false,
		interactive = false,
		steering = false,
		stream = false,
	}: ActiveTurnOptions = {},
	sinks: TurnStreamSinks,
	handlers: ActiveTurnHandlers,
) {
	const wrap = document.createElement('div');
	wrap.className = `turn ${item.role.toLowerCase()}`;
	if (announce) wrap.setAttribute('aria-live', 'polite');
	if (stagger) wrap.classList.add('stagger-item');
	appendTurnCopy(wrap, item, stream, sinks);
	if (item.tools?.length) wrap.append(createToolList(item.tools));
	if (item.questionnaire && interactive) {
		const questionnaire = item.questionnaire;
		wrap.append(
			createQuestionnaire(questionnaire, (answers) => {
				handlers.onQuestionnaireSubmit(answers);
			}),
		);
	}
	if (steering && item.role === 'Assistant' && item.text.trim()) {
		wrap.append(
			createSteeringBar({
				sourceText: item.text,
				selectionRoot: wrap,
				onSteer: handlers.onSteer,
			}),
		);
	}
	return wrap;
}

export function createPendingTurn({
	cancelDisabled,
	onCancel,
	tools = [],
	reasoning = '',
}: PendingTurnOptions): PendingTurnSession {
	const wrap = document.createElement('div');
	wrap.className = 'turn pending';
	wrap.setAttribute('role', 'status');
	wrap.setAttribute('aria-live', 'polite');
	wrap.setAttribute('aria-label', 'Waiting for Socratink');
	const stepsId = 'pending-thinking-steps';
	const bar = document.createElement('div');
	bar.className = 'thinking-bar';
	const toggle = document.createElement('button');
	toggle.className = 'thinking-toggle';
	toggle.type = 'button';
	toggle.setAttribute('aria-expanded', 'true');
	toggle.setAttribute('aria-controls', stepsId);
	toggle.setAttribute('aria-label', 'Hide what Socratink is doing');
	const word = document.createElement('span');
	word.className = 'thinking-shimmer';
	word.setAttribute('aria-hidden', 'true');
	word.textContent = 'Thinking';
	const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	chevron.setAttribute('class', 'thinking-chevron');
	chevron.setAttribute('viewBox', '0 0 16 16');
	chevron.setAttribute('aria-hidden', 'true');
	const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	chevronPath.setAttribute('d', 'M6 3.5 11 8 6 12.5');
	chevronPath.setAttribute('fill', 'none');
	chevronPath.setAttribute('stroke', 'currentColor');
	chevronPath.setAttribute('stroke-width', '1.5');
	chevronPath.setAttribute('stroke-linecap', 'round');
	chevronPath.setAttribute('stroke-linejoin', 'round');
	chevron.append(chevronPath);
	const orbs = createThinkingOrbs();
	toggle.append(orbs, word, chevron);
	const cancel = document.createElement('button');
	cancel.className = 'thinking-cancel';
	cancel.type = 'button';
	cancel.append(createStopIcon());
	const setCanceling = (disabled: boolean) => {
		cancel.disabled = disabled;
		cancel.setAttribute('aria-label', disabled ? 'Canceling' : 'Cancel');
	};
	setCanceling(cancelDisabled);
	cancel.addEventListener('click', () => {
		setCanceling(true);
		onCancel();
	});
	bar.append(toggle, cancel);
	const steps = document.createElement('div');
	steps.className = 'thinking-steps';
	steps.id = stepsId;
	const rail = document.createElement('span');
	rail.className = 'thinking-steps-bar';
	rail.setAttribute('aria-hidden', 'true');
	const list = document.createElement('ul');
	list.className = 'thinking-steps-list';
	const working = document.createElement('li');
	working.className = 'thinking-step-copy';
	working.textContent = visibleThinkingStep(reasoning);
	const latency = document.createElement('li');
	latency.className = 'pending-latency';
	latency.textContent = 'Taking longer than usual.';
	latency.hidden = true;
	list.append(working, latency);
	steps.append(rail, list);
	toggle.addEventListener('click', () => {
		const expanded = toggle.getAttribute('aria-expanded') === 'true';
		toggle.setAttribute('aria-expanded', String(!expanded));
		toggle.setAttribute(
			'aria-label',
			expanded ? 'Show what Socratink is doing' : 'Hide what Socratink is doing',
		);
		steps.hidden = expanded;
	});
	wrap.append(bar, steps);
	if (tools.length) wrap.append(createToolList(tools));
	const timer = window.setTimeout(() => {
		if (wrap.isConnected) latency.hidden = false;
	}, exceptionalLatencyMs);

	return {
		element: wrap,
		dispose() {
			window.clearTimeout(timer);
		},
		setReasoning(text) {
			working.textContent = visibleThinkingStep(text);
		},
		setTools(calls) {
			const host = wrap.querySelector('.tool-list');
			if (!calls.length) {
				host?.remove();
				return;
			}
			if (!host) {
				wrap.append(createToolList(calls));
				return;
			}
			host.replaceChildren(...calls.map(createToolCard));
		},
		setCancelDisabled(disabled) {
			setCanceling(disabled);
		},
	};
}

function createStopIcon() {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('class', 'thinking-cancel-icon');
	svg.setAttribute('viewBox', '0 0 16 16');
	svg.setAttribute('aria-hidden', 'true');
	const mark = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	mark.setAttribute('x', '5');
	mark.setAttribute('y', '5');
	mark.setAttribute('width', '6');
	mark.setAttribute('height', '6');
	mark.setAttribute('rx', '1');
	mark.setAttribute('fill', 'currentColor');
	svg.append(mark);
	return svg;
}

export function createThinkingOrbs(): HTMLElement {
	const wrap = document.createElement('span');
	wrap.className = 'thinking-orbs';
	wrap.setAttribute('aria-hidden', 'true');

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('class', 'thinking-gooey-filter');
	svg.setAttribute('width', '0');
	svg.setAttribute('height', '0');
	svg.setAttribute('aria-hidden', 'true');

	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
	filter.setAttribute('id', 'thinking-gooey');
	filter.setAttribute('x', '-50%');
	filter.setAttribute('y', '-50%');
	filter.setAttribute('width', '200%');
	filter.setAttribute('height', '200%');

	const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
	blur.setAttribute('in', 'SourceGraphic');
	blur.setAttribute('stdDeviation', '1.2');
	blur.setAttribute('result', 'blur');

	const matrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
	matrix.setAttribute('in', 'blur');
	matrix.setAttribute('mode', 'matrix');
	matrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7');
	matrix.setAttribute('result', 'gooey');

	const blend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
	blend.setAttribute('in', 'SourceGraphic');
	blend.setAttribute('in2', 'gooey');

	filter.append(blur, matrix, blend);
	defs.append(filter);
	svg.append(defs);

	const blobs = document.createElement('span');
	blobs.className = 'thinking-blobs';

	for (let i = 0; i < 3; i++) {
		const blob = document.createElement('span');
		blob.className = 'thinking-blob';
		blob.style.animationDelay = `${(i * 0.2).toFixed(1)}s`;
		blobs.append(blob);
	}

	wrap.append(svg, blobs);
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
	if (!item.text) body.hidden = true;
	else body.textContent = item.text;
	parent.append(body);
}

function historyBodyText(item: DisplayedTurn): string {
	if (item.trailText) return item.trailText;
	const compact = compactMarkdownText(item.text);
	if (compact) return compact;
	if (item.tools?.length) return item.tools.map((call) => call.name).join(', ');
	return '';
}

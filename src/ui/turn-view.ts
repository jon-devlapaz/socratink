import { markSuppliedCopy } from './reveal-mark.ts';
import { compactMarkdownText } from './chat-markdown-parse.ts';
import { createMarkdownRenderer, type MarkdownRenderer } from './chat-markdown.ts';
import { displayLabel, type DisplayedTurn } from './chat-turns.ts';
import { createQuestionnaire } from './questionnaire.ts';
import type { QuestionnaireAnswer } from '../questionnaire.ts';
import { createSteeringBar, type SteeringKind } from './steering.ts';
import { createToolCard, createToolList } from './tool-card.ts';
import type { DisplayedToolCall } from './tool-state.ts';
import type { LiveReplyView } from './live-reply.ts';

const exceptionalLatencyMs = 10_000;

export type TurnStreamSinks = {
	trackRenderer: (renderer: MarkdownRenderer) => void;
};

export type ActiveTurnOptions = {
	announce?: boolean;
	stagger?: boolean;
	interactive?: boolean;
	steering?: boolean;
};

export type ActiveTurnHandlers = {
	onQuestionnaireSubmit: (answers: QuestionnaireAnswer[]) => void;
	onSteer: (kind: SteeringKind) => void;
};

export type PendingTurnOptions = {
	cancelDisabled: boolean;
	onCancel: () => void;
	tools?: readonly DisplayedToolCall[];
};

export type PendingTurnSession = {
	readonly element: HTMLElement;
	dispose(): void;
	setTools(calls: readonly DisplayedToolCall[]): void;
	/** Shows reply text as it arrives; empty markdown shows none. */
	setText(view: LiveReplyView): void;
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
		if (item.role === 'Assistant' && item.text.trim() && item.reveal) {
			markSuppliedCopy(copy, item.reveal);
		}
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
	}: ActiveTurnOptions = {},
	sinks: TurnStreamSinks,
	handlers: ActiveTurnHandlers,
) {
	const wrap = document.createElement('div');
	wrap.className = `turn ${item.role.toLowerCase()}`;
	if (announce) wrap.setAttribute('aria-live', 'polite');
	if (stagger) wrap.classList.add('stagger-item');
	// An answered card is gone, so a card-only turn shows the question it asked.
	const asked = item.questionnaire && !interactive
		? item.questionnaire.items.map((question) => question.prompt).join('\n\n') : undefined;
	appendTurnCopy(wrap, item, sinks, asked);
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
	// A status, never the model's raw reasoning: that can leak a verdict early.
	working.textContent = 'Working from what you wrote';
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
	// The region announces status only. Text that streams in is not read word
	// by word; the settled turn announces the reply once.
	const reply = createMarkdownRenderer();
	reply.element.setAttribute('aria-hidden', 'true');
	reply.update('');
	steps.after(reply.element);
	let shown: LiveReplyView = { markdown: '' };

	return {
		element: wrap,
		dispose() {
			window.clearTimeout(timer);
			reply.destroy();
		},
		setText(view) {
			if (view.markdown === shown.markdown && view.reveal?.kind === shown.reveal?.kind) return;
			shown = view;
			// A reply on screen is not "taking longer than usual".
			if (view.markdown) { window.clearTimeout(timer); latency.hidden = true; }
			reply.update(view.markdown);
			if (view.markdown && view.reveal) markSuppliedCopy(reply.element, view.reveal);
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

function createThinkingOrbs(): HTMLElement {
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
	sinks: TurnStreamSinks,
	asked?: string,
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
		renderer.update(item.text.trim() || !asked ? item.text : asked);
		if (item.text.trim() && item.reveal) markSuppliedCopy(renderer.element, item.reveal);
		parent.append(renderer.element);
		return;
	}
	const body = document.createElement('p');
	const shown = item.shownText ?? item.text;
	if (!shown) body.hidden = true;
	else body.textContent = shown;
	parent.append(body);
}

function historyBodyText(item: DisplayedTurn): string {
	const compact = compactMarkdownText(item.shownText ?? item.text);
	if (compact) return compact;
	// A card-only turn shows the question it asked.
	if (item.questionnaire) return item.questionnaire.items.map((question) => question.prompt).join(' ');
	if (item.tools?.length) return item.tools.map((call) => call.name).join(', ');
	return '';
}

import {
	FlueApiError,
	type AgentReadResult,
} from '@flue/sdk';
import {
	ChatRequestCoordinator,
	chatRequestControls,
	type ChatRequestState,
	openChatConversation,
	startNewChatConversation,
	unsettledSubmissionFromHistory,
} from './client/conversation.ts';
import { r1OpeningKickoff, r1OpeningMessage } from '../config/r1-learning.ts';
import { initAppearance, toggleAppearance } from './theme.ts';
import { cycleTypeSize, initTypeSize } from './type-size.ts';
import { mountAppDock } from './app-dock.ts';
import { attachTranscriptScroll } from './transcript-scroll.ts';
import {
	displayLabel,
	splitCurrentTurns,
	visibleTurnsFromHistory,
	type ChatMessageRole,
	type DisplayedTurn,
} from './chat-turns.ts';
import {
	createQuestionnaire,
	createQuestionnaireSummary,
	questionnaireFromReplyData,
	questionnaireUserMessage,
} from './questionnaire.ts';
import type { QuestionnaireDefinition } from '../questionnaire.ts';

type PaintKind = 'opening' | 'restore' | 'new-turn' | 'hold';

type ChatSurfaceElements = {
	form: HTMLFormElement;
	input: HTMLTextAreaElement;
	messages: HTMLOListElement;
	button: HTMLButtonElement;
	core: HTMLButtonElement;
	lockup: HTMLButtonElement;
	canvas: HTMLElement;
	startOver: HTMLButtonElement;
	card: HTMLElement;
	activeTurn: HTMLElement;
	peekHandle: HTMLButtonElement;
	menuLayer: HTMLElement;
	menuPanel: HTMLElement;
	menuHandle: HTMLElement;
	menuBackdrop: HTMLButtonElement;
	menuFirst: HTMLElement;
	trailToggle: HTMLButtonElement;
	trailLabel: HTMLElement;
	appearance: HTMLButtonElement;
	typeSize: HTMLButtonElement;
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const drawerCloseRatio = 0.25;
const drawerFlickVelocity = 0.4;
const peekOpenDistance = 48;
const handleClickSlop = 8;
const exceptionalLatencyMs = 10_000;
const streamGapMs = 60;

type RequestControlElements = Pick<
	ChatSurfaceElements,
	'input' | 'button' | 'startOver' | 'core' | 'lockup' | 'activeTurn'
>;

export function applyRequestControlState(
	state: ChatRequestState,
	elements: RequestControlElements,
): boolean {
	const controls = chatRequestControls(state);
	elements.input.disabled = controls.composerLocked;
	elements.button.disabled = controls.composerLocked;
	elements.startOver.disabled = controls.startOverDisabled;
	elements.core.classList.toggle('is-working', controls.busy);
	elements.lockup.classList.toggle('is-working', controls.busy);
	return controls.busy;
}

export function focusAfterRequestStatePaint(
	state: ChatRequestState,
	elements: Pick<RequestControlElements, 'input' | 'activeTurn'>,
): void {
	if (chatRequestControls(state).composerLocked) {
		const action = elements.activeTurn.querySelector<HTMLButtonElement>(
			'.request-actions .request-action',
		);
		if (action) {
			action.focus();
			return;
		}
	}
	elements.input.focus();
}

export function buildRequestStateTurn(
	state: Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>,
	action: () => Promise<ChatRequestState>,
	runRequestCommand: (result: Promise<ChatRequestState>) => void,
): HTMLElement {
	const wrap = document.createElement('div');
	wrap.className = `turn request-state ${state.kind === 'terminal' ? state.outcome : 'recovery'}`;
	wrap.setAttribute('role', 'status');
	wrap.setAttribute('aria-live', 'polite');
	const label = document.createElement('span');
	label.className = 'turn-label';
	label.textContent = state.kind === 'recovery'
		? 'Outcome unknown'
		: state.outcome === 'aborted'
			? 'Canceled'
			: state.outcome === 'not-admitted'
				? 'Not sent'
				: 'Reply failed';
	const body = document.createElement('p');
	body.textContent = state.detail;
	const actions = document.createElement('div');
	actions.className = 'request-actions';
	const button = document.createElement('button');
	button.className = 'request-action';
	button.type = 'button';
	button.textContent = state.kind === 'terminal' ? 'Retry' : 'Recheck';
	button.addEventListener('click', () => {
		for (const actionButton of button.parentElement?.querySelectorAll('button') ?? []) {
			actionButton.disabled = true;
		}
		runRequestCommand(action());
	});
	actions.append(button);
	wrap.append(label, body, actions);
	return wrap;
}

export function mountChatSurface(elements: ChatSurfaceElements = queryChatSurface()): void {
	const conversation = openChatConversation();
	const {
		form,
		input,
		messages,
		button,
		core,
		lockup,
		canvas,
		startOver,
		card,
		activeTurn,
		peekHandle,
		menuLayer,
		menuPanel,
		menuHandle,
		menuBackdrop,
		menuFirst,
		trailToggle,
		trailLabel,
		appearance,
		typeSize,
	} = elements;
	const requests = new ChatRequestCoordinator(conversation);
	const learningDock = mountAppDock(core);
	let working = false;
	let menuOpen = false;
	let trailOpen = false;
	let hasEntered = false;
	let turns: DisplayedTurn[] = [];
	let requestState: ChatRequestState = requests.state;
	const transcript = attachTranscriptScroll(card);
	const streamTimers: number[] = [];

	function wait(ms: number) {
		return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
	}

	function clearStream() {
		for (const id of streamTimers) window.clearTimeout(id);
		streamTimers.length = 0;
	}

	function fillTurnBody(body: HTMLParagraphElement, text: string, stream: boolean) {
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
			streamTimers.push(window.setTimeout(() => word.classList.add('is-in'), index * streamGapMs));
		});
	}

	function createLabeledBody(role: ChatMessageRole, text: string, stream = false) {
		const label = document.createElement('span');
		label.className = 'turn-label';
		label.textContent = displayLabel(role);
		const body = document.createElement('p');
		fillTurnBody(body, text, stream);
		return { label, body };
	}

	function createHistoryItem(
		role: ChatMessageRole,
		text: string,
		questionnaire?: QuestionnaireDefinition,
	) {
		const item = document.createElement('li');
		item.className = role.toLowerCase();
		const { label, body } = createLabeledBody(role, text);
		item.append(label, body);
		if (questionnaire) item.append(createQuestionnaireSummary(questionnaire));
		return item;
	}

	function createActiveTurn(
		role: ChatMessageRole,
		text: string,
		questionnaire: QuestionnaireDefinition | undefined,
		{ announce = false, stagger = false, interactive = false, stream = false } = {},
	) {
		const wrap = document.createElement('div');
		wrap.className = `turn ${role.toLowerCase()}`;
		if (announce) wrap.setAttribute('aria-live', 'polite');
		if (stagger) wrap.classList.add('stagger-item');
		const { label, body } = createLabeledBody(role, text, stream);
		wrap.append(label, body);
		if (questionnaire && interactive) {
			wrap.append(
				createQuestionnaire(questionnaire, (answers) => {
					const source = questionnaireSource(role);
					if (!source) return;
					const message = questionnaireUserMessage(source, questionnaire, answers);
					if (message) void sendMessage(message);
				}),
			);
		}
		return wrap;
	}

	function createPendingTurn() {
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
		cancel.disabled = requestState.kind === 'canceling';
		cancel.textContent = cancel.disabled ? 'Canceling…' : 'Cancel';
		cancel.addEventListener('click', () => {
			cancel.disabled = true;
			cancel.textContent = 'Canceling…';
			void runRequestCommand(requests.cancel());
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
		observer.observe(activeTurn, { childList: true });
		return wrap;
	}

	function createRequestStateTurn(
		state: Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>,
	) {
		if (state.kind === 'terminal') {
			return buildRequestStateTurn(state, () => requests.retry(), (result) => {
				void runRequestCommand(result);
			});
		}
		return buildRequestStateTurn(state, () => requests.recheck(), (result) => {
			void runRequestCommand(result);
		});
	}

	function questionnaireSource(role: ChatMessageRole): 'opening' | 'assistant' | undefined {
		switch (role) {
			case 'Socratink':
				return 'opening';
			case 'Assistant':
				return 'assistant';
			case 'You':
			case 'Error':
				return undefined;
			default: {
				const exhaustive: never = role;
				return exhaustive;
			}
		}
	}

	function setTrailOpen(open: boolean) {
		if (open) transcript.stopFollowing();
		void transcript.preserveAround(() => {
			trailOpen = open && messages.childElementCount > 0;
			trailToggle.setAttribute('aria-expanded', String(trailOpen));
			messages.hidden = !trailOpen;
		});
	}

	function syncTrail() {
		const count = messages.childElementCount;
		trailToggle.hidden = count === 0;
		trailLabel.textContent = count === 1 ? '1 earlier step' : `${count} earlier steps`;
		if (count === 0) {
			trailOpen = false;
			trailToggle.setAttribute('aria-expanded', 'false');
			messages.hidden = true;
			return;
		}
		messages.hidden = !trailOpen;
	}

	function setMenuOpen(open: boolean) {
		if (menuOpen === open) return;
		if (open) learningDock.close();
		menuOpen = open;
		menuPanel.classList.remove('is-dragging');
		menuLayer.classList.toggle('is-open', open);
		menuLayer.setAttribute('aria-hidden', String(!open));
		lockup.setAttribute('aria-expanded', String(open));
		peekHandle.setAttribute('aria-expanded', String(open));
		canvas.inert = open;
		peekHandle.inert = open;
		menuLayer.inert = !open;
		if (open) {
			menuPanel.style.transform = '';
			menuFirst.focus();
			return;
		}
		requestAnimationFrame(() => {
			menuPanel.style.transform = '';
		});
		peekHandle.focus();
	}

	function suppressNextClick(handle: HTMLElement) {
		let done = false;
		const suppress = (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			finish();
		};
		const finish = () => {
			if (done) return;
			done = true;
			handle.removeEventListener('click', suppress, true);
		};
		handle.addEventListener('click', suppress, true);
		window.setTimeout(finish, 500);
	}

	function bindSheetHandle(handle: HTMLElement, { openOnDown = false } = {}) {
		if (reduceMotion) return;
		let dragging = false;
		let moved = false;
		let startY = 0;
		let lastY = 0;
		let lastT = 0;
		let velocity = 0;
		let panelHeight = 0;

		handle.addEventListener('pointerdown', (event) => {
			if (event.button !== 0) return;
			if (!openOnDown && !menuOpen) return;
			if (openOnDown && menuOpen) return;
			dragging = true;
			moved = false;
			startY = event.clientY;
			lastY = event.clientY;
			lastT = performance.now();
			velocity = 0;
			panelHeight = menuPanel.offsetHeight;
			handle.setPointerCapture(event.pointerId);
		});

		handle.addEventListener('pointermove', (event) => {
			if (!dragging) return;
			const now = performance.now();
			const dy = event.clientY - startY;
			velocity = (event.clientY - lastY) / Math.max(now - lastT, 1);
			lastY = event.clientY;
			lastT = now;
			if (!moved && Math.abs(dy) < handleClickSlop) return;
			if (!moved) {
				moved = true;
				menuPanel.classList.add('is-dragging');
				if (openOnDown) menuLayer.classList.add('is-pulling');
			}
			if (menuOpen) {
				const offset = dy < 0 ? dy : dy * 0.15;
				menuPanel.style.transform = `translate3d(0, ${offset}px, 0)`;
				return;
			}
			const closedY = -panelHeight * 1.1;
			let nextY = closedY + Math.max(0, dy);
			if (nextY > 0) nextY *= 0.15;
			menuPanel.style.transform = `translate3d(0, ${nextY}px, 0)`;
		});

		function finishDrag() {
			if (!dragging) return;
			dragging = false;
			menuPanel.classList.remove('is-dragging');
			menuLayer.classList.remove('is-pulling');
			if (!moved) return;
			suppressNextClick(handle);
			const dy = lastY - startY;
			if (openOnDown) {
				if (dy > peekOpenDistance || velocity > drawerFlickVelocity) {
					setMenuOpen(true);
					return;
				}
				menuPanel.style.transform = '';
				return;
			}
			const shouldClose = dy < -panelHeight * drawerCloseRatio || velocity < -drawerFlickVelocity;
			if (shouldClose) {
				setMenuOpen(false);
				return;
			}
			menuPanel.style.transform = '';
		}

		handle.addEventListener('pointerup', finishDrag);
		handle.addEventListener('pointercancel', finishDrag);
	}

	async function paint(kind: PaintKind) {
		const render = async () => {
			clearStream();
			const { earlier, current } = splitCurrentTurns(turns);
			messages.replaceChildren(
				...earlier.map((item) => createHistoryItem(item.role, item.text, item.questionnaire)),
			);
			syncTrail();

			if (kind === 'new-turn' && hasEntered && !reduceMotion && activeTurn.childElementCount > 0) {
				activeTurn.classList.add('is-exiting');
				await wait(150);
				activeTurn.classList.remove('is-exiting');
			}

			activeTurn.replaceChildren(
				...current.map((item, index) => {
					const isLast = index === current.length - 1;
					const stream = kind === 'hold' && isLast && item.role === 'Assistant' && !reduceMotion;
					return createActiveTurn(item.role, item.text, item.questionnaire, {
						announce: kind === 'hold' && isLast,
						stagger: kind === 'hold' && hasEntered && !reduceMotion && isLast && !stream,
						interactive: isLast && Boolean(item.questionnaire),
						stream,
					});
				}),
			);
			if (requestState.kind === 'waiting' || requestState.kind === 'canceling') {
				activeTurn.append(createPendingTurn());
			}
			if (requestState.kind === 'recovery' || requestState.kind === 'terminal') {
				activeTurn.append(createRequestStateTurn(requestState));
			}
			if (kind === 'new-turn' || kind === 'hold') hasEntered = true;
			document.body.classList.toggle('encounter-active', turns.length > 1);
		};

		switch (kind) {
			case 'hold':
				await transcript.hold(render);
				return;
			case 'new-turn':
				await render();
				transcript.followLiveEdge();
				return;
			case 'restore':
				await render();
				transcript.pinCurrentStart();
				return;
			case 'opening':
				await render();
				transcript.refresh();
				return;
			default: {
				const exhaustive: never = kind;
				return exhaustive;
			}
		}
	}

	function setWorking(next: boolean) {
		working = next;
		input.disabled = next;
		button.disabled = next;
		startOver.disabled = next;
		core.classList.toggle('is-working', next);
		lockup.classList.toggle('is-working', next);
	}

	function applyRequestControls(state: ChatRequestState) {
		working = applyRequestControlState(state, elements);
	}

	function focusAfterRequestPaint(state: ChatRequestState) {
		focusAfterRequestStatePaint(state, elements);
	}

	initAppearance(appearance);
	initTypeSize(typeSize);
	startOver.addEventListener('click', startNewChatConversation);
	appearance.addEventListener('click', () => toggleAppearance(appearance));
	typeSize.addEventListener('click', () => cycleTypeSize(typeSize));
	lockup.addEventListener('click', () => setMenuOpen(!menuOpen));
	peekHandle.addEventListener('click', () => {
		if (!menuOpen) setMenuOpen(true);
	});
	menuHandle.addEventListener('click', () => {
		if (menuOpen) setMenuOpen(false);
	});
	menuBackdrop.addEventListener('click', () => setMenuOpen(false));
	trailToggle.addEventListener('click', () => setTrailOpen(!trailOpen));
	document.addEventListener('keydown', (event) => {
		if (!menuOpen) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			setMenuOpen(false);
			return;
		}
		if (event.key !== 'Tab') return;
		const items = [...menuLayer.querySelectorAll<HTMLElement>('.menu-orbs a, .menu-orbs button')].filter(
			(item) => item instanceof HTMLButtonElement ? !item.disabled : true,
		);
		const first = items[0];
		const last = items.at(-1);
		if (!first || !last) return;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
			return;
		}
		if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	});
	menuLayer.inert = true;
	bindSheetHandle(menuHandle);
	bindSheetHandle(peekHandle, { openOnDown: true });

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			form.requestSubmit();
		}
	});

	async function sendMessage(text: string) {
		if (working || requests.state.kind !== 'idle') return;
		turns = [...turns, { role: 'You', text }];
		input.value = '';
		await startRequest(text);
	}

	async function startRequest(text: string) {
		const result = requests.start(text);
		requestState = requests.state;
		applyRequestControls(requestState);
		await paint('new-turn');
		await applyRequestState(await result);
	}

	async function appendAssistantReply(reply: AgentReadResult) {
		const questionnaire = questionnaireFromReplyData(reply.data);
		turns = [
			...turns,
			{
				role: 'Assistant',
				text: reply.text,
				...(questionnaire ? { questionnaire } : {}),
			},
		];
		await paint('hold');
	}

	async function runRequestCommand(result: Promise<ChatRequestState>) {
		requestState = requests.state;
		applyRequestControls(requestState);
		if (requestState.kind === 'waiting' || requestState.kind === 'canceling') {
			await paint(requestState.kind === 'waiting' ? 'new-turn' : 'hold');
		}
		await applyRequestState(await result);
	}

	async function applyRequestState(state: ChatRequestState) {
		if (requests.state !== state) return;
		requestState = state;
		if (state.kind === 'completed') {
			requests.acknowledgeCompleted();
			requestState = requests.state;
			applyRequestControls(requestState);
			await appendAssistantReply(state.reply);
			input.focus();
			return;
		}
		applyRequestControls(state);
		await paint('hold');
		focusAfterRequestPaint(state);
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const text = input.value.trim();
		if (!text || working) return;
		await sendMessage(text);
	});

	async function restoreConversation() {
		if (working) return;
		let fresh = false;
		let unsettled: ReturnType<typeof unsettledSubmissionFromHistory>;
		setWorking(true);
		try {
			let visible: DisplayedTurn[] = [];
			try {
				const history = await conversation.history();
				unsettled = unsettledSubmissionFromHistory(history);
				const unsettledSubmissionId = unsettled?.submissionId;
				const restoredHistory = unsettled
					? {
						...history,
						messages: history.messages.filter(
							(message) => message.submissionId !== unsettledSubmissionId || message.role === 'user',
						),
					}
					: history;
				visible = visibleTurnsFromHistory(restoredHistory).filter(
					(turn) => turn.role !== 'You' || turn.text !== r1OpeningKickoff,
				);
				if (unsettled) {
					requestState = requests.hydrate(unsettled.text, unsettled.submissionId);
				}
			} catch (error) {
				if (!(error instanceof FlueApiError && error.status === 404)) {
					turns = [
						{
							role: 'Error',
							text: error instanceof Error ? error.message : 'Unable to restore this conversation.',
						},
					];
					await paint('restore');
					return;
				}
			}
			fresh = visible.length === 0 && !unsettled;
			turns = [
				{
					role: 'Socratink',
					text: r1OpeningMessage,
				},
				...visible,
			];
			await paint(fresh ? 'opening' : 'restore');
		} finally {
			applyRequestControls(requestState);
			focusAfterRequestPaint(requestState);
		}
		if (unsettled) await runRequestCommand(requests.recheck());
		if (fresh) await startRequest(r1OpeningKickoff);
	}

	void restoreConversation();
}

function requireElement<T extends Element>(selector: string, root: ParentNode = document): T {
	const node = root.querySelector<T>(selector);
	if (!node) throw new Error('Socratink chat markup is missing required nodes.');
	return node;
}

function queryChatSurface(): ChatSurfaceElements {
	const form = requireElement<HTMLFormElement>('#chat');
	const lockup = requireElement<HTMLButtonElement>('#menu-trigger');
	const canvas = lockup.closest<HTMLElement>('.app-canvas');
	if (!canvas) throw new Error('Socratink chat markup is missing required nodes.');
	return {
		form,
		input: requireElement<HTMLTextAreaElement>('#message'),
		messages: requireElement<HTMLOListElement>('#messages'),
		button: requireElement<HTMLButtonElement>('button', form),
		core: requireElement<HTMLButtonElement>('.alive-core'),
		lockup,
		canvas,
		startOver: requireElement<HTMLButtonElement>('#start-over'),
		card: requireElement<HTMLElement>('.active-node'),
		activeTurn: requireElement<HTMLElement>('#active-turn'),
		peekHandle: requireElement<HTMLButtonElement>('#peek-handle'),
		menuLayer: requireElement<HTMLElement>('#menu-layer'),
		menuPanel: requireElement<HTMLElement>('#menu-dialog'),
		menuHandle: requireElement<HTMLElement>('#menu-handle'),
		menuBackdrop: requireElement<HTMLButtonElement>('#menu-backdrop'),
		menuFirst: requireElement<HTMLElement>('.menu-orbs a, .menu-orbs button'),
		trailToggle: requireElement<HTMLButtonElement>('#trail-toggle'),
		trailLabel: requireElement<HTMLElement>('#trail-toggle-label'),
		appearance: requireElement<HTMLButtonElement>('#appearance-toggle'),
		typeSize: requireElement<HTMLButtonElement>('#type-size-toggle'),
	};
}

import { FlueApiError } from '@flue/sdk';
import {
	chatTurnErrorMessage,
	openChatConversation,
	sendChatTurn,
	startNewChatConversation,
} from './client/conversation.ts';
import { r1OpeningMessage, r1StartingPaths } from '../config/r1-learning.ts';
import { initAppearance, toggleAppearance } from './theme.ts';
import { pendingWordAt, pendingWords } from './pending-words.ts';
import { attachTranscriptScroll } from './transcript-scroll.ts';
import {
	createQuestionnaire,
	createQuestionnaireSummary,
	questionnaireFromParts,
	questionnaireFromReplyData,
} from './questionnaire.ts';
import type { QuestionnaireDefinition } from '../questionnaire.ts';

type ChatMessageRole = 'Socratink' | 'You' | 'Assistant' | 'Error';

type DisplayedTurn = {
	role: ChatMessageRole;
	text: string;
	questionnaire?: QuestionnaireDefinition;
};

type PaintKind = 'opening' | 'restore' | 'new-turn' | 'hold';

type ChatSurfaceElements = {
	form: HTMLFormElement;
	input: HTMLTextAreaElement;
	messages: HTMLOListElement;
	button: HTMLButtonElement;
	core: HTMLElement;
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
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const drawerCloseRatio = 0.25;
const drawerFlickVelocity = 0.4;
const peekOpenDistance = 48;
const pendingWordIntervalMs = 4000;

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
	} = elements;
	let working = false;
	let menuOpen = false;
	let trailOpen = false;
	let hasEntered = false;
	let turns: DisplayedTurn[] = [];
	const transcript = attachTranscriptScroll(card);

	function wait(ms: number) {
		return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
	}

	function displayLabel(role: ChatMessageRole): string {
		switch (role) {
			case 'Assistant':
				return 'Socratink';
			case 'Socratink':
			case 'You':
			case 'Error':
				return role;
			default: {
				const exhaustive: never = role;
				return exhaustive;
			}
		}
	}

	function createLabeledBody(
		role: ChatMessageRole,
		text: string,
		questionnaire?: QuestionnaireDefinition,
	) {
		const label = document.createElement('span');
		label.className = 'turn-label';
		label.textContent = displayLabel(role);
		const body = document.createElement('p');
		body.textContent = text;
		if (!text) body.hidden = true;
		return { label, body, questionnaire };
	}

	function createHistoryItem(
		role: ChatMessageRole,
		text: string,
		questionnaire?: QuestionnaireDefinition,
	) {
		const item = document.createElement('li');
		item.className = role.toLowerCase();
		const labeled = createLabeledBody(role, text, questionnaire);
		const { label, body } = labeled;
		item.append(label, body);
		if (labeled.questionnaire) item.append(createQuestionnaireSummary(labeled.questionnaire));
		return item;
	}

	function createActiveTurn(
		role: ChatMessageRole,
		text: string,
		questionnaire?: QuestionnaireDefinition,
		{ announce = false, stagger = false } = {},
	) {
		const wrap = document.createElement('div');
		wrap.className = `turn ${role.toLowerCase()}`;
		if (announce) wrap.setAttribute('aria-live', 'polite');
		if (stagger) wrap.classList.add('stagger-item');
		const labeled = createLabeledBody(role, text, questionnaire);
		const { label, body } = labeled;
		wrap.append(label, body);
		if (labeled.questionnaire && role === 'Assistant') {
			wrap.append(createQuestionnaire(labeled.questionnaire, (answer) => void sendMessage(answer)));
		}
		return wrap;
	}

	function createPendingTurn() {
		let index = Math.floor(Math.random() * pendingWords.length);
		const wrap = document.createElement('div');
		wrap.className = 'turn pending';
		wrap.setAttribute('aria-live', 'polite');
		wrap.setAttribute('aria-label', 'Waiting for a reply');
		const body = document.createElement('p');
		const dot = document.createElement('span');
		dot.className = 'pending-dot';
		dot.setAttribute('aria-hidden', 'true');
		const label = document.createElement('span');
		label.className = 'pending-word is-shimmering';
		label.setAttribute('aria-hidden', 'true');
		label.textContent = pendingWordAt(index);
		body.append(dot, label);
		wrap.append(body);
		const timer = window.setInterval(() => {
			index = (index + 1) % pendingWords.length;
			label.textContent = pendingWordAt(index);
			label.classList.remove('is-shimmering');
			requestAnimationFrame(() => {
				if (wrap.isConnected) label.classList.add('is-shimmering');
			});
		}, pendingWordIntervalMs);
		const observer = new MutationObserver(() => {
			if (wrap.isConnected) return;
			window.clearInterval(timer);
			observer.disconnect();
		});
		observer.observe(activeTurn, { childList: true });
		return wrap;
	}

	function isFreshOpening(items: DisplayedTurn[]): boolean {
		const opening = items[0];
		return (
			items.length === 1 && opening?.role === 'Socratink' && opening.text === r1OpeningMessage
		);
	}

	function closesBeat(role: ChatMessageRole): boolean {
		return role === 'Assistant' || role === 'Error';
	}

	function splitCurrent(items: DisplayedTurn[]): { earlier: DisplayedTurn[]; current: DisplayedTurn[] } {
		const lastReply = items.findLastIndex((item) => closesBeat(item.role));
		if (lastReply < 0) return { earlier: [], current: items };
		const start =
			lastReply > 0 && items[lastReply - 1]?.role === 'You' ? lastReply - 1 : lastReply;
		return { earlier: items.slice(0, start), current: items.slice(start) };
	}

	function visibleTurnsFromHistory(
		history: Awaited<ReturnType<typeof conversation.history>>,
	): DisplayedTurn[] {
		const visible: DisplayedTurn[] = [];
		for (const message of history.messages) {
			if (message.display !== 'visible' || (message.role !== 'user' && message.role !== 'assistant')) {
				continue;
			}
			const text = message.parts
				.filter((part) => part.type === 'text')
				.map((part) => part.text)
				.join('\n\n');
			const questionnaire =
				message.role === 'assistant' ? questionnaireFromParts(message.parts) : undefined;
			if (!text && !questionnaire) continue;
			visible.push({
				role: message.role === 'user' ? 'You' : 'Assistant',
				text,
				...(questionnaire ? { questionnaire } : {}),
			});
		}
		return visible;
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

	function bindSheetHandle(handle: HTMLElement, { openOnDown = false } = {}) {
		if (reduceMotion) return;
		let dragging = false;
		let startY = 0;
		let lastY = 0;
		let lastT = 0;
		let velocity = 0;

		handle.addEventListener('pointerdown', (event) => {
			if (event.button !== 0) return;
			if (!openOnDown && !menuOpen) return;
			if (openOnDown && menuOpen) return;
			dragging = true;
			startY = event.clientY;
			lastY = event.clientY;
			lastT = performance.now();
			velocity = 0;
			if (menuOpen) menuPanel.classList.add('is-dragging');
			handle.setPointerCapture(event.pointerId);
		});

		handle.addEventListener('pointermove', (event) => {
			if (!dragging) return;
			const now = performance.now();
			const dy = event.clientY - startY;
			if (menuOpen) {
				const offset = dy < 0 ? dy : dy * 0.15;
				menuPanel.style.transform = `translate3d(0, ${offset}px, 0)`;
			}
			velocity = (event.clientY - lastY) / Math.max(now - lastT, 1);
			lastY = event.clientY;
			lastT = now;
		});

		function finishDrag() {
			if (!dragging) return;
			dragging = false;
			menuPanel.classList.remove('is-dragging');
			const dy = lastY - startY;
			if (openOnDown) {
				if (dy > peekOpenDistance || velocity > drawerFlickVelocity) setMenuOpen(true);
				return;
			}
			const height = menuPanel.getBoundingClientRect().height;
			const shouldClose = dy < -height * drawerCloseRatio || velocity < -drawerFlickVelocity;
			if (shouldClose) {
				setMenuOpen(false);
				return;
			}
			menuPanel.style.transform = '';
		}

		handle.addEventListener('pointerup', finishDrag);
		handle.addEventListener('pointercancel', finishDrag);
	}

	function addStartingChoices(opening: HTMLElement) {
		const questionnaire = {
			kind: 'question',
			submitLabel: 'Start',
			items: [
				{
					name: 'starting-path',
					prompt: 'How would you like to start?',
					required: true,
					multiple: false,
					choices: r1StartingPaths.map((path, index) => ({
						value: path.message,
						label: path.label,
						shortcut: String(index + 1),
					})),
				},
			],
		} satisfies QuestionnaireDefinition;
		opening.append(
			createQuestionnaire(questionnaire, (_message, answers) => {
				const selectedPath = answers[0]?.values[0];
				if (selectedPath) void sendMessage(selectedPath);
			}),
		);
	}

	async function paint(kind: PaintKind) {
		const render = async () => {
			const { earlier, current } = splitCurrent(turns);
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
					return createActiveTurn(item.role, item.text, item.questionnaire, {
						announce: kind === 'hold' && isLast,
						stagger: kind === 'hold' && hasEntered && !reduceMotion && isLast,
					});
				}),
			);
			if (kind === 'new-turn' && current.at(-1)?.role === 'You') {
				activeTurn.append(createPendingTurn());
			}
			if (kind === 'new-turn' || kind === 'hold') hasEntered = true;
			document.body.classList.toggle('encounter-active', turns.length > 1);

			if (isFreshOpening(turns)) {
				const opening = activeTurn.querySelector<HTMLElement>(':scope > .turn');
				if (opening) addStartingChoices(opening);
			}
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

	initAppearance(appearance);
	startOver.addEventListener('click', startNewChatConversation);
	appearance.addEventListener('click', () => toggleAppearance(appearance));
	lockup.addEventListener('click', () => setMenuOpen(!menuOpen));
	peekHandle.addEventListener('click', () => {
		if (!menuOpen) setMenuOpen(true);
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
		if (working) return;
		setWorking(true);
		turns = [...turns, { role: 'You', text }];
		input.value = '';
		await paint('new-turn');

		try {
			const reply = await sendChatTurn(conversation, text);
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
		} catch (error) {
			turns = [
				...turns,
				{
					role: 'Error',
					text: chatTurnErrorMessage(error),
				},
			];
			await paint('hold');
		} finally {
			setWorking(false);
			input.focus();
		}
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const text = input.value.trim();
		if (!text || working) return;
		await sendMessage(text);
	});

	async function restoreConversation() {
		if (working) return;
		setWorking(true);
		try {
			let visible: DisplayedTurn[] = [];
			try {
				visible = visibleTurnsFromHistory(await conversation.history());
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
			turns = [{ role: 'Socratink', text: r1OpeningMessage }, ...visible];
			await paint(isFreshOpening(turns) ? 'opening' : 'restore');
		} finally {
			setWorking(false);
			input.focus();
		}
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
		core: requireElement<HTMLElement>('.alive-core'),
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
	};
}

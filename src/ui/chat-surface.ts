import { FlueApiError } from '@flue/sdk';
import { openChatConversation, startNewChatConversation } from './client/conversation.ts';
import { r1OpeningMessage, r1StartingPaths } from '../config/r1-learning.ts';
import { initAppearance, toggleAppearance } from './theme.ts';

type ChatMessageRole = 'Socratink' | 'You' | 'Assistant' | 'Error';

type DisplayedTurn = {
	role: ChatMessageRole;
	text: string;
};

type PaintOptions = {
	live?: boolean;
	exit?: boolean;
};

type ChatSurfaceElements = {
	form: HTMLFormElement;
	input: HTMLTextAreaElement;
	messages: HTMLOListElement;
	button: HTMLButtonElement;
	core: HTMLElement;
	lockup: HTMLButtonElement;
	canvas: HTMLElement;
	startOver: HTMLButtonElement;
	activeTurn: HTMLElement;
	activeNode: HTMLElement;
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
		activeTurn,
		activeNode,
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

	function wait(ms: number) {
		return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
	}

	function createLabeledBody(role: ChatMessageRole, text: string) {
		const label = document.createElement('span');
		label.textContent = role;
		const body = document.createElement('p');
		body.textContent = text;
		return { label, body };
	}

	function createHistoryItem(role: ChatMessageRole, text: string) {
		const item = document.createElement('li');
		item.className = role.toLowerCase();
		const { label, body } = createLabeledBody(role, text);
		item.append(label, body);
		return item;
	}

	function createActiveTurn(
		role: ChatMessageRole,
		text: string,
		{ announce = false, stagger = false } = {},
	) {
		const wrap = document.createElement('div');
		wrap.className = `turn ${role.toLowerCase()}`;
		if (announce) wrap.setAttribute('aria-live', 'polite');
		if (stagger) wrap.classList.add('stagger-item');
		const { label, body } = createLabeledBody(role, text);
		wrap.append(label, body);
		return wrap;
	}

	function isFreshOpening(items: DisplayedTurn[]): boolean {
		const opening = items[0];
		return (
			items.length === 1 && opening?.role === 'Socratink' && opening.text === r1OpeningMessage
		);
	}

	function splitCurrent(items: DisplayedTurn[]): { earlier: DisplayedTurn[]; current: DisplayedTurn[] } {
		if (items.length === 0) return { earlier: [], current: [] };
		const last = items.at(-1);
		const previous = items.at(-2);
		if (
			last &&
			previous &&
			(last.role === 'Assistant' || last.role === 'Error') &&
			previous.role === 'You'
		) {
			return { earlier: items.slice(0, -2), current: items.slice(-2) };
		}
		return { earlier: items.slice(0, -1), current: items.slice(-1) };
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
			if (!text) continue;
			visible.push({ role: message.role === 'user' ? 'You' : 'Assistant', text });
		}
		return visible;
	}

	function setTrailOpen(open: boolean) {
		trailOpen = open && messages.childElementCount > 0;
		trailToggle.setAttribute('aria-expanded', String(trailOpen));
		messages.hidden = !trailOpen;
	}

	function syncTrail() {
		const count = messages.childElementCount;
		trailToggle.hidden = count === 0;
		trailLabel.textContent = count === 1 ? '1 earlier step' : `${count} earlier steps`;
		if (count === 0) {
			setTrailOpen(false);
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
		const choices = document.createElement('div');
		choices.className = 'learning-paths';
		for (const path of r1StartingPaths) {
			const choice = document.createElement('button');
			choice.type = 'button';
			choice.textContent = path.label;
			choice.addEventListener('click', () => {
				choices.remove();
				void sendMessage(path.message);
			});
			choices.append(choice);
		}
		opening.append(choices);
	}

	async function paint({ live = false, exit = false }: PaintOptions = {}) {
		const { earlier, current } = splitCurrent(turns);
		messages.replaceChildren(...earlier.map((item) => createHistoryItem(item.role, item.text)));
		syncTrail();

		if (exit && hasEntered && !reduceMotion && activeTurn.childElementCount > 0) {
			activeTurn.classList.add('is-exiting');
			await wait(150);
			activeTurn.classList.remove('is-exiting');
		}

		const motion = live && hasEntered && !reduceMotion;
		activeTurn.replaceChildren(
			...current.map((item, index) => {
				const isLast = index === current.length - 1;
				return createActiveTurn(item.role, item.text, {
					announce: live && (exit || isLast),
					stagger: motion && (exit || isLast),
				});
			}),
		);
		if (live) hasEntered = true;
		document.body.classList.toggle('encounter-active', turns.length > 1);

		if (isFreshOpening(turns)) {
			const opening = activeTurn.querySelector<HTMLElement>(':scope > .turn');
			if (opening) addStartingChoices(opening);
		}
		activeNode.scrollTop = activeNode.scrollHeight;
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
		await paint({ live: true, exit: true });

		try {
			const admission = await conversation.send({ message: { kind: 'user', body: text } });
			const reply = await conversation.read(admission);
			turns = [...turns, { role: 'Assistant', text: reply.text }];
			await paint({ live: true });
		} catch (error) {
			turns = [
				...turns,
				{
					role: 'Error',
					text: error instanceof Error ? error.message : 'Unable to get a reply.',
				},
			];
			await paint({ live: true });
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
					await paint();
					return;
				}
			}
			turns = [{ role: 'Socratink', text: r1OpeningMessage }, ...visible];
			await paint();
		} finally {
			setWorking(false);
			input.focus();
		}
	}

	void restoreConversation();
}

function queryChatSurface(): ChatSurfaceElements {
	const form = document.querySelector<HTMLFormElement>('#chat');
	const input = document.querySelector<HTMLTextAreaElement>('#message');
	const messages = document.querySelector<HTMLOListElement>('#messages');
	const button = form?.querySelector<HTMLButtonElement>('button');
	const core = document.querySelector<HTMLElement>('.alive-core');
	const lockup = document.querySelector<HTMLButtonElement>('#menu-trigger');
	const startOver = document.querySelector<HTMLButtonElement>('#start-over');
	const activeTurn = document.querySelector<HTMLElement>('#active-turn');
	const activeNode = document.querySelector<HTMLElement>('.active-node');
	const peekHandle = document.querySelector<HTMLButtonElement>('#peek-handle');
	const menuLayer = document.querySelector<HTMLElement>('#menu-layer');
	const menuPanel = document.querySelector<HTMLElement>('#menu-dialog');
	const menuHandle = document.querySelector<HTMLElement>('#menu-handle');
	const menuBackdrop = document.querySelector<HTMLButtonElement>('#menu-backdrop');
	const menuFirst = document.querySelector<HTMLElement>('.menu-orbs a, .menu-orbs button');
	const trailToggle = document.querySelector<HTMLButtonElement>('#trail-toggle');
	const trailLabel = document.querySelector<HTMLElement>('#trail-toggle-label');
	const appearance = document.querySelector<HTMLButtonElement>('#appearance-toggle');
	const canvas = lockup?.closest<HTMLElement>('.app-canvas');
	if (
		!form ||
		!input ||
		!messages ||
		!button ||
		!core ||
		!lockup ||
		!canvas ||
		!startOver ||
		!activeTurn ||
		!activeNode ||
		!peekHandle ||
		!menuLayer ||
		!menuPanel ||
		!menuHandle ||
		!menuBackdrop ||
		!menuFirst ||
		!trailToggle ||
		!trailLabel ||
		!appearance
	) {
		throw new Error('Socratink chat markup is missing required nodes.');
	}
	return {
		form,
		input,
		messages,
		button,
		core,
		lockup,
		canvas,
		startOver,
		activeTurn,
		activeNode,
		peekHandle,
		menuLayer,
		menuPanel,
		menuHandle,
		menuBackdrop,
		menuFirst,
		trailToggle,
		trailLabel,
		appearance,
	};
}

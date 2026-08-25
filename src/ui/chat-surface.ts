import { FlueApiError } from '@flue/sdk';
import { openChatConversation, startNewChatConversation } from './client/conversation.ts';
import { r1OpeningMessage, r1StartingPaths } from '../config/r1-learning.ts';

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
	lockup: HTMLElement;
	startOver: HTMLButtonElement;
	activeTurn: HTMLElement;
	activeNode: HTMLElement;
	earlierTab: HTMLButtonElement;
	earlierLabel: HTMLElement;
	earlierLayer: HTMLElement;
	earlierClose: HTMLButtonElement;
	earlierBackdrop: HTMLButtonElement;
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountChatSurface(elements: ChatSurfaceElements = queryChatSurface()): void {
	const conversation = openChatConversation();
	const {
		form,
		input,
		messages,
		button,
		core,
		lockup,
		startOver,
		activeTurn,
		activeNode,
		earlierTab,
		earlierLabel,
		earlierLayer,
		earlierClose,
		earlierBackdrop,
	} = elements;
	let working = false;
	let earlierOpen = false;
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

	function syncEarlierTrigger() {
		const count = messages.childElementCount;
		earlierTab.hidden = count === 0;
		earlierLabel.hidden = count === 0;
		earlierLabel.textContent = count === 0 ? '' : String(count);
		if (count === 0) setEarlierOpen(false);
	}

	function setEarlierOpen(open: boolean) {
		if (open && earlierTab.hidden) return;
		if (earlierOpen === open) return;
		earlierOpen = open;
		earlierLayer.classList.toggle('is-open', open);
		earlierLayer.setAttribute('aria-hidden', String(!open));
		earlierTab.setAttribute('aria-expanded', String(open));
		earlierLayer.inert = !open;
		if (open) earlierClose.focus();
		else if (!earlierTab.hidden) earlierTab.focus();
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
		syncEarlierTrigger();

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

	startOver.addEventListener('click', startNewChatConversation);
	earlierTab.addEventListener('click', () => setEarlierOpen(!earlierOpen));
	earlierClose.addEventListener('click', () => setEarlierOpen(false));
	earlierBackdrop.addEventListener('click', () => setEarlierOpen(false));
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && earlierOpen) {
			event.preventDefault();
			setEarlierOpen(false);
		}
	});
	earlierLayer.inert = true;

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
	const lockup = document.querySelector<HTMLElement>('.brand-lockup');
	const startOver = document.querySelector<HTMLButtonElement>('#start-over');
	const activeTurn = document.querySelector<HTMLElement>('#active-turn');
	const activeNode = document.querySelector<HTMLElement>('.active-node');
	const earlierTab = document.querySelector<HTMLButtonElement>('#history-tab');
	const earlierLabel = document.querySelector<HTMLElement>('#history-tab-label');
	const earlierLayer = document.querySelector<HTMLElement>('#earlier-layer');
	const earlierClose = document.querySelector<HTMLButtonElement>('#earlier-close');
	const earlierBackdrop = document.querySelector<HTMLButtonElement>('#earlier-backdrop');
	if (
		!form ||
		!input ||
		!messages ||
		!button ||
		!core ||
		!lockup ||
		!startOver ||
		!activeTurn ||
		!activeNode ||
		!earlierTab ||
		!earlierLabel ||
		!earlierLayer ||
		!earlierClose ||
		!earlierBackdrop
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
		startOver,
		activeTurn,
		activeNode,
		earlierTab,
		earlierLabel,
		earlierLayer,
		earlierClose,
		earlierBackdrop,
	};
}

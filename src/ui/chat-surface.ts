/**
 * Existing Socratink chat surface.
 *
 * Purpose: render messages, accept input, and show working/ready state.
 * Inputs: the current page's chat DOM nodes and a Flue conversation client.
 * Outputs: the same conversation behavior as the previous inline main.ts.
 * Constraints: render the existing chat surface only.
 */
import { openChatConversation } from './client/conversation.ts';

type ChatSurfaceElements = {
	form: HTMLFormElement;
	input: HTMLTextAreaElement;
	messages: HTMLOListElement;
	button: HTMLButtonElement;
	core: HTMLElement;
	card: HTMLElement;
	lockup: HTMLElement;
};

export function mountChatSurface(elements: ChatSurfaceElements = queryChatSurface()): void {
	const conversation = openChatConversation();
	const { form, input, messages, button, core, card, lockup } = elements;

	function addMessage(role: string, text: string) {
		const item = document.createElement('li');
		item.className = role.toLowerCase();
		const label = document.createElement('span');
		label.textContent = role;
		const body = document.createElement('p');
		body.textContent = text;
		item.append(label, body);
		messages.append(item);
		card.classList.add('has-messages');
		messages.scrollTop = messages.scrollHeight;
	}

	function setWorking(working: boolean) {
		button.disabled = working;
		core.classList.toggle('is-working', working);
		lockup.classList.toggle('is-working', working);
		if (working) document.body.classList.add('encounter-active');
	}

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			form.requestSubmit();
		}
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const text = input.value.trim();
		if (!text) return;

		addMessage('You', text);
		input.value = '';
		setWorking(true);

		try {
			const admission = await conversation.send({ message: { kind: 'user', body: text } });
			const reply = await conversation.read(admission);
			addMessage('Assistant', reply.text);
		} catch (error) {
			addMessage('Error', error instanceof Error ? error.message : 'Unable to get a reply.');
		} finally {
			setWorking(false);
			input.focus();
		}
	});
}

function queryChatSurface(): ChatSurfaceElements {
	const form = document.querySelector<HTMLFormElement>('#chat');
	const input = document.querySelector<HTMLTextAreaElement>('#message');
	const messages = document.querySelector<HTMLOListElement>('#messages');
	const button = form?.querySelector<HTMLButtonElement>('button');
	const core = document.querySelector<HTMLElement>('.alive-core');
	const card = document.querySelector<HTMLElement>('.thought-card');
	const lockup = document.querySelector<HTMLElement>('.brand-lockup');
	if (!form || !input || !messages || !button || !core || !card || !lockup) {
		throw new Error('Socratink chat markup is missing required nodes.');
	}
	return { form, input, messages, button, core, card, lockup };
}

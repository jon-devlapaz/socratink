import { createFlueClient } from '@flue/sdk';
import { mountOrganicSphere } from './organic-sphere.ts';
import './styles.css';

const form = document.querySelector<HTMLFormElement>('#chat')!;
const input = document.querySelector<HTMLTextAreaElement>('#message')!;
const messages = document.querySelector<HTMLOListElement>('#messages')!;
const button = form.querySelector<HTMLButtonElement>('button')!;
const core = document.querySelector<HTMLElement>('.alive-core')!;
const card = document.querySelector<HTMLElement>('.thought-card')!;
mountOrganicSphere(core);
const storageKey = 'vanilla-flue-chat-conversation-id';
const conversationId = localStorage.getItem(storageKey) ?? crypto.randomUUID();

localStorage.setItem(storageKey, conversationId);

const conversation = createFlueClient({
	url: `/api/agents/chat/${encodeURIComponent(conversationId)}`,
});

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

	document.body.classList.add('encounter-active');
	addMessage('You', text);
	input.value = '';
	button.disabled = true;
	core.classList.add('is-working');

	try {
		const admission = await conversation.send({ message: { kind: 'user', body: text } });
		const reply = await conversation.read(admission);
		addMessage('Assistant', reply.text);
	} catch (error) {
		addMessage('Error', error instanceof Error ? error.message : 'Unable to get a reply.');
	} finally {
		button.disabled = false;
		core.classList.remove('is-working');
		input.focus();
	}
});

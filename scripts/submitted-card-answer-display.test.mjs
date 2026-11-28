import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { appConfig } from '../src/config/app.config.ts';
import { questionnaireFromPresentQuestion } from '../src/questionnaire.ts';

const userId = 'synthetic-guest';
const conversationId = `${userId}:seasons`;
const path = `${appConfig.chatAgentPath}/${encodeURIComponent(conversationId)}`;
const prompt = 'What causes the seasons?';
const choice = "Earth's rotational axis is tilted relative to its orbital plane, changing sunlight angle and day length";
const reasoning = 'The tilt changes the angle of sunlight and day length through the year, so seasons change even though distance to the Sun barely changes.';
const joined = `${choice}, ${reasoning}`;
const labelled = [`Choice: ${choice}`, `Reasoning: ${reasoning}`];
const cardBody = (answer) => `Questionnaire answers:\n- ${prompt}: ${answer}`;
const input = (body) => ({ kind: 'user', body });
const card = questionnaireFromPresentQuestion({ prompt, choices: [choice, 'Earth moves much closer to the Sun'], reasoning: true });
const active = '#active-turn .turn.you';
const earlier = '#messages .history-turn.you';

const query = (selector) => document.querySelector(selector);
const paragraphs = (selector) => [...document.querySelectorAll(`${selector} > p`)].map((p) => p.textContent);
const reply = (id) => `Recorded reply ${id}`;

function serveChat({ rejectFirst = false } = {}) {
	const sent = [];
	const messages = [{ role: 'assistant', display: 'visible', submissionId: 'question', parts: [{ type: 'data-questionnaire', data: card }] }];
	const settlements = [];
	globalThis.fetch = async (url, options) => {
		if (url === path && options.method === 'POST') {
			const request = JSON.parse(options.body);
			sent.push(request);
			if (rejectFirst && sent.length === 1) {
				return Response.json({ error: { type: 'rejected', message: 'Admission rejected.' } }, { status: 400 });
			}
			const submissionId = String(sent.length);
			for (const [role, text] of [['user', request.body], ['assistant', reply(submissionId)]]) {
				messages.push({ role, display: 'visible', submissionId, parts: [{ type: 'text', text }] });
			}
			settlements.push({ submissionId, outcome: 'completed' });
			return Response.json({ submissionId }, { status: 202 });
		}
		const snapshot = { v: 1, conversationId, messages, settlements };
		if (url === path) return Response.json(snapshot);
		assert.equal(url, `${path}/events`, 'only fixture requests are allowed');
		const frame = { type: 'conversation-reset', conversationId, snapshot, position: { batch: 0, index: 0 } };
		return new Response(`data: ${JSON.stringify(frame)}\n\n`, { headers: { 'content-type': 'text/event-stream' } });
	};
	return sent;
}

test('submitted card answers in the production transcript', async (t) => {
	const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost', pretendToBeVisual: true });
	const originalFetch = globalThis.fetch;
	const { window } = dom;
	for (const key of ['window', 'document', 'HTMLElement', 'HTMLFormElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'Element', 'Node', 'NodeFilter', 'MutationObserver', 'CustomEvent', 'Event', 'MouseEvent', 'KeyboardEvent', 'localStorage', 'sessionStorage', 'getComputedStyle']) {
		Object.defineProperty(globalThis, key, { configurable: true, value: key === 'getComputedStyle' ? window[key].bind(window) : window[key] });
	}
	window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
	globalThis.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
	globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
	globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
	globalThis.IS_REACT_ACT_ENVIRONMENT = true;
	const { createElement, act } = await import('react');
	const { createRoot } = await import('react-dom/client');
	const server = await createServer({ root: resolve('src/ui'), configFile: false, resolve: { alias: { '@': resolve('src/ui') } }, server: { middlewareMode: true, watch: null, hmr: false }, appType: 'custom' });
	t.after(async () => {
		globalThis.fetch = originalFetch;
		await server.close();
		window.close();
	});
	const { ChatPage } = await server.ssrLoadModule('/chat-page.tsx');
	const { mountChatSurface } = await server.ssrLoadModule('/chat-surface.tsx');
	const user = { userId, aliases: [], kind: 'guest' };
	const startChat = async (onStartOverDisabledChange, onTranscriptChange) => ({
		...mountChatSurface({ ...user, onStartOverDisabledChange, onTranscriptChange }), user,
	});

	async function withChat(run) {
		localStorage.clear();
		sessionStorage.clear();
		localStorage.setItem(appConfig.chatConversationStorageKey, conversationId);
		const root = createRoot(query('#root'));
		try {
			await act(async () => root.render(createElement(ChatPage, { startChat })));
			await run();
		} finally {
			await act(async () => root.unmount());
		}
	}
	async function click(selector) {
		const button = query(selector);
		assert.ok(button, selector);
		await act(async () => button.click());
	}
	async function type(selector, value) {
		const field = query(selector);
		assert.ok(field, selector);
		await act(async () => {
			Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(field, value);
			field.dispatchEvent(new window.Event('input', { bubbles: true }));
		});
	}
	async function submitCard({ pick = true, words = reasoning } = {}) {
		assert.equal(query('.questionnaire legend')?.textContent, prompt);
		if (pick) await click('.questionnaire [role="radio"]');
		if (words) await type('.questionnaire textarea', words);
		await click('.questionnaire button[type="submit"]');
	}
	function assertReply(id) {
		assert.ok(query('#active-turn .turn.assistant')?.textContent.includes(reply(id)), `settled reply ${id}`);
	}

	await t.test('combined answer keeps both parts in the active turn and Earlier steps', async () => {
		const sent = serveChat();
		await withChat(async () => {
			await submitCard();
			assertReply(1);
			assert.deepEqual(sent, [input(cardBody(joined))]);
			assert.deepEqual(paragraphs(active), labelled, 'show the original choice and reasoning in separate paragraphs');

			const ordinary = 'My own explanation, with a comma.';
			await type('#message', ordinary);
			await click('#chat button[type="submit"]');
			assertReply(2);
			assert.deepEqual(sent, [input(cardBody(joined)), input(ordinary)]);
			assert.deepEqual(paragraphs(active), [ordinary]);
			await click('#trail-toggle');
			assert.equal(query('#messages').hidden, false);
			assert.deepEqual(paragraphs(earlier), labelled);
		});
	});

	await t.test('remount from text-only history does not infer parts', async () => {
		const sent = serveChat();
		await withChat(async () => { await submitCard(); assertReply(1); });
		await withChat(() => {
			assertReply(1);
			assert.deepEqual(paragraphs(active), [joined]);
			assert.deepEqual(sent, [input(cardBody(joined))]);
		});
	});

	for (const [name, fields, answer] of [
		['reasoning alone can be identical to the joined answer', { pick: false, words: joined }, joined],
		['choice alone stays plain', { words: '' }, choice],
	]) {
		await t.test(name, async () => {
			const sent = serveChat();
			await withChat(async () => {
				await submitCard(fields);
				assertReply(1);
				assert.deepEqual(sent, [input(cardBody(answer))]);
				assert.deepEqual(paragraphs(active), [answer]);
			});
		});
	}

	for (const edit of [undefined, 'My own explanation.']) {
		await t.test(edit ? 'an edited retry drops the original parts' : 'an unchanged retry keeps the original parts', async () => {
			const sent = serveChat({ rejectFirst: true });
			await withChat(async () => {
				await submitCard();
				const retry = '#active-turn .not-admitted .request-action';
				assert.equal(query(retry)?.textContent, 'Retry');
				if (edit) await type('#message', edit);
				await click(retry);
				assertReply(2);
				assert.deepEqual(sent, [input(cardBody(joined)), input(edit ?? cardBody(joined))]);
				assert.deepEqual(paragraphs(active), edit ? [edit] : labelled);
			});
		});
	}
});

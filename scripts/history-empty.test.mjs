import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost', pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'Element', 'Node', 'NodeFilter', 'MutationObserver', 'CustomEvent', 'Event', 'MouseEvent', 'KeyboardEvent', 'localStorage', 'sessionStorage', 'getComputedStyle']) {
	Object.defineProperty(globalThis, key, { configurable: true, value: typeof dom.window[key] === 'function' && key === 'getComputedStyle' ? dom.window[key].bind(dom.window) : dom.window[key] });
}
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
globalThis.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
window.HTMLElement.prototype.scrollTo = function () {};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement, act } = await import('react');
const { createRoot } = await import('react-dom/client');

function assertEmpty(view) {
	assert.equal(view.querySelector('h2')?.textContent, 'No conversations yet');
	assert.deepEqual([...view.querySelectorAll('[data-slot="dialog-description"]')].map((p) => p.textContent), ['Your conversations appear here after you send a message.']);
	assertStart(view);
}
function assertStart(view) {
	const primary = view.querySelectorAll('button[data-variant="default"]');
	assert.equal(primary.length, 1, 'one primary start action');
	assert.equal(primary[0].textContent, 'Start a conversation');
}
const query = (selector) => document.querySelector(selector);
async function settle() { await act(async () => { await new Promise((done) => setTimeout(done, 30)); }); }
async function click(selector) {
	assert.ok(query(selector), selector);
	await act(async () => query(selector).click());
	await settle();
}

test('History through the production caller and chat surface', async (t) => {
	const server = await createServer({ root: resolve('src/ui'), configFile: false, resolve: { alias: { '@': resolve('src/ui') } }, server: { middlewareMode: true, watch: null, hmr: false }, appType: 'custom' });
	try {
		const { ChatPage } = await server.ssrLoadModule('/chat-page.tsx');
		const { mountChatSurface } = await server.ssrLoadModule('/chat-surface.tsx');
		const { appConfig } = await server.ssrLoadModule('/../config/app.config.ts');
		for (const scenario of ['guest', 'draft', 'registered', 'loading', 'error', 'populated', 'legacy']) {
			await t.test(scenario, async (caseTest) => {
				localStorage.clear();
				const calls = [];
				let resolveList;
				let listMode = scenario;
				const currentId = 'synthetic-learner:conversation';
				localStorage.setItem(appConfig.chatConversationStorageKey, currentId);
				const entries = [{ id: currentId, title: 'Synthetic topic', updatedAt: '2026-11-27T10:00:00Z' }];
				globalThis.fetch = async (url, options) => {
					calls.push([String(url), options?.method ?? 'GET']);
					if (url === appConfig.conversationsPath) {
						if (listMode === 'loading') return new Promise((done) => { resolveList = done; });
						if (listMode === 'error') throw new Error('Synthetic network failure');
						return Response.json({ conversations: listMode === 'populated' ? entries : [] });
					}
					assert.ok(String(url).startsWith(appConfig.chatAgentPath + '/'), String(url));
					return Response.json({ messages: scenario === 'legacy' ? [{ role: 'user', display: 'visible', parts: [{ type: 'text', text: 'Older conversation' }] }] : [], settlements: [] });
				};
				const root = createRoot(query('#root'));
				let session;
				const startChat = async (onStartOverDisabledChange, onTranscriptChange) => {
					session = mountChatSurface({ userId: 'synthetic-learner', aliases: [], onStartOverDisabledChange, onTranscriptChange });
					entries[0].id = session.conversationId;
					return { ...session, user: { userId: 'synthetic-learner', aliases: [], kind: scenario === 'registered' ? 'registered' : 'guest' } };
				};
				try {
					await act(async () => root.render(createElement(ChatPage, { startChat })));
					await settle();
					const input = query('#message');
					if (scenario === 'draft') {
						input.value = 'What is 2 + 2?';
						await act(async () => input.dispatchEvent(new Event('input', { bubbles: true })));
					}
					const learnerStorage = () => Object.fromEntries(Object.entries(localStorage).filter(([key]) => !key.startsWith('socratink-unsent-work:')));
					const storage = learnerStorage();
					const drafts = { ...sessionStorage };
					assert.equal(session.conversationId, currentId);
					const id = session.conversationId;
					await click('#menu-trigger');
					const history = [...document.querySelectorAll('#menu-dialog button')].find((button) => button.textContent.trim() === 'History');
					assert.ok(history);
					await act(async () => history.click());
					await settle();
					if (['loading', 'error', 'populated'].includes(scenario)) {
						assert.equal(query('#history-start'), null);
						assert.doesNotMatch(query('#history-dialog').textContent, /Your conversations appear here after you send a message/);
						assert.notEqual(query('#history-dialog h2').textContent, 'No conversations yet');
						assert.equal(query('#history-guest'), null);
						if (scenario === 'loading') {
							assert.match(query('#history-status').textContent, /Loading/);
							await act(async () => resolveList(Response.json({ conversations: [] })));
							await settle();
							assertEmpty(query('#history-dialog'));
						} else if (scenario === 'error') {
							assert.equal(document.activeElement, query('#history-retry'));
							listMode = 'guest';
							await click('#history-retry');
							assertEmpty(query('#history-dialog'));
						} else {
							assert.match(query('#history-list').textContent, /Synthetic topic.*Open now/);
							await click('#history-list button');
							assert.equal(query('#history-dialog'), null);
							return;
						}
					}
					if (scenario === 'guest') {
						await caseTest.test('exact empty heading', () => assert.equal(query('#history-dialog h2').textContent, 'No conversations yet'));
						await caseTest.test('one primary start action', () => assertStart(query('#history-dialog')));
					}
					assertEmpty(query('#history-dialog'));
					assert.equal(query('#history-close').textContent, scenario === 'legacy' ? 'Back to conversation' : 'Close');
					if (scenario === 'registered') assert.equal(query('#history-guest'), null);
					else {
						assert.equal(query('#history-guest a').getAttribute('href'), '/login.html');
						assert.equal(query('#history-guest').textContent, 'Sign in to keep your History across devices.');
					}
					await click('#history-start');
					assert.equal(query('#history-dialog'), null);
					assert.equal(document.activeElement, input);
					assert.equal(input.value, scenario === 'draft' ? 'What is 2 + 2?' : '');
					assert.equal(session.conversationId, id);
					assert.deepEqual(learnerStorage(), storage);
					assert.deepEqual({ ...sessionStorage }, drafts);
					assert.ok(calls.every(([, method]) => method === 'GET'), 'no reset or submission');
				} finally {
					await act(async () => root.unmount());
				}
			});
		}
	} finally {
		await server.close();
		dom.window.close();
	}
});

test('the former empty view fails the same assertions', () => {
	const fixture = new JSDOM('<div><h2>History</h2><p data-slot="dialog-description">Your conversations. Choose one to open it.</p><p>Your conversations appear here after you send a message.</p><button>Back to conversation</button></div>');
	assert.throws(() => assertEmpty(fixture.window.document), /No conversations yet/);
	assert.throws(() => assertStart(fixture.window.document), /one primary start action/);
	fixture.window.close();
});

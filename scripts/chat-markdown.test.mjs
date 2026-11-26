import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { parseInline, parseMarkdownBlocks, safeHref } from '../src/ui/chat-markdown-parse.ts';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { Markdown } from '../src/ui/chat-markdown.tsx';

// Failures: malformed block detection makes no progress; copy buttons cancel
// each other's reset; an unresolved clipboard write outlives its rendered turn.
test('malformed table-like text terminates and remains readable', () => {
	const moduleUrl = new URL('../src/ui/chat-markdown-parse.ts', import.meta.url).href;
	const source = '| a |\n| --- | --- |';
	const result = spawnSync(process.execPath, ['--input-type=module', '-e',
		`import { parseMarkdownBlocks } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(parseMarkdownBlocks(${JSON.stringify(source)})));`,
	], { encoding: 'utf8', timeout: 1500 });
	assert.equal(result.error, undefined, 'parsing must finish without timing out');
	assert.equal(result.status, 0, result.stderr);
	assert.deepEqual(JSON.parse(result.stdout), [{ type: 'paragraph', text: source }]);
});

test('each code copy control resets independently', async () => {
	await withRenderer(async ({ renderer, timers }) => {
		renderer.update('```js\none\n```\n\n```js\ntwo\n```');
		const buttons = copyButtons(renderer);
		await act(async () => buttons[0].click());
		await act(async () => buttons[1].click());
		assert.deepEqual(buttons.map(button => button.textContent), ['Copied', 'Copied']);
		await act(() => { for (const [id, callback] of [...timers]) { timers.delete(id); callback(); } });
		assert.deepEqual(buttons.map(button => button.textContent), ['Copy', 'Copy']);
	});
});

test('repeated copies reset once and destroyed renderers clear pending resets', async () => {
	await withRenderer(async ({ renderer, timers }) => {
		renderer.update('```\none\n```');
		const [button] = copyButtons(renderer);
		await act(async () => button.click());
		await act(async () => button.click());
		assert.equal(timers.size, 1);
		renderer.destroy();
		assert.equal(timers.size, 0);
	});
});

for (const end of ['destroy', 'update']) {
	test(`a clipboard write resolved after ${end} cannot schedule a stale reset`, async () => {
		let resolveWrite;
		await withRenderer(async ({ renderer, timers }) => {
			renderer.update('```\none\n```');
			const [button] = copyButtons(renderer);
			await act(async () => button.click());
			if (end === 'update') renderer.update('New turn');
			else renderer.destroy();
			await act(async () => resolveWrite());
			assert.equal(timers.size, 0);
			assert.equal(button.textContent, 'Copy');
		}, () => new Promise(resolve => { resolveWrite = resolve; }));
	});
}

test('a rejected clipboard write does not announce a successful copy', async () => {
	await withRenderer(async ({ renderer, timers }) => {
		renderer.update('```\none\n```');
		const [button] = copyButtons(renderer);
		await act(async () => button.click());
		assert.equal(button.textContent, 'Copy');
		assert.equal(timers.size, 0);
	}, () => Promise.reject(new Error('Clipboard unavailable')));
});

function copyButtons(renderer) {
	return [...renderer.element.querySelectorAll('button[aria-label="Copy code"]')];
}

async function withRenderer(run, writeText = async () => {}) {
	const dom = new JSDOM('<div id="root"></div>');
	const { window } = dom;
	const timers = new Map();
	let nextTimer = 0;
	window.setTimeout = callback => { timers.set(++nextTimer, callback); return nextTimer; };
	window.clearTimeout = id => timers.delete(id);
	const replacements = { window, document: window.document, navigator: { clipboard: { writeText } }, IS_REACT_ACT_ENVIRONMENT: true };
	const descriptors = new Map(Object.keys(replacements).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
	for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, value });
	const element = window.document.querySelector('#root');
	const root = createRoot(element);
	let mounted = true;
	const renderer = {
		element,
		update(text) { act(() => root.render(createElement(Markdown, { text }))); },
		destroy() {
			if (mounted) act(() => root.unmount());
			mounted = false;
		},
	};
	try { await run({ renderer, timers }); }
	finally {
		renderer.destroy();
		for (const [key, descriptor] of descriptors) {
			if (descriptor) Object.defineProperty(globalThis, key, descriptor);
			else delete globalThis[key];
		}
		dom.window.close();
	}
}

test('treats raw HTML as paragraph text', () => {
	const [block] = parseMarkdownBlocks('Hello <script>alert(1)</script>');
	assert.equal(block?.type, 'paragraph');
	assert.equal(block?.type === 'paragraph' && block.text, 'Hello <script>alert(1)</script>');
});

test('rejects unsafe hrefs and keeps http(s), mailto, and relative links', () => {
	assert.equal(safeHref('javascript:alert(1)'), undefined);
	assert.equal(safeHref('data:text/html,hi'), undefined);
	assert.equal(safeHref('vbscript:msg'), undefined);
	assert.equal(safeHref('//evil.example'), undefined);
	assert.equal(safeHref('file:///etc/passwd'), undefined);
	assert.equal(safeHref('https://socratink.com/docs'), 'https://socratink.com/docs');
	assert.equal(safeHref('mailto:hello@example.com'), 'mailto:hello@example.com');
	assert.equal(safeHref('#section'), '#section');
	assert.equal(safeHref('/local'), '/local');
});

test('keeps parentheses inside markdown link hrefs', () => {
	const [link] = parseInline('[Wiki](https://en.wikipedia.org/wiki/Foo_(bar))');
	assert.equal(link?.type, 'link');
	assert.equal(link?.type === 'link' && link.href, 'https://en.wikipedia.org/wiki/Foo_(bar)');
});

test('keeps pipes inside inline code and escaped cells', () => {
	const [table] = parseMarkdownBlocks(['| A | B |', '| --- | --- |', '| `x|y` | z \\| w |'].join('\n'));
	assert.equal(table?.type, 'table');
	if (table?.type !== 'table') return;
	assert.deepEqual(table.rows[0], ['`x|y`', 'z | w']);
});

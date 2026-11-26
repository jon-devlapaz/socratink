import assert from 'node:assert/strict';
import test, { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';
import { compactMarkdownText, parseInline, parseMarkdownBlocks, safeHref } from '../src/ui/chat-markdown-parse.ts';
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
	assert.deepEqual(parseInline('[Wiki](https://en.wikipedia.org/wiki/Foo_(bar))'), [
		{ type: 'link', href: 'https://en.wikipedia.org/wiki/Foo_(bar)', children: [{ type: 'text', value: 'Wiki' }] },
	]);
});

test('keeps pipes inside inline code and escaped cells', () => {
	const blocks = parseMarkdownBlocks(['| A | B |', '| --- | --- |', '| `x|y` | z \\| w |'].join('\n'));
	assert.deepEqual(blocks, [{ type: 'table', header: ['A', 'B'], rows: [['`x|y`', 'z | w']] }]);
});

describe('parseMarkdownBlocks', () => {
	for (const [name, source, blocks] of [
		['blank input', ' \n\t', []],
		['a paragraph with Windows line breaks', 'one\r\ntwo', [{ type: 'paragraph', text: 'one\ntwo' }]],
		['a first-level heading', '# Topic', [{ type: 'heading', level: 1, text: 'Topic' }]],
		['a sixth-level heading', '###### Topic', [{ type: 'heading', level: 6, text: 'Topic' }]],
		['seven heading markers', '####### Topic', [{ type: 'paragraph', text: '####### Topic' }]],
		['a quote on two lines', '> One\n> Two', [{ type: 'blockquote', text: 'One\nTwo' }]],
		['two hyphens', '--', [{ type: 'paragraph', text: '--' }]],
		['three hyphens', '---', [{ type: 'hr' }]],
		['a code fence with a language', '~~~ts\nlet n = 1;\n~~~', [{ type: 'code', language: 'ts', text: 'let n = 1;' }]],
		['an open code fence', '~~~\nfirst line', [{ type: 'code', language: '', text: 'first line' }]],
		['a continued list item', '- a\n  b\n- c', [{ type: 'list', ordered: false, items: ['a\nb', 'c'] }]],
		['a change from ordered to unordered items', '1. one\n2. two\n- end', [
			{ type: 'list', ordered: true, items: ['one', 'two'] }, { type: 'list', ordered: false, items: ['end'] },
		]],
		['table rows with missing and extra cells', 'A|B\n---|---\n|one|\ntwo|three|four', [
			{ type: 'table', header: ['A', 'B'], rows: [['one', ''], ['two', 'three']] },
		]],
	]) {
		it(name, () => assert.deepEqual(parseMarkdownBlocks(source), blocks));
	}
});

describe('parseInline', () => {
	const text = (value) => ({ type: 'text', value });
	for (const [name, source, nodes] of [
		['empty text', '', []],
		['plain Unicode', '∑ Δ', [text('∑ Δ')]],
		['an escaped marker', '\\*', [text('*')]],
		['an unfinished code span', '`unfinished', [text('`unfinished')]],
		['literal formatting in a code span', '`*x*`', [{ type: 'code', value: '*x*' }]],
		['strong text', '**yes**', [{ type: 'strong', children: [text('yes')] }]],
		['emphasized text', '_yes_', [{ type: 'em', children: [text('yes')] }]],
		['strong and emphasized text', '***yes***', [{ type: 'strong', children: [{ type: 'em', children: [text('yes')] }] }]],
		['underscores in an identifier', 'item_one_two', [text('item_one_two')]],
		['a link with formatted text', '[**guide**](/docs)', [{ type: 'link', href: '/docs', children: [{ type: 'strong', children: [text('guide')] }] }]],
		['image alt text', '![range diagram](range.png)', [text('range diagram')]],
		['an unfinished link', '[guide](/docs', [text('[guide](/docs')]],
	]) {
		it(name, () => assert.deepEqual(parseInline(source), nodes));
	}
});

describe('compactMarkdownText', () => {
	for (const [name, source, expected] of [
		['empty text', '', ''],
		['a heading and paragraph', '# Topic\n\nA **strong** claim.', 'Topic A strong claim.'],
		['a quote with inline code', '> Compare `N`', 'Compare N'],
		['a list with emphasis and a link', '- _First_\n- [Next](#second)', 'First Next'],
		['a code block with extra whitespace', '~~~\na  b\n  c\n~~~', 'a b c'],
		['a table with inline formatting', 'A|B\n---|---\n*x*|y', 'A B x y'],
		['a separator between two paragraphs', 'before\n\n---\n\nafter', 'before after'],
	]) {
		it(name, () => assert.equal(compactMarkdownText(source), expected));
	}
});

describe('safeHref', () => {
	for (const [name, raw, expected] of [
		['a blank address', '  ', undefined],
		['a document name containing whitespace', 'two words', undefined],
		['a URL with outer whitespace', '  https://example.com/help  ', 'https://example.com/help'],
		['a plain HTTP address', 'http://example.com/read', 'http://example.com/read'],
		['an uppercase HTTP scheme', 'HTTP://example.com/read', 'HTTP://example.com/read'],
		['a relative document', '../notes/lesson.md', '../notes/lesson.md'],
		['a query on the current page', '?topic=math', '?topic=math'],
	]) {
		it(name, () => assert.equal(safeHref(raw), expected));
	}
});

test('an empty update hides the previous turn and the next update restores it', async () => {
	await withRenderer(async ({ renderer }) => {
		renderer.update('# Previous');
		renderer.update('');
		assert.equal(renderer.element.firstElementChild.hidden, true);
		assert.equal(renderer.element.firstElementChild.childElementCount, 0);
		renderer.update('## Next');
		assert.equal(renderer.element.firstElementChild.hidden, false);
		assert.equal(renderer.element.querySelector('h2').textContent, 'Next');
	});
});

test('copy writes the text of the selected code block', async () => {
	const writes = [];
	await withRenderer(async ({ renderer }) => {
		renderer.update('~~~sh\nprintf "%s" sample\n~~~');
		await act(async () => copyButtons(renderer)[0].click());
		assert.deepEqual(writes, ['printf "%s" sample']);
	}, async (value) => { writes.push(value); });
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { compactMarkdownText, parseInline, parseMarkdownBlocks, safeHref } from '../src/ui/chat-markdown-parse.ts';

test('parses headings, paragraphs, lists, quotes, rules, fences, and tables', () => {
	const blocks = parseMarkdownBlocks(
		[
			'# Title',
			'',
			'A **bold** intro with `code`.',
			'',
			'> quoted line',
			'',
			'- one',
			'- two',
			'  continued',
			'',
			'1. first',
			'2. second',
			'',
			'```ts',
			'const n = 1;',
			'```',
			'',
			'| A | B |',
			'| --- | --- |',
			'| 1 | 2 |',
			'',
			'---',
			'',
			'Closing paragraph.',
		].join('\n'),
	);

	assert.deepEqual(
		blocks.map((block) => block.type),
		['heading', 'paragraph', 'blockquote', 'list', 'list', 'code', 'table', 'hr', 'paragraph'],
	);
	assert.equal(blocks[0]?.type === 'heading' && blocks[0].level === 1 && blocks[0].text === 'Title', true);
	assert.equal(blocks[3]?.type === 'list' && !blocks[3].ordered && blocks[3].items[1] === 'two\ncontinued', true);
	assert.equal(blocks[4]?.type === 'list' && blocks[4].ordered, true);
	assert.equal(blocks[5]?.type === 'code' && blocks[5].language === 'ts' && blocks[5].text === 'const n = 1;', true);
	assert.deepEqual(blocks[6]?.type === 'table' ? blocks[6].header : null, ['A', 'B']);
	assert.deepEqual(blocks[6]?.type === 'table' ? blocks[6].rows : null, [['1', '2']]);
});

test('keeps nested list markers as one-level items', () => {
	const [list] = parseMarkdownBlocks('- parent\n  - child');
	assert.equal(list?.type, 'list');
	if (list?.type !== 'list') return;
	assert.deepEqual(list.items, ['parent', 'child']);
});

test('treats raw HTML as paragraph text', () => {
	const [block] = parseMarkdownBlocks('Hello <script>alert(1)</script>');
	assert.equal(block?.type, 'paragraph');
	assert.equal(block?.type === 'paragraph' && block.text, 'Hello <script>alert(1)</script>');
});

test('leaves unmatched fence content as a code block', () => {
	const [block] = parseMarkdownBlocks('```js\nconst x = 1;');
	assert.equal(block?.type, 'code');
	assert.equal(block?.type === 'code' && block.language, 'js');
	assert.equal(block?.type === 'code' && block.text, 'const x = 1;');
});

test('does not treat hash-prefixed words as headings', () => {
	const [block] = parseMarkdownBlocks('#not-a-heading');
	assert.equal(block?.type, 'paragraph');
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

test('strips markdown markers for compact trail previews', () => {
	assert.equal(compactMarkdownText('See **bold** and `code`.'), 'See bold and code.');
	assert.equal(compactMarkdownText('***both***'), 'both');
	assert.equal(compactMarkdownText('# Title\n\nA paragraph.'), 'Title A paragraph.');
});

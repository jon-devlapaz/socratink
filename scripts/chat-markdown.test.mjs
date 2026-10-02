import assert from 'node:assert/strict';
import test from 'node:test';
import { parseInline, parseMarkdownBlocks, safeHref } from '../src/ui/chat-markdown-parse.ts';

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

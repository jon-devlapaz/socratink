// Assistant-turn markdown DOM. Untrusted model text becomes a typed tree
// (createElement / createTextNode). Parsing lives in chat-markdown-parse.ts.

import {
	parseInline,
	parseMarkdownBlocks,
	safeHref,
	type InlineNode,
	type MarkdownBlock,
} from './chat-markdown-parse.ts';

export type MarkdownRenderOptions = Readonly<{
	stream?: boolean;
	streamGapMs?: number;
}>;

export type MarkdownRenderer = {
	readonly element: HTMLElement;
	update(markdown: string, options?: MarkdownRenderOptions): void;
	destroy(): void;
};

export function createMarkdownRenderer(options?: { className?: string }): MarkdownRenderer {
	const element = document.createElement('div');
	element.className = options?.className ?? 'turn-markdown';
	const streamTimers: number[] = [];
	const copyTimers: number[] = [];

	function clearTimers() {
		for (const id of streamTimers) window.clearTimeout(id);
		for (const id of copyTimers) window.clearTimeout(id);
		streamTimers.length = 0;
		copyTimers.length = 0;
	}

	return {
		element,
		update(markdown, renderOptions = {}) {
			clearTimers();
			element.replaceChildren();
			if (!markdown) {
				element.hidden = true;
				return;
			}
			element.hidden = false;
			const blocks = parseMarkdownBlocks(markdown);
			const streamWord = { next: 0 };
			const stream = Boolean(renderOptions.stream);
			for (const block of blocks) {
				element.append(
					renderBlock(block, {
						stream,
						streamGapMs: renderOptions.streamGapMs ?? 60,
						streamTimers,
						copyTimers,
						streamWord,
					}),
				);
			}
		},
		destroy() {
			clearTimers();
		},
	};
}

function renderBlock(
	block: MarkdownBlock,
	context: {
		stream: boolean;
		streamGapMs: number;
		streamTimers: number[];
		copyTimers: number[];
		streamWord: { next: number };
	},
): HTMLElement {
	switch (block.type) {
		case 'paragraph': {
			const node = document.createElement('p');
			appendInline(node, block.text);
			if (context.stream) streamElement(node, context);
			return node;
		}
		case 'heading': {
			const tag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			const node = document.createElement(tag);
			appendInline(node, block.text);
			if (context.stream) streamElement(node, context);
			return node;
		}
		case 'code':
			return renderCodeBlock(block, context.copyTimers);
		case 'blockquote': {
			const node = document.createElement('blockquote');
			const paragraph = document.createElement('p');
			appendInline(paragraph, block.text);
			node.append(paragraph);
			if (context.stream) streamElement(node, context);
			return node;
		}
		case 'list': {
			const node = document.createElement(block.ordered ? 'ol' : 'ul');
			for (const item of block.items) {
				const li = document.createElement('li');
				appendInline(li, item);
				if (context.stream) streamElement(li, context);
				node.append(li);
			}
			return node;
		}
		case 'table':
			return renderTable(block);
		case 'hr':
			return document.createElement('hr');
		default: {
			const exhaustive: never = block;
			return exhaustive;
		}
	}
}

function renderCodeBlock(
	block: Extract<MarkdownBlock, { type: 'code' }>,
	copyTimers: number[],
): HTMLElement {
	const wrap = document.createElement('div');
	wrap.className = 'code-block';
	const head = document.createElement('div');
	head.className = 'code-block-head';
	const lang = document.createElement('span');
	lang.className = 'code-block-lang';
	lang.textContent = block.language || 'text';
	const copy = document.createElement('button');
	copy.type = 'button';
	copy.className = 'code-block-copy';
	copy.textContent = 'Copy';
	copy.setAttribute('aria-label', 'Copy code');
	copy.addEventListener('click', () => {
		void copyCode(block.text, copy, copyTimers);
	});
	head.append(lang, copy);
	const pre = document.createElement('pre');
	const code = document.createElement('code');
	code.textContent = block.text;
	pre.append(code);
	wrap.append(head, pre);
	return wrap;
}

function renderTable(block: Extract<MarkdownBlock, { type: 'table' }>): HTMLElement {
	const wrap = document.createElement('div');
	wrap.className = 'markdown-table-wrap';
	const table = document.createElement('table');
	table.className = 'markdown-table';
	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	for (const cell of block.header) {
		const th = document.createElement('th');
		appendInline(th, cell);
		headerRow.append(th);
	}
	thead.append(headerRow);
	const tbody = document.createElement('tbody');
	for (const row of block.rows) {
		const tr = document.createElement('tr');
		for (const cell of row) {
			const td = document.createElement('td');
			appendInline(td, cell);
			tr.append(td);
		}
		tbody.append(tr);
	}
	table.append(thead, tbody);
	wrap.append(table);
	return wrap;
}

async function copyCode(code: string, button: HTMLButtonElement, copyTimers: number[]): Promise<void> {
	try {
		await navigator.clipboard.writeText(code);
	} catch {
		return;
	}
	for (const id of copyTimers) window.clearTimeout(id);
	copyTimers.length = 0;
	button.textContent = 'Copied';
	button.setAttribute('aria-label', 'Copied code');
	copyTimers.push(
		window.setTimeout(() => {
			button.textContent = 'Copy';
			button.setAttribute('aria-label', 'Copy code');
		}, 2000),
	);
}

function appendInline(parent: HTMLElement, source: string): void {
	for (const node of parseInline(source)) appendInlineNode(parent, node);
}

function appendInlineNode(parent: HTMLElement, node: InlineNode): void {
	switch (node.type) {
		case 'text':
			parent.append(document.createTextNode(node.value));
			return;
		case 'code': {
			const code = document.createElement('code');
			code.textContent = node.value;
			parent.append(code);
			return;
		}
		case 'strong': {
			const strong = document.createElement('strong');
			for (const child of node.children) appendInlineNode(strong, child);
			parent.append(strong);
			return;
		}
		case 'em': {
			const em = document.createElement('em');
			for (const child of node.children) appendInlineNode(em, child);
			parent.append(em);
			return;
		}
		case 'link': {
			const href = safeHref(node.href);
			if (!href) {
				for (const child of node.children) appendInlineNode(parent, child);
				return;
			}
			const anchor = document.createElement('a');
			anchor.href = href;
			if (/^https?:/i.test(href)) {
				anchor.target = '_blank';
				anchor.rel = 'noopener noreferrer';
			}
			for (const child of node.children) appendInlineNode(anchor, child);
			parent.append(anchor);
			return;
		}
		default: {
			const exhaustive: never = node;
			throw new Error(String(exhaustive));
		}
	}
}

function streamElement(
	root: HTMLElement,
	context: {
		streamGapMs: number;
		streamTimers: number[];
		streamWord: { next: number };
	},
): void {
	const spans: HTMLSpanElement[] = [];
	const texts: Text[] = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let current = walker.nextNode();
	while (current) {
		if (current instanceof Text) texts.push(current);
		current = walker.nextNode();
	}
	for (const textNode of texts) {
		const host = textNode.parentElement;
		if (!host || host.closest('pre, .code-block, table, code')) continue;
		const value = textNode.nodeValue ?? '';
		const fragment = document.createDocumentFragment();
		for (const token of value.split(/(\s+)/)) {
			if (token === '') continue;
			if (/^\s+$/.test(token)) {
				fragment.append(token);
				continue;
			}
			const word = document.createElement('span');
			word.className = 'stream-word';
			word.textContent = token;
			fragment.append(word);
			spans.push(word);
		}
		textNode.replaceWith(fragment);
	}
	spans.forEach((word, index) => {
		context.streamTimers.push(
			window.setTimeout(() => word.classList.add('is-in'), (context.streamWord.next + index) * context.streamGapMs),
		);
	});
	context.streamWord.next += spans.length;
}

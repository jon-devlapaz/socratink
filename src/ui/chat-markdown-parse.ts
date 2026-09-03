// Assistant-turn markdown subset. This is not CommonMark or GFM.

export type MarkdownBlock =
	| { type: 'paragraph'; text: string }
	| { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
	| { type: 'code'; language: string; text: string }
	| { type: 'blockquote'; text: string }
	| { type: 'list'; ordered: boolean; items: string[] }
	| { type: 'table'; header: string[]; rows: string[][] }
	| { type: 'hr' };

export type InlineNode =
	| { type: 'text'; value: string }
	| { type: 'code'; value: string }
	| { type: 'strong'; children: InlineNode[] }
	| { type: 'em'; children: InlineNode[] }
	| { type: 'link'; href: string; children: InlineNode[] };

type InlineFlags = Readonly<{ strong: boolean; em: boolean; links: boolean }>;

const headingPattern = /^( {0,3})(#{1,6})(?:[ \t]+(.*?)|\s*)?[ \t]*#*[ \t]*$/;
const hrPattern = /^( {0,3})([-*_])(?:\s*\2){2,}\s*$/;
const fencePattern = /^( {0,3})(`{3,}|~{3,})([^`\n]*)$/;
const listPattern = /^( {0,3})([-*+]|\d{1,9}[.)])[ \t]+(.*)$/;
const quotePattern = /^( {0,3})>[ \t]?(.*)$/;
const tableSplitPattern = /^( {0,3})\|?.*\|.*\|?\s*$/;
const tableRulePattern = /^( {0,3})\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
const schemePattern = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function parseMarkdownBlocks(source: string): MarkdownBlock[] {
	const lines = source.replace(/\r\n?/g, '\n').split('\n');
	const blocks: MarkdownBlock[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];
		if (line === undefined || isBlank(line)) {
			index += 1;
			continue;
		}

		const fence = readFence(lines, index);
		if (fence) {
			blocks.push(fence.block);
			index = fence.next;
			continue;
		}

		const heading = matchHeading(line);
		if (heading) {
			blocks.push(heading);
			index += 1;
			continue;
		}

		if (hrPattern.test(line)) {
			blocks.push({ type: 'hr' });
			index += 1;
			continue;
		}

		const table = readTable(lines, index);
		if (table) {
			blocks.push(table.block);
			index = table.next;
			continue;
		}

		const quote = readQuote(lines, index);
		if (quote) {
			blocks.push(quote.block);
			index = quote.next;
			continue;
		}

		const list = readList(lines, index);
		if (list) {
			blocks.push(list.block);
			index = list.next;
			continue;
		}

		const paragraph = readParagraph(lines, index);
		blocks.push(paragraph.block);
		index = paragraph.next;
	}

	return blocks;
}

export function safeHref(href: string): string | undefined {
	const trimmed = href.trim();
	if (!trimmed || /[\s<>]/.test(trimmed) || trimmed.startsWith('//')) return undefined;
	const lower = trimmed.toLowerCase();
	if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
		return undefined;
	}
	if (schemePattern.test(trimmed)) {
		if (lower.startsWith('https:') || lower.startsWith('http:') || lower.startsWith('mailto:')) {
			return trimmed;
		}
		return undefined;
	}
	return trimmed;
}

export function compactMarkdownText(source: string): string {
	return parseMarkdownBlocks(source)
		.map((block) => {
			switch (block.type) {
				case 'paragraph':
				case 'heading':
				case 'blockquote':
					return inlinePlain(block.text);
				case 'list':
					return block.items.map((item) => inlinePlain(item)).join(' ');
				case 'code':
					return block.text.replace(/\s+/g, ' ').trim();
				case 'table':
					return [block.header, ...block.rows].flat().map((cell) => inlinePlain(cell)).join(' ');
				case 'hr':
					return '';
				default: {
					const exhaustive: never = block;
					return exhaustive;
				}
			}
		})
		.filter(Boolean)
		.join(' ');
}

function isBlank(line: string): boolean {
	return /^\s*$/.test(line);
}

function matchHeading(line: string): Extract<MarkdownBlock, { type: 'heading' }> | undefined {
	const match = headingPattern.exec(line);
	if (!match) return undefined;
	const marks = match[2];
	if (!marks) return undefined;
	const level = marks.length as 1 | 2 | 3 | 4 | 5 | 6;
	return { type: 'heading', level, text: (match[3] ?? '').trim() };
}

function readFence(
	lines: readonly string[],
	start: number,
): { block: Extract<MarkdownBlock, { type: 'code' }>; next: number } | undefined {
	const opener = lines[start];
	if (opener === undefined) return undefined;
	const match = fencePattern.exec(opener);
	if (!match) return undefined;
	const marker = match[2];
	if (!marker) return undefined;
	const markerChar = marker[0];
	const language = (match[3] ?? '').trim().split(/\s+/)[0] ?? '';
	const body: string[] = [];
	let index = start + 1;
	while (index < lines.length) {
		const line = lines[index] ?? '';
		const close = /^( {0,3})(`{3,}|~{3,})\s*$/.exec(line);
		if (
			close?.[2] &&
			close[2][0] === markerChar &&
			close[2].length >= marker.length
		) {
			index += 1;
			break;
		}
		body.push(line);
		index += 1;
	}
	return {
		block: { type: 'code', language, text: body.join('\n') },
		next: index,
	};
}

function readTable(
	lines: readonly string[],
	start: number,
): { block: Extract<MarkdownBlock, { type: 'table' }>; next: number } | undefined {
	const headerLine = lines[start];
	const ruleLine = lines[start + 1];
	if (!headerLine || !ruleLine) return undefined;
	if (!tableSplitPattern.test(headerLine) || !tableRulePattern.test(ruleLine)) return undefined;
	const header = splitTableRow(headerLine);
	if (header.length < 2) return undefined;
	const rows: string[][] = [];
	let index = start + 2;
	while (index < lines.length) {
		const line = lines[index];
		if (line === undefined || isBlank(line) || !tableSplitPattern.test(line)) break;
		const cells = splitTableRow(line);
		const padded = header.map((_, cellIndex) => cells[cellIndex] ?? '');
		rows.push(padded);
		index += 1;
	}
	return {
		block: {
			type: 'table',
			header,
			rows,
		},
		next: index,
	};
}

function splitTableRow(line: string): string[] {
	const trimmed = line.trim();
	const opened = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
	const closed = opened.endsWith('|') && !opened.endsWith('\\|') ? opened.slice(0, -1) : opened;
	const cells: string[] = [];
	let current = '';
	let inCode = false;
	for (let index = 0; index < closed.length; index += 1) {
		const character = closed[index];
		if (character === '`') {
			inCode = !inCode;
			current += character;
			continue;
		}
		if (!inCode && character === '\\' && closed[index + 1] === '|') {
			current += '|';
			index += 1;
			continue;
		}
		if (!inCode && character === '|') {
			cells.push(current.trim());
			current = '';
			continue;
		}
		current += character ?? '';
	}
	cells.push(current.trim());
	return cells;
}

function readQuote(
	lines: readonly string[],
	start: number,
): { block: Extract<MarkdownBlock, { type: 'blockquote' }>; next: number } | undefined {
	if (!quotePattern.test(lines[start] ?? '')) return undefined;
	const body: string[] = [];
	let index = start;
	while (index < lines.length) {
		const line = lines[index];
		if (line === undefined) break;
		const match = quotePattern.exec(line);
		if (!match) break;
		body.push(match[2] ?? '');
		index += 1;
	}
	return {
		block: {
			type: 'blockquote',
			text: body.join('\n').trim(),
		},
		next: index,
	};
}

function readList(
	lines: readonly string[],
	start: number,
): { block: Extract<MarkdownBlock, { type: 'list' }>; next: number } | undefined {
	const first = listPattern.exec(lines[start] ?? '');
	if (!first) return undefined;
	const ordered = /^\d/.test(first[2] ?? '');
	const items: string[] = [first[3] ?? ''];
	let index = start + 1;
	while (index < lines.length) {
		const line = lines[index];
		if (line === undefined || isBlank(line)) break;
		const nextItem = listPattern.exec(line);
		if (nextItem && /^\d/.test(nextItem[2] ?? '') === ordered) {
			items.push(nextItem[3] ?? '');
			index += 1;
			continue;
		}
		if (/^ {2,}\S/.test(line) && !listPattern.test(line)) {
			const last = items.length - 1;
			const previous = items[last] ?? '';
			items[last] = `${previous}\n${line.trim()}`;
			index += 1;
			continue;
		}
		break;
	}
	return {
		block: {
			type: 'list',
			ordered,
			items,
		},
		next: index,
	};
}

function readParagraph(
	lines: readonly string[],
	start: number,
): { block: Extract<MarkdownBlock, { type: 'paragraph' }>; next: number } {
	const body: string[] = [];
	let index = start;
	while (index < lines.length) {
		const line = lines[index];
		if (line === undefined || isBlank(line) || startsBlock(line, lines[index + 1])) break;
		body.push(line);
		index += 1;
	}
	return {
		block: { type: 'paragraph', text: body.join('\n').trim() },
		next: index,
	};
}

function startsBlock(line: string, next?: string): boolean {
	if (fencePattern.test(line) || headingPattern.test(line) || hrPattern.test(line)) return true;
	if (quotePattern.test(line) || listPattern.test(line)) return true;
	if (next !== undefined && tableSplitPattern.test(line) && tableRulePattern.test(next)) return true;
	return false;
}

export function parseInline(source: string, flags: InlineFlags = { strong: true, em: true, links: true }): InlineNode[] {
	const nodes: InlineNode[] = [];
	let index = 0;
	let textStart = 0;

	const flush = (end: number) => {
		if (end > textStart) nodes.push({ type: 'text', value: source.slice(textStart, end) });
	};

	while (index < source.length) {
		const current = source[index];
		if (current === '\\' && index + 1 < source.length) {
			flush(index);
			nodes.push({ type: 'text', value: source[index + 1] ?? '' });
			index += 2;
			textStart = index;
			continue;
		}
		if (current === '`') {
			const close = source.indexOf('`', index + 1);
			if (close !== -1) {
				flush(index);
				nodes.push({ type: 'code', value: source.slice(index + 1, close) });
				index = close + 1;
				textStart = index;
				continue;
			}
		}
		if (flags.strong && flags.em && (source.startsWith('***', index) || source.startsWith('___', index))) {
			const delim = source.slice(index, index + 3);
			const close = source.indexOf(delim, index + 3);
			if (close !== -1) {
				flush(index);
				nodes.push({
					type: 'strong',
					children: [
						{
							type: 'em',
							children: parseInline(source.slice(index + 3, close), { ...flags, strong: false, em: false }),
						},
					],
				});
				index = close + 3;
				textStart = index;
				continue;
			}
		}
		if (flags.strong && (source.startsWith('**', index) || source.startsWith('__', index))) {
			const delim = source.slice(index, index + 2);
			const close = source.indexOf(delim, index + 2);
			if (close !== -1) {
				flush(index);
				nodes.push({
					type: 'strong',
					children: parseInline(source.slice(index + 2, close), { ...flags, strong: false }),
				});
				index = close + 2;
				textStart = index;
				continue;
			}
		}
		if (flags.em && (current === '*' || current === '_') && canOpenEmphasis(source, index, current)) {
			const close = findEmphasisClose(source, index, current);
			if (close !== -1) {
				flush(index);
				nodes.push({
					type: 'em',
					children: parseInline(source.slice(index + 1, close), { ...flags, em: false }),
				});
				index = close + 1;
				textStart = index;
				continue;
			}
		}
		if (flags.links && (current === '[' || (current === '!' && source[index + 1] === '['))) {
			const link = readLink(source, index);
			if (link) {
				flush(index);
				nodes.push(
					link.image
						? { type: 'text', value: link.text }
						: {
								type: 'link',
								href: link.href,
								children: parseInline(link.text, { ...flags, links: false }),
							},
				);
				index = link.end;
				textStart = index;
				continue;
			}
		}
		index += 1;
	}
	flush(source.length);
	return nodes;
}

function inlinePlain(source: string): string {
	return parseInline(source).map(inlineNodePlain).join('');
}

function inlineNodePlain(node: InlineNode): string {
	switch (node.type) {
		case 'text':
		case 'code':
			return node.value;
		case 'strong':
		case 'em':
		case 'link':
			return node.children.map(inlineNodePlain).join('');
		default: {
			const exhaustive: never = node;
			return exhaustive;
		}
	}
}

function canOpenEmphasis(source: string, index: number, marker: string): boolean {
	if (source[index + 1] === marker) return false;
	if (marker === '_') {
		const previous = source[index - 1];
		if (previous && /[A-Za-z0-9]/.test(previous)) return false;
	}
	return true;
}

function findEmphasisClose(source: string, start: number, marker: string): number {
	let index = start + 1;
	while (index < source.length) {
		if (source[index] === '\\') {
			index += 2;
			continue;
		}
		if (source[index] === marker && source[index + 1] !== marker) {
			if (marker === '_' && source[index + 1] && /[A-Za-z0-9]/.test(source[index + 1] ?? '')) {
				index += 1;
				continue;
			}
			return index;
		}
		index += 1;
	}
	return -1;
}

function readLink(
	source: string,
	start: number,
): { text: string; href: string; end: number; image: boolean } | undefined {
	const image = source[start] === '!';
	const textStart = image ? start + 1 : start;
	if (source[textStart] !== '[') return undefined;
	const closeText = source.indexOf(']', textStart + 1);
	if (closeText === -1 || source[closeText + 1] !== '(') return undefined;
	let depth = 1;
	let closeHref = -1;
	for (let index = closeText + 2; index < source.length; index += 1) {
		const character = source[index];
		if (character === '\n') break;
		if (character === '(') depth += 1;
		if (character === ')') {
			depth -= 1;
			if (depth === 0) {
				closeHref = index;
				break;
			}
		}
	}
	if (closeHref === -1) return undefined;
	const text = source.slice(textStart + 1, closeText);
	const href = source.slice(closeText + 2, closeHref);
	if (text.includes('\n')) return undefined;
	return { text, href, end: closeHref + 1, image };
}


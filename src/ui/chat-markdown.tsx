import { createElement, Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RevealDefinition } from '../reveal.ts';
import { RevealMark } from './reveal-mark.tsx';
import { parseInline, parseMarkdownBlocks, safeHref, type InlineNode, type MarkdownBlock } from './chat-markdown-parse.ts';

export function Markdown({ text, reveal, streaming }: { text: string; reveal?: RevealDefinition; streaming?: boolean }) {
	return <div className={text && reveal ? 'turn-markdown reveal-copy' : 'turn-markdown'}
		hidden={!text} aria-hidden={streaming || undefined}>
		{text && reveal && <RevealMark reveal={reveal} />}
		{parseMarkdownBlocks(text).map((block, index) => <Block key={index} block={block} />)}
	</div>;
}

function Block({ block }: { block: MarkdownBlock }) {
	switch (block.type) {
		case 'paragraph': return <p>{inline(block.text)}</p>;
		case 'heading': return createElement(`h${block.level}`, null, inline(block.text));
		case 'code': return <CodeBlock key={block.text} text={block.text} language={block.language} />;
		case 'blockquote': return <blockquote><p>{inline(block.text)}</p></blockquote>;
		case 'list': {
			const List = block.ordered ? 'ol' : 'ul';
			return <List>{block.items.map((item, index) => <li key={index}>{inline(item)}</li>)}</List>;
		}
		case 'table': return <Table className="markdown-table">
			<TableHeader><TableRow>
				{block.header.map((cell, index) => <TableHead key={index}>{inline(cell)}</TableHead>)}
			</TableRow></TableHeader>
			<TableBody>
				{block.rows.map((row, index) => <TableRow key={index}>
					{row.map((cell, column) => <TableCell key={column}>{inline(cell)}</TableCell>)}
				</TableRow>)}
			</TableBody>
		</Table>;
		case 'hr': return <hr />;
	}
}

function inline(text: string) {
	return parseInline(text).map((node, index) => <Inline key={index} node={node} />);
}

function Inline({ node }: { node: InlineNode }): ReactNode {
	if (node.type === 'text') return node.value;
	if (node.type === 'code') return <code>{node.value}</code>;
	const children = node.children.map((child, index) => <Inline key={index} node={child} />);
	switch (node.type) {
		case 'strong': return <strong>{children}</strong>;
		case 'em': return <em>{children}</em>;
		case 'link': {
			const href = safeHref(node.href);
			if (!href) return <Fragment>{children}</Fragment>;
			const external = /^https?:/i.test(href);
			return <Button asChild variant="link">
				<a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>
			</Button>;
		}
	}
}

function CodeBlock({ text, language }: { text: string; language: string }) {
	const [copied, setCopied] = useState(false);
	const active = useRef(false);
	const timer = useRef<number | undefined>(undefined);
	useLayoutEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
			window.clearTimeout(timer.current);
		};
	}, []);
	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return;
		}
		if (!active.current) return;
		window.clearTimeout(timer.current);
		setCopied(true);
		timer.current = window.setTimeout(() => setCopied(false), 2000);
	}
	return <div className="code-block">
		<div className="code-block-head">
			<span className="code-block-lang">{language || 'text'}</span>
			<Button variant="ghost" size="sm" className="code-block-copy" type="button"
				aria-label={copied ? 'Copied code' : 'Copy code'} onClick={copy}>
				{copied ? 'Copied' : 'Copy'}
			</Button>
		</div>
		<pre><code>{text}</code></pre>
	</div>;
}

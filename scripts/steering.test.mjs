import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	createSteeringBar,
	formatSteeringMessage,
	steeringPrefix,
	turnSnippetToCopy,
} from '../src/ui/steering.ts';

test('steering messages are prefixed learner turns, not capability claims', () => {
	assert.equal(
		formatSteeringMessage('smaller-step'),
		`${steeringPrefix} smaller step. The last turn moved too fast or assumed more footing than I have. Slow down to one smaller step, and check a missing assumption before continuing.`,
	);
	assert.equal(
		formatSteeringMessage('try-unaided'),
		`${steeringPrefix} try unaided. I have enough footing. Withhold the next reveal and let me attempt the target.`,
	);
	assert.match(formatSteeringMessage('smaller-step'), /^Steering:/);
	assert.doesNotMatch(formatSteeringMessage('try-unaided'), /mastery|durable learning/i);
});

test('copy uses a selected snippet when present, otherwise the whole turn', () => {
	assert.equal(turnSnippetToCopy('full turn text', '  the snippet  '), 'the snippet');
	assert.equal(turnSnippetToCopy('full turn text', '   '), 'full turn text');
	assert.equal(turnSnippetToCopy('full turn text'), 'full turn text');
});

class FakeElement {
	constructor(tagName) {
		this.tagName = tagName.toUpperCase();
		this.childNodes = [];
		this.className = '';
		this.textContent = '';
		this.disabled = false;
		this.type = '';
		this.isConnected = true;
		this.listeners = {};
		this.attributes = {};
	}
	setAttribute(name, value) {
		this.attributes[name] = value;
	}
	append(...nodes) {
		this.childNodes.push(...nodes);
	}
	addEventListener(type, listener) {
		this.listeners[type] = listener;
	}
	querySelector(selector) {
		if (selector === '.steering-tip') {
			const walk = (node) => {
				if (node.className === 'steering-tip') return node;
				for (const child of node.childNodes ?? []) {
					const hit = walk(child);
					if (hit) return hit;
				}
				return undefined;
			};
			return walk(this);
		}
		return null;
	}
	querySelectorAll(selector) {
		const matches = [];
		const walk = (node) => {
			if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
			for (const child of node.childNodes ?? []) walk(child);
		};
		for (const child of this.childNodes) walk(child);
		return matches;
	}
	click() {
		if (this.disabled) return;
		this.listeners.click?.();
	}
}

test('steering chips send once; copy writes the turn without sending', async () => {
	const previousDocument = globalThis.document;
	const previousSetTimeout = globalThis.setTimeout;
	globalThis.document = {
		createElement: (tag) => new FakeElement(tag),
		createElementNS: (_ns, tag) => new FakeElement(tag),
	};
	globalThis.setTimeout = () => 0;
	try {
		const steered = [];
		const written = [];
		const bar = createSteeringBar({
			sourceText: 'full turn',
			onSteer: (kind) => steered.push(kind),
			writeClipboard: async (text) => {
				written.push(text);
				return true;
			},
		});
		const [smaller, unaided, copy] = bar.querySelectorAll('button');
		assert.equal(smaller?.attributes['aria-label'], 'Too fast: need a smaller step');
		assert.equal(unaided?.attributes['aria-label'], 'I want to try unaided');
		assert.equal(copy?.attributes['aria-label'], 'Copy this turn');
		copy.click();
		await Promise.resolve();
		await Promise.resolve();
		assert.deepEqual(written, ['full turn']);
		assert.equal(copy.querySelector('.steering-tip')?.textContent, 'Copied');
		assert.deepEqual(steered, []);
		smaller.click();
		assert.deepEqual(steered, ['smaller-step']);
		assert.equal(unaided.disabled, true);
		assert.equal(copy.disabled, true);
		unaided.click();
		assert.deepEqual(steered, ['smaller-step']);
	} finally {
		globalThis.document = previousDocument;
		globalThis.setTimeout = previousSetTimeout;
	}
});

test('the last idle assistant turn mounts a steering bar that sends through the composer path', async () => {
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const turnSource = await readFile(new URL('../src/ui/turn-view.ts', import.meta.url), 'utf8');
	const turnsSource = await readFile(new URL('../src/ui/chat-turns.ts', import.meta.url), 'utf8');
	const barSource = await readFile(new URL('../src/ui/steering.ts', import.meta.url), 'utf8');
	const promptSource = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	const styleSource = await readFile(new URL('../src/ui/steering.css', import.meta.url), 'utf8');
	const mainSource = await readFile(new URL('../src/ui/main.ts', import.meta.url), 'utf8');
	const packageSource = await readFile(new URL('../package.json', import.meta.url), 'utf8');

	assert.match(surfaceSource, /steering: isLast && item\.role === 'Assistant' && requestState\.kind === 'idle'/);
	assert.match(surfaceSource, /sendMessage\(formatSteeringMessage\(steering\)\)/);
	assert.match(turnSource, /createSteeringBar/);
	assert.match(turnsSource, /displayedLearnerTurn/);
	assert.match(turnsSource, /learnerKind: 'steering'/);
	assert.match(barSource, /aria-label', 'Steer this turn'/);
	assert.doesNotMatch(barSource, /Need a different pace/);
	assert.doesNotMatch(barSource, /request-action/);
	assert.match(barSource, /role', 'tooltip'/);
	assert.match(barSource, /steering-icon/);
	assert.doesNotMatch(barSource, /lucide-react/);
	assert.match(promptSource, /When a learner message starts with "Steering:"/);
	assert.match(promptSource, /not as evidence of capability/);
	assert.match(promptSource, /"try unaided" means withhold the next reveal/);
	assert.match(styleSource, /\.steering-bar \{/);
	assert.match(styleSource, /\.steering-tip \{/);
	assert.match(mainSource, /import '\.\/steering\.css'/);
	assert.doesNotMatch(packageSource, /lucide-react|prompt-kit/);
});

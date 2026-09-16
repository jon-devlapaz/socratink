import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
	parseInkCue,
	inkCueFromParts,
	inkCueFromReply,
	expressionForInteraction,
} from '../src/ink-cue.ts';
import { visibleCardTools } from '../src/ui/tool-card.ts';
import { INK_EXPRESSIONS } from '../src/ui/effects/living-ink/expressions.ts';

test('only bounded cosmetic cues cross the model boundary', () => {
	for (const expression of ['rest', 'question', 'connect', 'explain'])
		assert.deepEqual(parseInkCue({ expression }), { expression });
	for (const value of [
		null,
		{},
		{ expression: 'mastered' },
		{ expression: 'connect', score: 1 },
	])
		assert.equal(parseInkCue(value), undefined);
	assert.deepEqual(
		inkCueFromReply({
			ink: [{ expression: 'question' }, { expression: 'connect' }],
		}),
		{ expression: 'connect' },
	);
	assert.deepEqual(
		inkCueFromParts([{ type: 'data-ink', data: { expression: 'explain' } }]),
		{ expression: 'explain' },
	);
	assert.equal(
		inkCueFromParts([
			{ type: 'data-ink', data: { expression: 'connect' } },
			{ type: 'data-ink', data: { expression: 'invalid' } },
		]),
		undefined,
	);
	assert.deepEqual(
		visibleCardTools([{ id: '1', name: 'ink_express', state: 'done' }]),
		[],
	);
});
test('request controls and real input take precedence over an assistant cue', () => {
	const assistant = { ink: { expression: 'connect' } };
	assert.equal(
		expressionForInteraction({ idle: false, composing: true, assistant }),
		'rest',
	);
	assert.equal(
		expressionForInteraction({ idle: true, composing: true, assistant }),
		'explain',
	);
	assert.equal(
		expressionForInteraction({
			idle: true,
			composing: false,
			assistant: { ...assistant, questionnaire: {} },
		}),
		'question',
	);
	assert.equal(
		expressionForInteraction({ idle: true, composing: false, assistant }),
		'connect',
	);
	assert.equal(
		expressionForInteraction({ idle: true, composing: false }),
		'rest',
	);
});
test('orb CSS keeps the 1120px ink poster from covering Chat', async () => {
	const css = await readFile(new URL('../src/ui/styles.css', import.meta.url), 'utf8');
	const poster = await readFile(
		new URL('../src/ui/effects/living-ink/poster.png', import.meta.url),
	);
	assert.equal(poster.subarray(12, 16).toString(), 'IHDR');
	assert.equal(poster.readUInt32BE(16), 1120);
	assert.equal(poster.readUInt32BE(20), 1120);
	assert.match(css, /\.alive-core \{[\s\S]*?\toverflow: hidden;/);
	assert.match(css, /\.living-ink-poster,\n\.living-ink-render \{[\s\S]*?\tposition: absolute;/);
	assert.match(
		css,
		/\.alive-core:has\(\.living-ink-render\[data-ink-ready='true'\]\) \.living-ink-poster \{[\s\S]*?\tvisibility: hidden;/,
	);
});

test('every selectable recipe fits the renderer capsule budget', () => {
	for (const { scene } of Object.values(INK_EXPRESSIONS)) {
		assert.ok(scene.parts.length > 0 && scene.parts.length <= 8);
		for (const part of scene.parts) {
			assert.equal(part.shape, 'capsule');
			assert.equal(part.operation, 'union');
			assert.ok(part.scale[1] >= part.scale[0]);
			assert.equal(part.scale[0], part.scale[2]);
			assert.ok(part.scale.every((value) => value >= 0.15 && value <= 2));
		}
	}
});

import test from 'node:test';
import assert from 'node:assert/strict';
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

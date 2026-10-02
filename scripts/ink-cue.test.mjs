import test from 'node:test';
import assert from 'node:assert/strict';
import {
	parseInkCue,
	inkCueFromParts,
	inkCueFromReply,
} from '../src/ink-cue.ts';
import { visibleCardTools } from '../src/ui/tool-card.ts';

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

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	parseRevealDefinition,
	revealExample,
	revealFromParts,
	revealToolName,
	isRevealTool,
} from '../src/reveal.ts';

test('accepts a kind and optional target, and rejects unknown kinds', () => {
	assert.deepEqual(parseRevealDefinition(revealExample), {
		kind: 'full_answer',
		target: 'Recover an admitted request after the response stream drops',
	});
	assert.deepEqual(parseRevealDefinition({ kind: 'hint' }), { kind: 'hint' });
	assert.equal(parseRevealDefinition({ kind: 'answer' }), undefined);
	assert.equal(parseRevealDefinition({ kind: 'full_answer', extra: true }), undefined);
});

test('reads the last data-reveal part and identifies the quiet tool', () => {
	assert.deepEqual(
		revealFromParts([
			{ type: 'data-reveal', data: { kind: 'hint' } },
			{ type: 'data-reveal', data: revealExample },
		]),
		revealExample,
	);
	assert.equal(revealFromParts([{ type: 'data-questionnaire', data: {} }]), undefined);
	assert.equal(isRevealTool(revealToolName), true);
	assert.equal(isRevealTool('present_question'), false);
});

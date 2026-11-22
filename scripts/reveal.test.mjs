import assert from 'node:assert/strict';
import test from 'node:test';
import {
	parseRevealDefinition,
	revealExample,
	revealFromParts,
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

test('requested accepts only a boolean flag', () => {
	assert.deepEqual(parseRevealDefinition({ kind: 'full_answer', requested: true }), { kind: 'full_answer', requested: true });
	assert.deepEqual(parseRevealDefinition({ kind: 'full_answer', requested: false }), { kind: 'full_answer', requested: false });
	for (const requested of ['true', 1, null]) {
		assert.equal(parseRevealDefinition({ kind: 'full_answer', requested }), undefined);
	}
});

test('reads the last data-reveal part', () => {
	assert.deepEqual(
		revealFromParts([
			{ type: 'data-reveal', data: { kind: 'hint' } },
			{ type: 'data-reveal', data: revealExample },
		]),
		revealExample,
	);
	assert.equal(revealFromParts([{ type: 'data-questionnaire', data: {} }]), undefined);
});

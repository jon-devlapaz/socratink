import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseRevealDefinition, revealExample, revealFromParts, revealFromReply } from '../src/reveal.ts';

describe('parseRevealDefinition', () => {
	for (const kind of ['hint', 'worked_example', 'partial', 'full_answer']) {
		it(`a ${kind} without a target`, () => assert.deepEqual(parseRevealDefinition({ kind }), { kind }));
	}
	for (const [name, raw, expected] of [
		['an explicit answer request', { kind: 'full_answer', requested: true }, { kind: 'full_answer', requested: true }],
		['a declined answer request', { kind: 'full_answer', requested: false }, { kind: 'full_answer', requested: false }],
		['a string requested flag', { kind: 'full_answer', requested: 'true' }, undefined],
		['a number requested flag', { kind: 'full_answer', requested: 1 }, undefined],
		['a null requested flag', { kind: 'full_answer', requested: null }, undefined],
		['the published example', revealExample, { kind: 'full_answer', target: 'Recover an admitted request after the response stream drops' }],
		['a padded Unicode target', { kind: 'hint', target: '  切線  ' }, { kind: 'hint', target: '切線' }],
		['an absent definition', undefined, undefined],
		['an empty record', {}, undefined],
		['an unknown kind', { kind: 'answer' }, undefined],
		['an extra property', { kind: 'full_answer', extra: true }, undefined],
		['a blank target', { kind: 'hint', target: '   ' }, undefined],
	]) {
		it(name, () => assert.deepEqual(parseRevealDefinition(raw), expected));
	}
	for (const length of [1, 2, 319, 320, 321]) {
		it(`a ${length}-character target`, () => {
			const mark = { kind: 'partial', target: 'x'.repeat(length) };
			assert.deepEqual(parseRevealDefinition(mark), length === 321 ? undefined : mark);
		});
	}
});

describe('revealFromParts', () => {
	const hint = { type: 'data-reveal', data: { kind: 'hint' } };
	for (const [name, parts, expected] of [
		['no parts', [], undefined],
		['an unrelated part', [{ type: 'data-questionnaire', data: {} }], undefined],
		['two marks', [hint, { type: 'data-reveal', data: revealExample }], revealExample],
		['a mark followed by text', [hint, { type: 'text', text: 'Try this.' }], { kind: 'hint' }],
		['a malformed final mark', [hint, { type: 'data-reveal', data: { kind: 'score' } }], undefined],
	]) {
		it(name, () => assert.deepEqual(revealFromParts(parts), expected));
	}
});

describe('revealFromReply', () => {
	for (const [name, data, expected] of [
		['no reply data', undefined, undefined],
		['no reveal writes', { reveal: [] }, undefined],
		['a later full answer after a hint', { reveal: [{ kind: 'hint' }, { kind: 'full_answer' }] }, { kind: 'full_answer' }],
		['a malformed final write after a hint', { reveal: [{ kind: 'hint' }, { kind: 'score' }] }, undefined],
	]) {
		it(name, () => assert.deepEqual(revealFromReply(data), expected));
	}
});

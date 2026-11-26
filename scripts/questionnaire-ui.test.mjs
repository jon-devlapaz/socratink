import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	formatQuestionnaireAnswers, parseQuestionnaireDefinition, questionnaireFromParts, questionnaireFromReplyData, sameQuestion,
} from '../src/questionnaire.ts';

const item = {
	name: 'path', prompt: 'How should we begin?', required: true, multiple: false,
	choices: [{ value: 'trace', label: 'Example trace', shortcut: '1' }, { value: 'puzzle', label: 'Puzzle' }],
	input: { label: 'Your reason', placeholder: 'Type a reason…' },
};
const card = { kind: 'question', submitLabel: 'Continue', items: [item] };
const withItem = (changes) => ({ ...card, items: [{ ...item, ...changes }] });

describe('parseQuestionnaireDefinition', () => {
	const choices = Array.from({ length: 9 }, (_, index) => ({ label: String(index), value: String(index) }));
	const freeform = { name: 'why', prompt: 'Why?', input: { label: 'Reason' } };
	for (const [name, raw, expected] of [
		['a complete card', card, card],
		['freeform input without choices', { ...card, items: [freeform] },
			{ ...card, items: [{ ...freeform, required: true, multiple: false, choices: [] }] }],
		['missing card kind and submit label', { items: [item] }, undefined],
		['an extra card field', { ...card, extra: true }, undefined],
		['zero items', { ...card, items: [] }, undefined],
		['two items', { ...card, kind: 'quiz', items: [item, { ...item, name: 'second' }] }, undefined],
		['a name starting with a digit', withItem({ name: '1-path' }), undefined],
		['no choices or freeform input', { ...card, items: [{ name: 'path', prompt: 'Which?' }] }, undefined],
		['duplicate choice values', withItem({ choices: [{ value: 'same', label: 'A' }, { value: 'same', label: 'B' }] }), undefined],
		['a multi-select quiz', { ...withItem({ multiple: true }), kind: 'quiz' }, { ...withItem({ multiple: true }), kind: 'quiz' }],
	]) {
		it(name, () => assert.deepEqual(parseQuestionnaireDefinition(raw), expected));
	}
	for (const count of [7, 8, 9]) {
		it(`a list of ${count} choices`, () => {
			const input = withItem({ choices: choices.slice(0, count) });
			assert.deepEqual(parseQuestionnaireDefinition(input), count === 9 ? undefined : input);
		});
	}
	const fields = [
		['submit label', 80, (text) => ({ ...card, submitLabel: text })],
		['item name', 64, (text) => withItem({ name: text })],
		['prompt', 320, (text) => withItem({ prompt: text })],
		['item description', 400, (text) => withItem({ description: text })],
		['choice value', 120, (text) => withItem({ choices: [{ label: 'Trace', value: text }] })],
		['choice label', 160, (text) => withItem({ choices: [{ label: text, value: 'trace' }] })],
		['choice description', 260, (text) => withItem({ choices: [{ label: 'Trace', value: 'trace', description: text }] })],
		['shortcut', 1, (text) => withItem({ choices: [{ label: 'Trace', value: 'trace', shortcut: text }] })],
		['freeform label', 160, (text) => withItem({ input: { label: text } })],
		['placeholder', 180, (text) => withItem({ input: { label: 'Why?', placeholder: text } })],
	];
	for (const [name, max, build] of fields) {
		for (const length of new Set([0, 1, 2, max - 1, max, max + 1])) {
			it(`a ${name} of length ${length}`, () => {
				const raw = build('x'.repeat(length));
				assert.deepEqual(parseQuestionnaireDefinition(raw), length > 0 && length <= max ? raw : undefined);
			});
		}
	}
});

describe('questionnaireFromReplyData', () => {
	for (const [name, data, expected] of [
		['no data', undefined, undefined], ['no writes', { questionnaire: [] }, undefined],
		['two cards', { questionnaire: [{ ...card, submitLabel: 'Before' }, card] }, card],
		['a malformed last card', { questionnaire: [card, { items: [] }] }, undefined],
	]) {
		it(name, () => assert.deepEqual(questionnaireFromReplyData(data), expected));
	}
});

describe('questionnaireFromParts', () => {
	const part = { type: 'data-questionnaire', data: card };
	for (const [name, parts, expected] of [
		['no parts', [], undefined],
		['text followed by a card', [{ type: 'text' }, part], card],
		['two cards mixed with text', [part, { type: 'text' }, { ...part, data: { ...card, submitLabel: 'Finish' } }],
			{ ...card, submitLabel: 'Finish' }],
		['a malformed last card', [part, { ...part, data: {} }], undefined],
	]) {
		it(name, () => assert.deepEqual(questionnaireFromParts(parts), expected));
	}
});

describe('formatQuestionnaireAnswers', () => {
	for (const [name, answers, answerText] of [
		['a choice and freeform reasoning', [{ name: 'path', values: ['trace'], freeform: 'I want a concrete example.' }], 'Example trace, I want a concrete example.'],
		['the learner skips', [{ name: 'path', values: [], skipped: true }], 'Skipped.'],
		['no answer for this item', [], 'Skipped.'],
		['a hint replaces a selection and reasoning', [{ name: 'path', values: ['trace'], freeform: 'ignored', help: 'hint' }], 'Asked for a hint.'],
		['the learner chooses unknown', [{ name: 'path', values: [], help: 'unknown' }], "I don't know."],
		['a stored value with no matching label', [{ name: 'path', values: ['記号'] }], '記号'],
		['multiple selected values', [{ name: 'path', values: ['puzzle', 'trace'] }], 'Puzzle, Example trace'],
	]) {
		it(name, () => {
			assert.equal(formatQuestionnaireAnswers(card, answers), `Questionnaire answers:\n- How should we begin?: ${answerText}`);
		});
	}
});

describe('sameQuestion', () => {
	it('accepts a different display order and shortcuts', () => {
		const choices = item.choices.toReversed().map(choice => ({ ...choice, shortcut: 'x' }));
		assert.equal(sameQuestion(card, withItem({ choices })), true);
	});
	for (const [name, changed] of [
		['absent card', undefined], ['different kind', { ...card, kind: 'quiz' }],
		['different prompt', withItem({ prompt: 'A different question?' })],
		['different description', withItem({ description: 'Assume nothing can leave the jar.' })],
		['multiple selections allowed', withItem({ multiple: true })], ['freeform input removed', withItem({ input: undefined })],
		['fewer choices', withItem({ choices: item.choices.slice(1) })],
		['different labels', withItem({ choices: item.choices.map(choice => ({ ...choice, label: 'Changed' })) })],
	]) {
		it(name, () => assert.equal(sameQuestion(card, changed), false));
	}
});

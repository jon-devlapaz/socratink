import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	formatSteeringMessage,
	steeringSaidText,
	turnSnippetToCopy,
} from '../src/ui/steering.ts';
const smaller = 'Steering: smaller step. The last turn moved too fast or assumed more footing than I have. Slow down to one smaller step, and check a missing assumption before continuing.';
const unaided = 'Steering: try unaided. I have enough footing. Withhold the next reveal and let me attempt the target.';

describe('formatSteeringMessage', () => {
	it('a smaller step', () => assert.equal(formatSteeringMessage('smaller-step'), smaller));
	it('an unaided attempt', () => assert.equal(formatSteeringMessage('try-unaided'), unaided));
});

describe('steeringSaidText', () => {
	for (const [name, text, expected] of [
		['a smaller step', smaller, 'Smaller step, please.'],
		['an unaided attempt', unaided, 'Let me try this unaided.'],
		['learner-authored text', 'Please explain it.', undefined],
		['a prefix without the instruction', 'Steering: try unaided.', undefined],
		['empty text', '', undefined],
	]) {
		it(name, () => assert.equal(steeringSaidText(text), expected));
	}
});

describe('turnSnippetToCopy', () => {
	for (const [name, source, selection, expected] of [
		['text selected', 'full turn text', '  the snippet  ', 'the snippet'],
		['only spaces selected', 'full turn text', '   ', 'full turn text'],
		['no selection', 'full turn text', undefined, 'full turn text'],
		['empty turn', '', undefined, ''],
	]) {
		it(name, () => assert.equal(turnSnippetToCopy(source, selection), expected));
	}
});

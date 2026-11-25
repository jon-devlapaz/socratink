import assert from 'node:assert/strict';
import test from 'node:test';
import {
	formatSteeringMessage,
	turnSnippetToCopy,
} from '../src/ui/steering.ts';
import { steeringPrefix } from '../src/config/chat-message.ts';

test('steering messages are prefixed learner turns, not capability claims', () => {
	assert.equal(
		formatSteeringMessage('smaller-step'),
		`${steeringPrefix} smaller step. The last turn moved too fast or assumed more footing than I have. Slow down to one smaller step, and check a missing assumption before continuing.`,
	);
	assert.equal(
		formatSteeringMessage('try-unaided'),
		`${steeringPrefix} try unaided. I have enough footing. Withhold the next reveal and let me attempt the target.`,
	);
});

test('copy uses a selected snippet when present, otherwise the whole turn', () => {
	assert.equal(turnSnippetToCopy('full turn text', '  the snippet  '), 'the snippet');
	assert.equal(turnSnippetToCopy('full turn text', '   '), 'full turn text');
	assert.equal(turnSnippetToCopy('full turn text'), 'full turn text');
});

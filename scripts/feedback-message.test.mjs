import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validFeedbackMessage } from '../src/config/feedback.ts';

describe('validFeedbackMessage', () => {
	for (const [name, message, expected] of [
		['an empty message', '', false],
		['one character', 'A', true],
		['one character below the limit', '💡'.repeat(4095), true],
		['4,096 Unicode code points', '💡'.repeat(4096), true],
		['one character above the limit', '💡'.repeat(4096) + 'a', false],
	]) {
		it(name, () => assert.equal(validFeedbackMessage(message), expected));
	}
});

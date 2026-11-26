import assert from 'node:assert/strict';
import test from 'node:test';
import { needsOneQuestionRewrite } from './one-question.ts';

// Failure cases (#163): two questions in one reply, a numbered diagnostic,
// text after the question, and a second retry; or a false alarm on a tag
// question, closing bold, code, a quote, or a reply with no question.
const rewrite = (assistantText: string, alreadyRetried = false) => needsOneQuestionRewrite({ assistantText, alreadyRetried });

test('two questions in one reply ask for a rewrite', () => {
	assert.equal(rewrite('…what color do you actually see it? And if the Sun were blue, would that match what you see?'), true);
	assert.equal(rewrite('Can you put the density rule in your own words? If it is less dense, what happens?'), true);
	assert.equal(rewrite('Quick diagnostic:\n1. What is light made of?\n2. What changes at sunset?'), true);
});

test('text after the question asks for a rewrite', () => {
	assert.equal(rewrite('**Question 1:** What happens inside the body after a vaccine? Walk me through it as far as you can.'), true);
});

test('one question that ends the reply does not', () => {
	assert.equal(rewrite('Light scatters. What color scatters most?'), false);
	assert.equal(rewrite('Which is denser, ice or water? Why or why not?'), false, 'a tag question belongs to the question before it');
	assert.equal(rewrite('Which is denser, **ice or water?**'), false, 'closing bold is not text after the question');
	assert.equal(rewrite('Run `x?.y` first.\n\n> Is it null?\n\nWhat did it print?'), false, 'code and quotes are not the tutor asking');
	assert.equal(rewrite('Density is mass divided by volume.'), false, 'a reply without a question is left to other checks');
});

test('a rewrite is asked for at most once', () => {
	assert.equal(rewrite('What floats? What sinks?', true), false);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { cardHintText } from './learner-text.ts';

test('a card Hint preserves one guiding question and removes the original answer prompt', () => {
	const prompt = 'Which line is steeper?';
	const question = 'How far does each line rise over the same distance?';
	const clue = 'Compare the rise over 2.5 units.';
	for (const [text, expected] of [
		[question, question],
		[`${clue} Question: Which line has the greatest slope?`, clue],
		[`${clue} ${question}`, `${clue} ${question}`],
		[`${question} ${prompt}`, question],
		[`${prompt} ${clue}`, clue],
		[prompt, ''],
		[`  **${prompt}**  `, ''],
		[`${clue}\n  ${prompt}`, clue],
		[`${clue} **Where does it start?** Where does it end? Take your time.`, clue],
		['Where does it start? Where does it end?', ''],
		['---', ''],
		[`---\n\n${prompt}`, ''],
	] as const) assert.equal(cardHintText(text, prompt), expected, text);

	const longPrompt = `Two lines cross. ${prompt}`;
	assert.equal(cardHintText(`${clue} ${longPrompt}`, longPrompt), clue);
});

test('an introduction to the exact card prompt goes with the repeated prompt', () => {
	const prompt = 'Which line is steeper?';
	const clue = 'Compare the rise.';
	const hints = [
		`${clue} **Question:** ${prompt}`,
		`${clue} Now try again: ${prompt}`,
	];
	assert.deepEqual(hints.map(hint => cardHintText(hint, prompt)), [clue, clue]);

	const guiding = `${clue} Now try again: How far does each line rise?`;
	const quoted = `Read the note: “${prompt}”`;
	assert.equal(cardHintText(guiding, prompt), guiding);
	assert.equal(cardHintText(quoted, prompt), quoted);
});

test('punctuation inside a clue remains intact', () => {
	const examples = [
		'Look at “rise?” and "run?" in the diagram. Use **both axes.**',
		"The diagram labels both axes with 'unknown?'.",
		'Compare `rise?.value` and `run?.value` at 2.5 units.',
		'Check the expression.\n\n```js\npoint?.rise / point?.run\n```',
	];
	for (const example of examples) {
		assert.equal(cardHintText(`${example}\n\nWhat changes? Why?`, 'Which line is steeper?'), example);
	}
});

test('the recorded payment Hint keeps both clue sentences with their original punctuation', () => {
	const clue = 'Hint: think about what the key is *for*. It exists to tell the processor "if I\'ve already run the thing under this key, give me the same result back instead of running it again."';
	const firstReply = clue + ' So the question is really: which follow-up is a re-run of the *same* logical operation, and which one should count as brand new?';
	const prompt = "Which request should reuse the first request's idempotency key?";
	assert.equal(cardHintText(firstReply, prompt), clue);
	assert.equal(cardHintText(firstReply + '\n\nGive it another go — which request reuses the first key?', prompt), clue);
});

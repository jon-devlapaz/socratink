import assert from 'node:assert/strict';
import test from 'node:test';
import { replyFrom } from '../src/config/chat-wire.ts';
import { isHelpThenQuestion, splitReasoning, withoutQuestionBesideCard } from '../src/learning/learner-text.ts';
import { initialProgress, progressEvents } from '../src/server/durable/browser-events.ts';
import { project } from '../src/server/durable/browser-projection.ts';
import { displayedAssistantTurn } from '../src/ui/chat-turns.ts';
import { createLiveReply } from '../src/ui/live-reply.ts';

// Every past leak, streamed one character at a time through the server
// projection and the live view, then settled. A row added here runs on both
// paths, which is how each of these leaked: fixed on one path, missed on the other.
const leaks = [
	['#25 a leading marker', '«STATION_IDENT» What do you notice?', '«', 'What do you notice?'],
	['#117 reasoning in closed think tags', '<think>Rayleigh scattering.</think>\n\nWhat do you notice at sunset?', 'Rayleigh', 'What do you notice at sunset?'],
	['#117 reasoning in an unclosed think tag', 'What do you notice?<think>The sky would look black.', 'black', 'What do you notice?'],
	['#116 a tool name in bookkeeping', 'What changes? (No mark_reveal needed, diagnostic only.) Try again.', 'mark_reveal', 'What changes? Try again.'],
	['#131 a literal "(no text)"', '(no text)', '(no text)', ''],
	['#136 a reveal note', 'Close. No answer shown. What happens to the key?', 'No answer shown', 'Close. What happens to the key?'],
	['#164 a present_question call written as text', 'Look at the middle element first.\n\n{"prompt":"After checking the middle element, what happens next?","choices":[{"label":"Search the left half only","value":"left_half_only"},{"label":"Recheck the full list","value":"full_list_recompare"}],"reasoning":true}', '"prompt"', 'Look at the middle element first.'],
	// Eval runs 45984402183 and 45948005835: tool inputs the retry and the filter missed.
	['a broken card input written as the whole reply', '{"note":"{"reasoning":true"}', 'note', ''],
	['a mark_reveal input written as the reply after See it', '{"target":"Why ice floats on water"}', 'target', ''],
	['a mark_reveal input written before the reveal', '{"kind":"full_answer","target":"Why ice floats"}  Ice is less dense than water.', 'full_answer', 'Ice is less dense than water.'],
	['a reveal note in the reply itself (first live eval wording)', 'What color would the sky look on the Moon?\n\nYour last reply only asked a question and supplied no target content, so no reveal was marked.', 'no reveal was marked', 'What color would the sky look on the Moon?'],
];

const learner = 'Synthetic question';
const question = { role: 'user', submissionId: 's1', text: learner };

function snapshot(raw, outcome) {
	const text = splitReasoning(raw).text;
	return project('c', { revision: raw.length, messages: [question, { role: 'assistant', submissionId: 's1', text }],
		submissions: [{ id: 's1', text: learner, ...(outcome ? { outcome } : {}) }] });
}

for (const [name, raw, hidden, shown] of leaks) {
	test(`${name} never reaches the learner, live or settled`, () => {
		const progress = initialProgress();
		const live = createLiveReply(learner);
		for (let end = 1; end <= raw.length; end += 1) {
			for (const event of progressEvents(snapshot(raw.slice(0, end)), progress)) live.apply(event);
			assert.equal(live.view().markdown.includes(hidden), false, `live view after ${JSON.stringify(raw.slice(0, end))}`);
		}
		assert.equal(live.view().markdown, shown, 'the live view ends on the settled text');
		const settled = displayedAssistantTurn({ text: replyFrom(snapshot(raw, 'completed'), 's1').text });
		assert.equal(settled?.text ?? '', shown);
	});
}

test('text beside a question card drops the questions it ends on and keeps the feedback (#163)', () => {
	const cases = [
		['Hint: each check cuts the candidates in half. How many times can you halve 1000…?', 'Hint: each check cuts the candidates in half.'],
		['Close! You ruled out A. What made you pick B? And why not C?', 'Close! You ruled out A.'],
		['Good thinking.\n\n**Question 1:** What happens inside the body after a vaccine?', 'Good thinking.'],
		['Which of these floats?', ''],
		['Good. Think about freezing: where do the molecules end up? Let me start with the first question:', 'Good.'],
		['Nice work. Here is the next one:', 'Nice work. Here is the next one:'],
		['Nice work. Pick the option that fits best.', 'Nice work. Pick the option that fits best.'],
		['Why does ice float? It is less dense than water.', 'Why does ice float? It is less dense than water.'],
		['', ''],
	];
	for (const [text, expected] of cases) assert.equal(withoutQuestionBesideCard(text), expected, text);
});

test('a reply gives help and then ends on its question only when the question comes last (#163)', () => {
	assert.equal(isHelpThenQuestion('Hint: look at the middle. Which half could hold it?'), true);
	assert.equal(isHelpThenQuestion('A hint: if the middle item is too small, what does that tell you about the left half?'), true);
	assert.equal(isHelpThenQuestion('Density decides it.\n\n**What happens to the ice?**\n'), true);
	assert.equal(isHelpThenQuestion('Look at the middle. Which half could hold it?\n\n(no reveal)'), true);
	assert.equal(isHelpThenQuestion('What do we know?'), false);
	assert.equal(isHelpThenQuestion('Here is a hint:'), false);
	assert.equal(isHelpThenQuestion('Why does ice float? It is less dense than water.'), false);
	assert.equal(isHelpThenQuestion(''), false);
});

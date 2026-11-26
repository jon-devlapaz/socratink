import assert from 'node:assert/strict';
import test from 'node:test';
import {
	displayLabel,
	displayedAssistantTurn,
	displayedLearnerTurn,
	groupEarlierSteps,
	questionsWithDrafts,
	splitCurrentTurns,
	visibleTurnsFromHistory,
} from '../src/ui/chat-turns.ts';
import { learnerVisibleText } from '../src/learning/learner-text.ts';
import { formatSteeringMessage } from '../src/ui/steering.ts';
import { formatQuestionnaireAnswers } from '../src/questionnaire.ts';

const questionnaire = {
	kind: 'question',
	submitLabel: 'Continue',
	items: [
		{
			name: 'path',
			prompt: 'How should we begin?',
			required: true,
			multiple: false,
			choices: [{ value: 'example', label: 'Worked example' }],
		},
	],
};

test('projects only visible learner and assistant turns from conversation history', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [],
		messages: [
			{
				display: 'visible',
				role: 'user',
				parts: [
					{ type: 'text', text: 'First' },
					{ type: 'text', text: 'Second' },
				],
			},
			{
				display: 'visible',
				role: 'assistant',
				parts: [
					{ type: 'text', text: '' },
					{ type: 'data-questionnaire', data: questionnaire },
				],
			},
			{
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'reasoning', text: 'not learner-facing' }],
			},
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'First\n\nSecond' },
		{ role: 'Assistant', text: '', questionnaire },
	]);
});

test('projects assistant tool calls from dynamic-tool parts', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [],
		messages: [
			{
				display: 'visible',
				role: 'assistant',
				parts: [
					{
						type: 'dynamic-tool',
						toolName: 'present_question',
						toolCallId: 'call_q',
						state: 'output-available',
						input: {},
						output: 'Question presented on the card.',
					},
					{ type: 'data-questionnaire', data: questionnaire },
				],
			},
		],
	});

	assert.deepEqual(turns, [
		{
			role: 'Assistant',
			text: '',
			questionnaire,
		},
	]);
});

test('keeps mark_reveal off the card and skips a reveal-only empty turn', () => {
	const reveal = { kind: 'worked_example', target: 'Recover an admitted request' };
	assert.deepEqual(
		visibleTurnsFromHistory({
			settlements: [],
			messages: [
				{
					display: 'visible',
					role: 'assistant',
					parts: [
						{ type: 'text', text: 'A stable submission identifier is evidence.' },
						{
							type: 'dynamic-tool',
							toolName: 'mark_reveal',
							toolCallId: 'call_reveal',
							state: 'output-available',
							input: reveal,
							output: 'Reveal recorded.',
						},
						{ type: 'data-reveal', data: reveal },
					],
				},
				{
					display: 'visible',
					role: 'assistant',
					parts: [
						{
							type: 'dynamic-tool',
							toolName: 'mark_reveal',
							toolCallId: 'call_quiet',
							state: 'output-available',
							input: { kind: 'hint' },
							output: 'Reveal recorded.',
						},
						{ type: 'data-reveal', data: { kind: 'hint' } },
					],
				},
			],
		}),
		[{ role: 'Assistant', text: 'A stable submission identifier is evidence.', reveal }],
	);
});

// Failure cases: the protocol header or the tutor's instruction shows as the
// learner's words; the answered question repeats inside the learner turn; the
// sent text changes, which breaks retry matching.
test('shows card answers and steering in the learner\'s own words', () => {
	const answer = 'Questionnaire answers:\n- How should we begin?: Worked example, I learn from cases';
	assert.deepEqual(displayedLearnerTurn(answer, questionnaire), {
		role: 'You',
		text: answer,
		learnerKind: 'questionnaire-reply',
		shownText: 'Worked example, I learn from cases',
	});
	assert.equal(displayedLearnerTurn('Questionnaire answers:\n- Path: Worked example').shownText, 'Path: Worked example');
	assert.equal(displayedLearnerTurn(formatSteeringMessage('smaller-step')).shownText, 'Smaller step, please.');
	assert.equal(displayedLearnerTurn(formatSteeringMessage('try-unaided')).shownText, 'Let me try this unaided.');
	assert.equal(displayedLearnerTurn(formatSteeringMessage('smaller-step')).text, formatSteeringMessage('smaller-step'));
	assert.equal(displayedLearnerTurn('Steering: an older wording').shownText, 'an older wording');
	assert.deepEqual(displayedLearnerTurn('My own words'), { role: 'You', text: 'My own words' });
});

test('only explicit Hint and Try on my own keep a draft attached to the same question', () => {
	const reply = (submissionId, question = questionnaire) => displayedAssistantTurn({ text: '', submissionId, questionnaire: question });
	const previous = reply('original');
	const same = reply('returned');
	const unaided = displayedLearnerTurn(formatSteeringMessage('try-unaided'));
	const hint = sourceId => displayedLearnerTurn('Help', questionnaire, { kind: 'hint', sourceId });
	const smaller = displayedLearnerTurn(formatSteeringMessage('smaller-step'));
	const textReply = displayedAssistantTurn({ text: 'What would you check first?' });
	assert.deepEqual(questionsWithDrafts([previous, hint('original'), same, unaided, reply('again')]),
		{ current: 'original', earlier: new Set() });
	const missingClue = reply('no-clue', { ...questionnaire, items: [{ ...questionnaire.items[0], description: 'Try Hint again.' }] });
	assert.deepEqual(questionsWithDrafts([previous, hint('original'), missingClue, unaided, same]),
		{ current: 'original', earlier: new Set() });
	for (const action of [smaller, displayedLearnerTurn('My answer'), hint('unrelated')]) {
		assert.deepEqual(questionsWithDrafts([previous, action, same]), { current: 'returned', earlier: new Set() });
	}
	assert.deepEqual(questionsWithDrafts([previous, unaided, textReply]), { current: undefined, earlier: new Set(['original']) });
	assert.deepEqual(questionsWithDrafts([previous, smaller, textReply]), { current: undefined, earlier: new Set() });
});

test('history pairs a card answer with the card it answers', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [],
		messages: [
			{ role: 'assistant', display: 'visible', parts: [{ type: 'data-questionnaire', data: questionnaire }] },
			{ role: 'user', display: 'visible', parts: [{ type: 'text', text: 'Questionnaire answers:\n- How should we begin?: Asked for a hint.' }] },
		],
	});
	assert.equal(turns.at(-1).shownText, 'Asked for a hint.');
});

test('dedupes only an adjacent failed or aborted learner retry with the same text', () => {
	const user = (id, text) => ({
		id,
		submissionId: id,
		display: 'visible',
		role: 'user',
		parts: [{ type: 'text', text }],
	});
	const turns = visibleTurnsFromHistory({
		settlements: [
			{ submissionId: 'aborted', outcome: 'aborted' },
		],
		messages: [
			user('aborted', 'same learner work'),
			user('retry', 'same learner work'),
		],
	});

	assert.deepEqual(turns, [{ role: 'You', text: 'same learner work' }]);
});

test('dedupes a contiguous aborted submission group with a partial assistant before its retry', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [{ submissionId: 'aborted', outcome: 'aborted' }],
		messages: [
			{
				id: 'aborted-user',
				submissionId: 'aborted',
				display: 'visible',
				role: 'user',
				parts: [{ type: 'text', text: 'same learner work' }],
			},
			{
				id: 'aborted-partial',
				submissionId: 'aborted',
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'text', text: 'partial reply' }],
			},
			{
				id: 'retry-user',
				submissionId: 'retry',
				display: 'visible',
				role: 'user',
				parts: [{ type: 'text', text: 'same learner work' }],
			},
			{
				id: 'retry-assistant',
				submissionId: 'retry',
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'text', text: 'complete reply' }],
			},
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'same learner work' },
		{ role: 'Assistant', text: 'complete reply' },
	]);
});

test('preserves a non-adjacent failed same-text attempt across another exchange', () => {
	const user = (id, text) => ({
		id,
		submissionId: id,
		display: 'visible',
		role: 'user',
		parts: [{ type: 'text', text }],
	});
	const assistant = {
		id: 'assistant',
		submissionId: 'unrelated',
		display: 'visible',
		role: 'assistant',
		parts: [{ type: 'text', text: 'unrelated reply' }],
	};
	const turns = visibleTurnsFromHistory({
		settlements: [{ submissionId: 'failed-old', outcome: 'failed' }],
		messages: [
			user('failed-old', 'same learner work'),
			user('unrelated', 'different learner work'),
			assistant,
			user('later-repeat', 'same learner work'),
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'same learner work' },
		{ role: 'You', text: 'different learner work' },
		{ role: 'Assistant', text: 'unrelated reply' },
		{ role: 'You', text: 'same learner work' },
	]);
});

test('splits the latest learner and closing reply into the current beat', () => {
	const turns = [
		{ role: 'Assistant', text: 'Earlier opening reply' },
		{ role: 'You', text: 'Earlier learner turn' },
		{ role: 'Assistant', text: 'Earlier reply' },
		{ role: 'You', text: 'Current learner turn' },
		{ role: 'Assistant', text: 'Current reply' },
	];

	assert.deepEqual(splitCurrentTurns(turns), {
		earlier: turns.slice(0, 3),
		current: turns.slice(3),
	});
	assert.deepEqual(splitCurrentTurns(turns.slice(0, 2)), {
		earlier: [],
		current: turns.slice(0, 2),
	});
});

test('groups earlier turns into learner-started steps', () => {
	const opening = { role: 'Assistant', text: 'Welcome' };
	const asked = { role: 'You', text: 'Earlier learner turn' };
	const replied = { role: 'Assistant', text: 'Earlier reply' };
	assert.deepEqual(groupEarlierSteps([opening, asked, replied]), [[opening], [asked, replied]]);
	assert.deepEqual(groupEarlierSteps([]), []);
});

for (const [role, label] of [['Assistant', 'Socratink'], ['You', 'You'], ['Error', 'Error']]) {
	test(`displayLabel for ${role}`, () => assert.equal(displayLabel(role), label));
}

test('a conversation with no replies keeps the learner turns current', () => {
	const turns = [{ role: 'You', text: 'Why?' }, { role: 'You', text: 'Can I try?' }];
	assert.deepEqual(splitCurrentTurns(turns), { earlier: [], current: turns });
});

test('an error closes the latest learner turn', () => {
	const first = { role: 'Assistant', text: 'Welcome' };
	const asked = { role: 'You', text: 'Why?' };
	const error = { role: 'Error', text: 'No reply' };
	assert.deepEqual(splitCurrentTurns([first, asked, error]), { earlier: [first], current: [asked, error] });
});

test('adjacent completed submissions retain the same learner words', () => {
	const message = (id) => ({ role: 'user', submissionId: id, parts: [{ type: 'text', text: 'Again?' }] });
	assert.deepEqual(visibleTurnsFromHistory({
		messages: [message('a'), message('b')],
		settlements: [{ submissionId: 'a', outcome: 'completed' }, { submissionId: 'b', outcome: 'completed' }],
	}), [{ role: 'You', text: 'Again?' }, { role: 'You', text: 'Again?' }]);
});

test('projects the routed model from assistant response metadata', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [],
		messages: [
			{
				display: 'visible',
				role: 'user',
				parts: [{ type: 'text', text: 'hello' }],
			},
			{
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'text', text: 'pong' }],
				metadata: {
					socratink: {
						requestedModel: 'auto',
						routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
					},
				},
			},
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'hello' },
		{
			role: 'Assistant',
			text: 'pong',
			modelRoute: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		},
	]);
});

test('skips marker-only assistant history rows after stripping', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [{ submissionId: 'sub-1', outcome: 'failed' }],
		messages: [
			{
				display: 'visible',
				role: 'user',
				submissionId: 'sub-1',
				parts: [{ type: 'text', text: 'hello' }],
			},
			{
				display: 'visible',
				role: 'assistant',
				submissionId: 'sub-1',
				parts: [{ type: 'text', text: '«STATION_IDENT»' }],
			},
		],
	});

	assert.deepEqual(turns, [{ role: 'You', text: 'hello' }]);
});

test('strips internal assistant markers before history is shown', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [],
		messages: [
			{
				display: 'visible',
				role: 'user',
				parts: [{ type: 'text', text: 'recovery-after-long' }],
			},
			{
				display: 'visible',
				role: 'assistant',
				parts: [{
					type: 'text',
					text: '«STATION_IDENT» (Just making sure we are on the same page!) Photosynthesis needs light.',
				}],
			},
		],
	});

	assert.equal(
		turns[1]?.text,
		'(Just making sure we are on the same page!) Photosynthesis needs light.',
	);
});

test('assistant text removes only parentheticals or sentences naming internal tools', () => {
	const cases = [
		['What changes? (No mark_reveal needed — this was a diagnostic question with no reveal.)', 'What changes?'],
		['Try again (recorded with mark_reveal). What changes?', 'Try again. What changes?'],
		['What changes? No mark_reveal is needed. Try again.', 'What changes? Try again.'],
		['I will use present_question now! What changes?', 'What changes?'],
		['What changes? (No mark_reveal needed (diagnostic).)', 'What changes?'],
		['What changes?\n\n(No `mark_reveal` needed.)', 'What changes?'],
		['Use a diagram (not a formula). What changes?', 'Use a diagram (not a formula). What changes?'],
		['A reveal can help. Tools can help too.', 'A reveal can help. Tools can help too.'],
		['The present_questionnaire field is data.', 'The present_questionnaire field is data.'],
	];
	for (const [text, expected] of cases) {
		assert.equal(learnerVisibleText(text), expected);
		assert.equal(displayedAssistantTurn({ text })?.text, expected);
		const history = visibleTurnsFromHistory({ settlements: [], messages: [
			{ role: 'assistant', display: 'visible', parts: [{ type: 'text', text }] },
		] });
		assert.equal(history[0]?.text, expected);
	}
	assert.equal(displayedAssistantTurn({ text: '(No mark_reveal needed.)' }), undefined);
});

test('a reply after Try once more shows only the question, never notes on the reveal (#136)', () => {
	const live = 'Alright, no answer shown.\n\nWhat happens to the light that reaches a tilted hemisphere?\n\n(no reveal — this was a question only)';
	const question = 'What happens to the light that reaches a tilted hemisphere?';
	const cases = [
		[live, question],
		['Okay, answer withheld. What would you check first?', 'What would you check first?'],
		['Not showing you the answer yet. Which way does the axis point?', 'Which way does the axis point?'],
		['Without revealing the answer, what do you notice?', 'Without revealing the answer, what do you notice?'],
		['No answer is perfect here. What would you try?', 'No answer is perfect here. What would you try?'],
		['A reveal can help later. What do you notice?', 'A reveal can help later. What do you notice?'],
	];
	for (const [text, expected] of cases) {
		assert.equal(learnerVisibleText(text), expected);
		const history = visibleTurnsFromHistory({ settlements: [], messages: [
			{ role: 'assistant', display: 'visible', parts: [{ type: 'text', text }] },
		] });
		assert.equal(history[0]?.text, expected);
	}
	assert.doesNotMatch(learnerVisibleText(live), /answer shown|no reveal/i);
});

test('learnerVisibleText removes stacked internal markers', () => {
	assert.equal(
		learnerVisibleText('«STATION_IDENT» «DEBUG_ONLY» Hello'),
		'Hello',
	);
	assert.equal(learnerVisibleText('No marker here.'), 'No marker here.');
});

test('a marked help action stays an action after reload and an unmarked answer keeps its words', () => {
	const card = { ...questionnaire, items: [{ ...questionnaire.items[0], prompt: 'Look at this list:\n1, 2, 3, 4\nWhich half do you search next?' }] };
	for (const [kind, words, label] of [
		['hint', 'Asked for a hint.', 'You asked for a hint'],
		['unknown', "I don't know.", 'You selected “I don’t know”'],
	]) {
		const cardHelp = { kind, sourceId: 'card-1' };
		const text = formatQuestionnaireAnswers(card, [{ name: 'path', values: [], help: kind }]);
		const typed = formatQuestionnaireAnswers(card, [{ name: 'path', values: [], freeform: words }]);
		assert.equal(typed, text);
		const action = displayedLearnerTurn(text, card, cardHelp);
		assert.equal(action.shownText, label);
		assert.equal(action.cardHelp, cardHelp);
		assert.equal(action.text, text);
		const saved = visibleTurnsFromHistory({
			settlements: [],
			messages: [
				{ role: 'assistant', parts: [{ type: 'data-questionnaire', data: card }] },
				{ role: 'user', metadata: { cardHelp }, parts: [{ type: 'text', text }] },
			],
		});
		assert.deepEqual(saved.at(-1), action);
		const unmarked = displayedLearnerTurn(typed, card);
		assert.equal(unmarked.shownText, words);
		assert.equal(unmarked.cardHelp, undefined);
	}
});

test('history keeps a failed help tap when the next submission has the same typed words', () => {
	const text = formatQuestionnaireAnswers(questionnaire, [{ name: 'path', values: [], help: 'hint' }]);
	const parts = [{ type: 'text', text }];
	const history = visibleTurnsFromHistory({
		settlements: [{ submissionId: 'first', outcome: 'failed' }],
		messages: [
			{ role: 'user', submissionId: 'first', metadata: { cardHelp: { kind: 'hint', sourceId: 'card-1' } }, parts },
			{ role: 'user', submissionId: 'second', parts },
		],
	});
	assert.deepEqual(history.map(turn => turn.cardHelp?.kind), ['hint', undefined]);
});

test('retries dedupe only when they used the same button on the same card', () => {
	const text = formatQuestionnaireAnswers(questionnaire, [{ name: 'path', values: [], help: 'hint' }]);
	const help = (submissionId, sourceId) => ({ role: 'user', submissionId,
		metadata: { cardHelp: { kind: 'hint', sourceId } }, parts: [{ type: 'text', text }] });
	const turns = visibleTurnsFromHistory({
		settlements: [{ submissionId: 'one', outcome: 'failed' }, { submissionId: 'two', outcome: 'failed' }],
		messages: [help('one', 'card-1'), help('two', 'card-2'), help('three', 'card-2')],
	});
	assert.deepEqual(turns.map(turn => turn.cardHelp.sourceId), ['card-1', 'card-2']);
});

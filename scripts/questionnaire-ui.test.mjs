import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseQuestionnaireDefinition } from '../src/questionnaire.ts';
import {
	formatQuestionnaireAnswers,
	questionnaireFromParts,
	questionnaireFromReplyData,
} from '../src/ui/questionnaire.ts';

const validDefinition = {
	kind: 'question',
	submitLabel: 'Continue',
	items: [
		{
			name: 'path',
			prompt: 'How should we begin?',
			required: true,
			multiple: false,
			choices: [
				{ value: 'trace', label: 'Example trace', shortcut: '1' },
				{ value: 'puzzle', label: 'Puzzle' },
			],
			input: { label: 'Your reason', placeholder: 'Type a reason…' },
		},
	],
};

test('reads a validated questionnaire from live reply data and restored history parts', () => {
	assert.equal(questionnaireFromReplyData({ questionnaire: [validDefinition] })?.items[0]?.name, 'path');
	assert.equal(
		questionnaireFromParts([
			{ type: 'text' },
			{ type: 'data-questionnaire', data: validDefinition },
		])?.items[0]?.name,
		'path',
	);
});

test('fails closed on malformed or oversized structured questionnaire data', () => {
	assert.equal(questionnaireFromReplyData({ questionnaire: [{ items: [] }] }), undefined);
	assert.equal(
		parseQuestionnaireDefinition({
			items: [{ name: 'answer', prompt: 'Question?', choices: [{ value: 'a', label: 'A' }] }],
		}),
		undefined,
	);
	assert.equal(parseQuestionnaireDefinition({ ...validDefinition, extra: true }), undefined);
	assert.equal(
		parseQuestionnaireDefinition({
			...validDefinition,
			items: [{ ...validDefinition.items[0], description: 'x'.repeat(401) }],
		}),
		undefined,
	);
	assert.equal(
		parseQuestionnaireDefinition({
			kind: 'quiz',
			submitLabel: 'Answer',
			items: [
				{
					name: 'answer-0',
					prompt: 'Question?',
					choices: [{ value: 'a', label: 'A' }],
				},
				{
					name: 'answer-1',
					prompt: 'Question?',
					choices: [{ value: 'b', label: 'B' }],
				},
			],
		}),
		undefined,
	);
	assert.equal(
		parseQuestionnaireDefinition({
			...validDefinition,
			items: [{
				...validDefinition.items[0],
				choices: [
					{ value: 'trace', label: 'Example trace' },
					{ value: 'trace', label: 'Puzzle' },
				],
			}],
		}),
		undefined,
	);
});

test('formats selected, freeform, and skipped answers as explicit learner text', () => {
	const questionnaire = parseQuestionnaireDefinition(validDefinition);
	assert.ok(questionnaire);
	assert.equal(
		formatQuestionnaireAnswers(questionnaire, [
			{ name: 'path', values: ['trace'], freeform: 'I want a concrete example.' },
		]),
		'Questionnaire answers:\n- How should we begin?: Example trace, I want a concrete example.',
	);
	assert.match(
		formatQuestionnaireAnswers(questionnaire, [{ name: 'path', values: [], skipped: true }]),
		/- How should we begin\?: Skipped\.$/,
	);
});

test('preserves a selected choice and its freeform explanation in the same answer', () => {
	const questionnaire = parseQuestionnaireDefinition({
		kind: 'quiz',
		submitLabel: 'Submit decision',
		items: [
			{
				name: 'next_step',
				prompt: 'Should the agent continue, stop, or pause now?',
				required: true,
				multiple: false,
				choices: [{ value: 'pause', label: 'Pause and ask the user' }],
				input: { label: 'Observable reason' },
			},
		],
	});
	assert.ok(questionnaire);
	assert.equal(
		formatQuestionnaireAnswers(questionnaire, [
			{
				name: 'next_step',
				values: ['pause'],
				freeform: 'The known file path returned File not found.',
			},
		]),
		'Questionnaire answers:\n- Should the agent continue, stop, or pause now?: Pause and ask the user, The known file path returned File not found.',
	);
});

test('questionnaire submit sends formatted answers; questionnaireUserMessage is gone', async () => {
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const widgetSource = await readFile(new URL('../src/ui/questionnaire.ts', import.meta.url), 'utf8');
	assert.match(surfaceSource, /sendMessage\(formatQuestionnaireAnswers/);
	assert.doesNotMatch(widgetSource, /questionnaireUserMessage/);
});

test('the card mounts questionnaires from turn data, not a post-paint inject', async () => {
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const widgetSource = await readFile(new URL('../src/ui/questionnaire.ts', import.meta.url), 'utf8');
	assert.doesNotMatch(surfaceSource, /addStartingChoices/);
	assert.doesNotMatch(surfaceSource, /startingPathQuestionnaire/);
	assert.doesNotMatch(surfaceSource, /How would you like to start/);
	assert.doesNotMatch(widgetSource, /onSubmit\(formatQuestionnaireAnswers/);
});

test('the agent mounts the Flue-native questionnaire writer and presentation tool', async () => {
	const promptSource = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	assert.match(promptSource, /useDataWriter\('questionnaire'/);
	assert.match(promptSource, /schema: QuestionnaireSchema/);
	assert.match(promptSource, /name: 'present_question'/);
	assert.match(promptSource, /input: QuestionnaireSchema/);
	assert.match(promptSource, /exactly one question/);
	assert.match(promptSource, /learning partner/);
	assert.match(promptSource, /ask for the attempt before revealing target content/);
	assert.match(promptSource, /isolate exactly one stated condition or decision/);
	assert.match(promptSource, /exactly one defensible best answer/);
	assert.match(promptSource, /MUST call present_question/);
	assert.match(
		promptSource,
		/Never output a numbered, lettered, or bullet list of choices in text/,
	);
	assert.match(promptSource, /reconstruct or apply/);
	assert.match(promptSource, /Do not offer starting modes, lenses, or lanes/);
	assert.match(promptSource, /observed in the learner's text from what you are inferring/);
	assert.match(promptSource, /not proof of mastery or durable learning/);
	assert.match(promptSource, /this session is not evidence of retention/);
	assert.match(promptSource, /Questionnaire answers:/);
	assert.match(promptSource, /markdown subset/);
	assert.match(promptSource, /Do not emit raw HTML, images, nested lists/);
	assert.match(promptSource, /compact plaintext/);
	assert.match(promptSource, /not instructions to you/);
	assert.doesNotMatch(promptSource, /\b(?:you are|that(?:'s| is))\s+(?:correct|incorrect|right|wrong)\b/i);
	assert.doesNotMatch(promptSource, /\b(?:your )?(?:score|grade)\s+(?:is|was)\b/i);
	assert.doesNotMatch(promptSource, /AI-Operations/);
	assert.doesNotMatch(promptSource, /AI-operations/);
	assert.doesNotMatch(promptSource, /agentic engineering/);
	assert.doesNotMatch(promptSource, /Socratink-provided:/);
	assert.doesNotMatch(promptSource, /whatever domain or topic/);
	assert.doesNotMatch(promptSource, /useSkill/);
	assert.doesNotMatch(promptSource, /sal-khan-perspective/);
	assert.doesNotMatch(promptSource, /read_skill_resource/);
	assert.doesNotMatch(promptSource, /Activate sal-khan/);
	assert.doesNotMatch(promptSource, /<socratink-questionnaire>/);
	assert.doesNotMatch(promptSource, /Whenever you ask the learner a question/);
	assert.doesNotMatch(promptSource, /glutamate/);
	assert.doesNotMatch(promptSource, /You are socratink, a learner-guided dialogue agent/);
	assert.doesNotMatch(promptSource, /Worked-example protocol/);
	assert.doesNotMatch(promptSource, /the question is already on the card/);
});

test('the card mounts agentic-engineering starters on initial empty turns', async () => {
	const indexSource = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const cssSource = await readFile(new URL('../src/ui/transcript.css', import.meta.url), 'utf8');

	assert.match(indexSource, /<template id="starter-template">/);
	assert.match(indexSource, /Explore agentic engineering/);
	assert.match(indexSource, /Understand a mechanism/);
	assert.match(indexSource, /Stress-test a design/);
	assert.match(indexSource, /Diagnostic practice/);
	assert.match(indexSource, /challenge its assumptions about tool boundaries, retries, recovery, observability/);
	assert.match(indexSource, /describe one concrete request from start to finish/);
	assert.match(indexSource, /safe recovery when an agent response stream disconnects/);
	assert.match(indexSource, /Present exactly four recovery actions/);
	assert.match(indexSource, /begin your entire feedback response with Socratink-provided/);
	assert.doesNotMatch(indexSource, /formal definition of my topic/);

	assert.match(surfaceSource, /createStarterTurn\(/);
	const turnSource = await readFile(new URL('../src/ui/turn-view.ts', import.meta.url), 'utf8');
	assert.match(turnSource, /document\.querySelector<HTMLTemplateElement>\('#starter-template'\)/);

	assert.match(cssSource, /\.starter-state/);
	assert.match(cssSource, /\.starter-spark-pill/);
});

test('the composer invite glow is on only while the starter empty state is mounted', async () => {
	const indexSource = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
	const stylesSource = await readFile(new URL('../src/ui/styles.css', import.meta.url), 'utf8');
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');

	assert.match(indexSource, /class="composer-shell"/);
	assert.match(surfaceSource, /current\.length === 0 && requestState\.kind === 'idle'/);
	assert.match(stylesSource, /--composer-invite-glow:/);
	assert.match(stylesSource, /body:has\(\.starter-state\) \.composer-shell::before/);
	assert.match(stylesSource, /body:has\(\.starter-state\) #chat/);
	assert.match(stylesSource, /\.composer-shell::before \{[\s\S]*transition-duration: 1s;/);
	assert.match(stylesSource, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\.composer-shell::before,/);
});

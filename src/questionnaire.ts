import * as v from 'valibot';

const boundedString = (maxLength: number) =>
	v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(maxLength));

const QuestionnaireChoiceSchema = v.strictObject({
	value: boundedString(120),
	label: boundedString(160),
	description: v.optional(boundedString(260)),
	shortcut: v.optional(boundedString(1)),
});

const QuestionnaireInputSchema = v.strictObject({
	label: boundedString(160),
	placeholder: v.optional(boundedString(180)),
});

const QuestionnaireItemSchema = v.pipe(
	v.strictObject({
		name: v.pipe(boundedString(64), v.regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/)),
		prompt: boundedString(320),
		description: v.optional(boundedString(400)),
		required: v.optional(v.boolean(), true),
		multiple: v.optional(v.boolean(), false),
		choices: v.optional(v.pipe(v.array(QuestionnaireChoiceSchema), v.maxLength(8)), []),
		input: v.optional(QuestionnaireInputSchema),
	}),
	v.check(
		(item) => item.choices.length > 0 || item.input !== undefined,
		'Each question needs at least one choice or a freeform input.',
	),
	v.check(
		(item) => new Set(item.choices.map((choice) => choice.value)).size === item.choices.length,
		'Choice values must be unique within a question.',
	),
);

const QuestionnaireSchema = v.strictObject({
	kind: v.picklist(['question', 'quiz', 'reveal-consent']),
	submitLabel: boundedString(80),
	items: v.pipe(v.array(QuestionnaireItemSchema), v.minLength(1), v.maxLength(1)),
});

export type QuestionnaireDefinition = v.InferOutput<typeof QuestionnaireSchema>;
export type QuestionnaireItem = QuestionnaireDefinition['items'][number];

const PresentQuestionChoiceSchema = v.union([
	boundedString(160),
	v.strictObject({
		label: boundedString(160),
		value: v.optional(boundedString(120)),
	}),
]);

// A choice worded like a help button would read back as a help request.
const helpLike = (choice: v.InferOutput<typeof PresentQuestionChoiceSchema>) =>
	Object.values(questionnaireHelpText).some((text) =>
		(typeof choice === 'string' ? choice : choice.label).trim().toLowerCase() === text.toLowerCase());

export const PresentQuestionInputSchema = v.strictObject({
	prompt: boundedString(320),
	choices: v.pipe(v.array(PresentQuestionChoiceSchema), v.minLength(2), v.maxLength(8),
		v.check((choices) => !choices.some(helpLike), 'A choice cannot repeat a help button; the card already offers Hint and I don\'t know.')),
	reasoning: v.optional(v.boolean()),
});

export type PresentQuestionInput = v.InferOutput<typeof PresentQuestionInputSchema>;

/** Where a present_question input written out as JSON text, not called,
 * begins: an object opening on one of its keys (#164). */
export const presentQuestionJson = /\{\s*"(?:prompt|choices)"\s*:/u;

export const presentQuestionExample = {
	prompt: 'Which recovery action should the client take first?',
	choices: ['Recheck the admitted request', 'Send the same message again'],
	reasoning: true,
} as const satisfies PresentQuestionInput;

export function parseQuestionnaireDefinition(
	value: unknown,
): QuestionnaireDefinition | undefined {
	const result = v.safeParse(QuestionnaireSchema, value);
	return result.success ? result.output : undefined;
}

export function questionnaireFromPresentQuestion(
	input: PresentQuestionInput,
): QuestionnaireDefinition {
	const used = new Set<string>();
	const choices = input.choices.map((choice) => {
		const label = typeof choice === 'string' ? choice : choice.label;
		const requested = typeof choice === 'string' ? undefined : choice.value;
		const value =
			requested && !used.has(requested) ? requested : uniqueChoiceValue(label, used);
		used.add(value);
		return { value, label };
	});
	return {
		kind: 'question',
		submitLabel: 'Submit',
		items: [
			{
				name: 'item',
				prompt: input.prompt,
				required: true,
				multiple: false,
				choices,
				...(input.reasoning ? { input: { label: 'Your reasoning' } } : {}),
			},
		],
	};
}

function uniqueChoiceValue(label: string, used: ReadonlySet<string>): string {
	const base =
		label
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 120) || 'choice';
	if (!used.has(base)) return base;
	for (let index = 2; ; index += 1) {
		const suffix = `-${index}`;
		const value = `${base.slice(0, 120 - suffix.length)}${suffix}`;
		if (!used.has(value)) return value;
	}
}

const QuestionnaireHelpSchema = v.picklist(['hint', 'unknown']);
export type QuestionnaireHelp = v.InferOutput<typeof QuestionnaireHelpSchema>;

const CardHelpActionSchema = v.strictObject({
	kind: QuestionnaireHelpSchema,
	sourceId: v.pipe(v.string(), v.regex(/\S/)),
});
export type CardHelpAction = v.InferOutput<typeof CardHelpActionSchema>;

export function isCardHelpAction(value: unknown): value is CardHelpAction {
	return v.is(CardHelpActionSchema, value);
}

export type QuestionnaireAnswer = {
	name: string;
	values: string[];
	freeform?: string;
	skipped?: boolean;
	/** The learner asked the card for help instead of answering. */
	help?: QuestionnaireHelp;
};

const questionnaireHelpText: Record<QuestionnaireHelp, string> = {
	hint: 'Asked for a hint.',
	unknown: "I don't know.",
};

export function questionnaireFromReplyData(
	data: Record<string, unknown[]> | undefined,
): QuestionnaireDefinition | undefined {
	const writes = data?.[questionnaireDataName];
	return writes?.length ? parseQuestionnaireDefinition(writes.at(-1)) : undefined;
}

export function questionnaireFromParts(
	parts: readonly { type: string; data?: unknown }[],
): QuestionnaireDefinition | undefined {
	const part = parts.findLast((candidate) => candidate.type === `data-${questionnaireDataName}`);
	return part ? parseQuestionnaireDefinition(part.data) : undefined;
}

const questionnaireDataName = 'questionnaire';
export const questionnaireAnswerPrefix = 'Questionnaire answers:';
export const questionnaireToolName = 'present_question';

export function isQuestionnaireTool(name: string): boolean {
	return name === questionnaireToolName;
}

export function formatQuestionnaireAnswers(
	definition: QuestionnaireDefinition,
	answers: QuestionnaireAnswer[],
): string {
	const byName = new Map(answers.map((answer) => [answer.name, answer]));
	const lines = definition.items.map((item) => {
		const answer = byName.get(item.name);
		if (answer?.help) return `- ${item.prompt}: ${questionnaireHelpText[answer.help]}`;
		if (!answer || answer.skipped) return `- ${item.prompt}: Skipped.`;
		const labels = answer.values.map(
			(value) => item.choices.find((choice) => choice.value === value)?.label ?? value,
		);
		if (answer.freeform) labels.push(answer.freeform);
		return `- ${item.prompt}: ${labels.join(', ')}`;
	});
	return `${questionnaireAnswerPrefix}\n${lines.join('\n')}`;
}

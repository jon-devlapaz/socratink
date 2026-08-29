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

export const QuestionnaireSchema = v.pipe(
	v.strictObject({
		kind: v.picklist(['question', 'quiz']),
		submitLabel: boundedString(80),
		items: v.pipe(v.array(QuestionnaireItemSchema), v.minLength(1), v.maxLength(1)),
	}),
	v.check(
		(questionnaire) =>
			new Set(questionnaire.items.map((item) => item.name)).size === questionnaire.items.length,
		'Question names must be unique.',
	),
);

export type QuestionnaireDefinition = v.InferOutput<typeof QuestionnaireSchema>;
export type QuestionnaireItem = QuestionnaireDefinition['items'][number];

export function parseQuestionnaireDefinition(
	value: unknown,
): QuestionnaireDefinition | undefined {
	const result = v.safeParse(QuestionnaireSchema, value);
	return result.success ? result.output : undefined;
}

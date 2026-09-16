import * as v from 'valibot';

export const inkToolName = 'ink_express';
export const inkDataName = 'ink';
export const InkCueSchema = v.strictObject({
	expression: v.picklist(['rest', 'question', 'connect', 'explain']),
});
export type InkCue = v.InferOutput<typeof InkCueSchema>;
export type InkExpression = InkCue['expression'];
export const inkToolDescription =
	'Choose a quiet visual cue for the current interaction: rest (neutral ink), question (a question), connect (relating ideas), explain (asking the learner to explain in their own words). Cosmetic only: never a score, judgment, mastery, or progress signal. Does not replace text or present_question. Continue the response after this tool.';
export function parseInkCue(input: unknown): InkCue | undefined {
	const result = v.safeParse(InkCueSchema, input);
	return result.success ? result.output : undefined;
}
export function inkCueFromParts(
	parts: readonly { type: string; data?: unknown }[],
): InkCue | undefined {
	const part = parts.findLast((part) => part.type === `data-${inkDataName}`);
	return part ? parseInkCue(part.data) : undefined;
}
export function inkCueFromReply(
	data: Record<string, unknown[]> | undefined,
): InkCue | undefined {
	return parseInkCue(data?.[inkDataName]?.at(-1));
}

// Request state owns pending/error semantics; cosmetic model output cannot
// override it. Only a settled current reply can supply the idle expression.
export function expressionForInteraction(input: {
	idle: boolean;
	composing: boolean;
	assistant?: { ink?: InkCue; questionnaire?: unknown };
}): InkExpression {
	if (!input.idle) return 'rest';
	if (input.composing) return 'explain';
	if (input.assistant?.questionnaire) return 'question';
	return input.assistant?.ink?.expression ?? 'rest';
}

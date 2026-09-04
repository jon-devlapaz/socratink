import * as v from 'valibot';

const boundedString = (maxLength: number) =>
	v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(maxLength));

export const revealToolName = 'mark_reveal';
export const revealDataName = 'reveal';

export const RevealSchema = v.strictObject({
	kind: v.picklist(['hint', 'worked_example', 'partial', 'full_answer']),
	target: v.optional(boundedString(320)),
});

export type RevealDefinition = v.InferOutput<typeof RevealSchema>;

export const revealExample = {
	kind: 'full_answer',
	target: 'Recover an admitted request after the response stream drops',
} as const satisfies RevealDefinition;

export const revealToolDescription =
	'Record that this turn supplied a hint, worked example, partial solution, or full answer. Call it in the same turn as that reveal. Do not use it for ordinary questions or feedback. Input is {"kind":"full_answer","target":"Recover an admitted request after the response stream drops"}.';

export function parseRevealDefinition(value: unknown): RevealDefinition | undefined {
	const result = v.safeParse(RevealSchema, value);
	return result.success ? result.output : undefined;
}

export function revealFromParts(
	parts: readonly { type: string; data?: unknown }[],
): RevealDefinition | undefined {
	const part = parts.findLast((candidate) => candidate.type === `data-${revealDataName}`);
	return part ? parseRevealDefinition(part.data) : undefined;
}

export function isRevealTool(name: string): boolean {
	return name === revealToolName;
}

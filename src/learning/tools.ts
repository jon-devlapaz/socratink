import { createHash } from 'node:crypto';
import * as v from 'valibot';
import { toJsonSchema } from '@valibot/to-json-schema';
import { PresentQuestionInputSchema, questionnaireFromPresentQuestion } from '../questionnaire.ts';
import { RevealSchema, revealToolDescription, revealToolName } from '../reveal.ts';
import { presentQuestionToolDescription, presentQuestionToolName } from './present-question.ts';

export const learningToolDefinitions = [
	{ name: presentQuestionToolName, description: presentQuestionToolDescription,
		parameters: toJsonSchema(PresentQuestionInputSchema, { errorMode: 'ignore' }) },
	{ name: revealToolName, description: revealToolDescription,
		parameters: toJsonSchema(RevealSchema, { errorMode: 'ignore' }) },
];

export function executeLearningTool(name: string, args: unknown): {
	output: string; data: Record<string, unknown[]>; terminate: boolean;
} {
	if (name === presentQuestionToolName) {
		const input = v.parse(PresentQuestionInputSchema, args);
		const questionnaire = questionnaireFromPresentQuestion(input);
		const item = questionnaire.items[0]!;
		const labels = item.choices.map((choice) => choice.label);
		const ranked = item.choices.map((choice, index) => ({
			choice,
			last: /^(?:all of the above|none of the above|none of these)[.!]?$/iu.test(choice.label),
			rank: createHash('sha256').update(JSON.stringify([input.prompt, labels, index])).digest('hex'),
		}));
		ranked.sort((a, b) => Number(a.last) - Number(b.last)
			|| (a.last ? 0 : a.rank.localeCompare(b.rank)));
		item.choices = ranked.map(({ choice }) => choice);
		return { output: 'Question presented on the card.',
			data: { questionnaire: [questionnaire] }, terminate: true };
	}
	if (name === revealToolName) {
		return { output: 'Reveal recorded.', data: { reveal: [v.parse(RevealSchema, args)] }, terminate: false };
	}
	throw new Error(`Unknown tool: ${name}`);
}

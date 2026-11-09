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
		return { output: 'Question presented on the card.',
			data: { questionnaire: [questionnaireFromPresentQuestion(input)] }, terminate: true };
	}
	if (name === revealToolName) {
		return { output: 'Reveal recorded.', data: { reveal: [v.parse(RevealSchema, args)] }, terminate: false };
	}
	throw new Error(`Unknown tool: ${name}`);
}

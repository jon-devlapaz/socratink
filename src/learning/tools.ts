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

export function executeLearningTool(name: string, args: unknown, callId: string): {
	output: string; data: Record<string, unknown[]>; terminate: boolean;
} {
	if (name === presentQuestionToolName) {
		const input = v.parse(PresentQuestionInputSchema, args);
		const questionnaire = questionnaireFromPresentQuestion(input);
		const item = questionnaire.items[0]!;
		if (!callId.trim()) throw new Error('Question presentation requires a tool call ID');
		const ranked = item.choices.map((choice, index) => ({
			choice,
			last: /^(?:all of the above|none of the above|none of these)[.!]?$/iu.test(choice.label),
			rank: createHash('sha256').update(JSON.stringify([callId, index])).digest('hex'),
		}));
		ranked.sort((a, b) => Number(a.last) - Number(b.last)
			|| (a.last ? 0 : a.rank.localeCompare(b.rank)));
		item.choices = ranked.map(({ choice }, index) => ({ ...choice, shortcut: String.fromCharCode(65 + index) }));
		return { output: `Question presented on the card. Choices in displayed order:\n${item.choices
			.map((choice) => `${choice.shortcut}. ${choice.label}`).join('\n')}`, 
			data: { questionnaire: [questionnaire] }, terminate: true };
	}
	if (name === revealToolName) {
		return { output: 'Reveal recorded.', data: { reveal: [v.parse(RevealSchema, args)] }, terminate: false };
	}
	throw new Error(`Unknown tool: ${name}`);
}

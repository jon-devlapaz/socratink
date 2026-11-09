import {
	observe,
	type AgentResponseToolCall,
	type LlmAssistantMessage,
} from '@flue/runtime';
import { presentQuestionExample, questionnaireToolName } from '../questionnaire.ts';

export const presentQuestionToolName = questionnaireToolName;
export const presentQuestionSignalType = presentQuestionToolName;

const presentQuestionExampleJson = JSON.stringify(presentQuestionExample);

export const presentQuestionToolDescription =
	`Box exactly one question on the card when the learner must choose among two or more defined options. Do not call it for open-ended reasoning. Do not list those options in markdown. Input is ${presentQuestionExampleJson}.`;

export const presentQuestionRetryBodies = {
	invalid: `present_question failed validation. Call it with this shape only: ${presentQuestionExampleJson}. One prompt, two to eight choices, optional reasoning. Do not list the choices in markdown.`,
	unboxed: `Those options must be boxed with present_question. Do not list choices in markdown. Call present_question now with ${presentQuestionExampleJson}.`,
} as const;

export type PresentQuestionRetryReason = keyof typeof presentQuestionRetryBodies;

const lastAssistantText = new Map<string, { text: string; submissionId?: string }>();
let textCaptureInstalled = false;

export function looksLikeUnboxedChoices(text: string): boolean {
	const source = text.trim();
	if (!source) return false;
	const lettered = countMatches(source, /^( {0,3})[A-D][.)]\s+\S/gm);
	if (lettered >= 2) return true;
	const items = countMatches(source, /^( {0,3})(?:[-*+]|\d{1,9}[.)])[ \t]+\S/gm);
	if (items < 2 || items > 8) return false;
	return /\b(?:which|choose|pick|select|would you rather|do you want)\b/i.test(source);
}

function countMatches(source: string, pattern: RegExp): number {
	return [...source.matchAll(pattern)].length;
}

export function presentQuestionRetryReason(input: {
	readonly toolCalls: readonly Pick<AgentResponseToolCall, 'tool' | 'isError'>[];
	readonly assistantText: string;
	readonly alreadyRetried: boolean;
}): PresentQuestionRetryReason | undefined {
	if (input.alreadyRetried) return undefined;
	const calls = input.toolCalls.filter((call) => call.tool === presentQuestionToolName);
	if (calls.some((call) => !call.isError)) return undefined;
	if (calls.some((call) => call.isError)) return 'invalid';
	if (looksLikeUnboxedChoices(input.assistantText)) return 'unboxed';
	return undefined;
}

export function takeAssistantText(instanceId: string): string {
	const captured = lastAssistantText.get(instanceId);
	lastAssistantText.delete(instanceId);
	return captured?.text ?? '';
}

export function installPresentQuestionTextCapture(): void {
	if (textCaptureInstalled) return;
	textCaptureInstalled = true;
	observe((event, ctx) => {
		const instanceId = ctx.id || event.instanceId || event.conversationId;
		if (!instanceId) return;
		// Failed or aborted deliveries may never reach the consuming finish hook.
		if (event.type === 'submission_settled') {
			if (lastAssistantText.get(instanceId)?.submissionId === event.submissionId) {
				lastAssistantText.delete(instanceId);
			}
			return;
		}
		if (event.type !== 'turn' || event.purpose !== 'agent') return;
		lastAssistantText.set(instanceId, {
			text: assistantTextFromOutput(event.response.output),
			submissionId: event.submissionId,
		});
	});
}

function assistantTextFromOutput(output: LlmAssistantMessage | undefined): string {
	if (!output) return '';
	return output.content
		.filter((block) => block.type === 'text')
		.map((block) => block.text)
		.join('\n');
}

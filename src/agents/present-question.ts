import { observe, type LlmAssistantMessage } from '@flue/runtime';
export {
	looksLikeUnboxedChoices, presentQuestionRetryBodies, presentQuestionRetryReason,
	presentQuestionSignalType, presentQuestionToolDescription, presentQuestionToolName,
	type PresentQuestionRetryReason,
} from '../learning/present-question.ts';

const lastAssistantText = new Map<string, { text: string; submissionId?: string }>();
let textCaptureInstalled = false;

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

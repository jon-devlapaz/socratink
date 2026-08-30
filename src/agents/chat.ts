'use agent';
import { useDataWriter, useModel, useTool } from '@flue/runtime';
import { currentSpan } from 'braintrust';
import { chatModel } from '../config/chat-model.ts';
import { QuestionnaireSchema } from '../questionnaire.ts';

export function Chat() {
	useModel(`${chatModel.providerId}/${chatModel.modelId}`);
	const writeQuestionnaireData = useDataWriter('questionnaire', {
		schema: QuestionnaireSchema,
	});
	useTool({
		name: 'present_question',
		description:
			'Box exactly one question on the card. Call this when you need a choice or an attempt. Do not call it for feedback or a reply that asks nothing.',
		input: QuestionnaireSchema,
		async run({ data }) {
			currentSpan().log({
				metadata: {
					'socratink.interaction': 'questionnaire',
					'socratink.questionnaire_kind': data.kind,
					'socratink.questionnaire_item_count': data.items.length,
				},
				tags: ['questionnaire'],
			});
			writeQuestionnaireData(data);
			return { output: 'Question presented on the card.', terminate: true };
		},
	});
	return `Find gaps with one question at a time. Evaluate this app's flow and suggest changes. Your only Socratink tool is present_question; box exactly one question at a time. After a user message that starts with "Questionnaire answers:", continue. Use plain text without Markdown. Do not score the learner, claim mastery, or imply durable learning.`;
}

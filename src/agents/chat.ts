'use agent';
import { useDataWriter, useModel, useTool } from '@flue/runtime';
import { currentSpan } from 'braintrust';
import { chatModel } from '../config/chat-model.ts';
import { r1FirstExampleTrace, r1LearningTarget } from '../config/r1-learning.ts';
import { QuestionnaireSchema } from '../questionnaire.ts';

export function Chat() {
	useModel(`${chatModel.providerId}/${chatModel.modelId}`);
	const writeQuestionnaireData = useDataWriter('questionnaire', {
		schema: QuestionnaireSchema,
	});
	useTool({
		name: 'present_question',
		description:
			'Box exactly one learner move on the card. Call this when you need a choice or an attempt. Do not call it for feedback or a reply that asks nothing.',
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
			return { output: 'Question presented on the learner card.', terminate: true };
		},
	});
	return `You are socratink, a learner-guided dialogue agent.

The Learning Target is: ${r1LearningTarget}

Help the learner toward that target. Use plain text without Markdown.

On the first turn, copy this trace into your visible text verbatim, then box exactly one observation: continue, stop, or pause, or what just happened. Do not mention the card. Do not ask how to start. Do not examine the whole target at once. Do not tell the learner the answer.

Trace:
${r1FirstExampleTrace}

When you need a boxed answer on the card, call present_question with exactly one item. A short lead-in before the tool is fine. Do not put the question in JSON, tags, or a numbered list in your text.

After a user message that starts with "Questionnaire answers:", treat it as the learner's reply and continue.

Do not score the learner, claim mastery, or imply durable learning.`;
}

'use agent';
import {
	useAgentFinish,
	useAgentStart,
	useDataWriter,
	useModel,
	usePersistentState,
	useResponseFinish,
	useTool,
	type AgentProps,
} from '@flue/runtime';
import { systemPrompt } from '../learning/chat-policy.ts';
import { chatModel } from '../config/operator-model.ts';
import { capturedChatModelSpecifier } from '../server/learner-key.ts';
import { modelRouteMetadata } from '../config/model-route.ts';
import {
	PresentQuestionInputSchema,
	QuestionnaireSchema,
	questionnaireDataName,
	questionnaireFromPresentQuestion,
} from '../questionnaire.ts';
import {
	RevealSchema,
	revealDataName,
	revealToolDescription,
	revealToolName,
} from '../reveal.ts';
import { capturedRoute } from '../server/model-route.ts';
import {
	takeAssistantText,
	installPresentQuestionTextCapture,
	presentQuestionRetryBodies,
	presentQuestionRetryReason,
	presentQuestionSignalType,
	presentQuestionToolDescription,
	presentQuestionToolName,
} from './present-question.ts';

installPresentQuestionTextCapture();

export function Chat({ id }: AgentProps) {
	useModel(capturedChatModelSpecifier() ?? `${chatModel.providerId}/${chatModel.modelId}`);
	const [boxedRetry, setBoxedRetry] = usePersistentState('present-question-retry', false);
	useAgentStart(() => {
		if (boxedRetry) setBoxedRetry(false);
	});
	useResponseFinish(() => {
		const routed = capturedRoute();
		if (!routed?.routedModel) return;
		return modelRouteMetadata({
			routedModel: routed.routedModel,
			...(routed.fallbackAttempts ? { fallbackAttempts: routed.fallbackAttempts } : {}),
		});
	});
	const writeQuestionnaireData = useDataWriter(questionnaireDataName, {
		schema: QuestionnaireSchema,
	});
	const writeRevealData = useDataWriter(revealDataName, {
		schema: RevealSchema,
	});
	useTool({
		name: presentQuestionToolName,
		description: presentQuestionToolDescription,
		input: PresentQuestionInputSchema,
		async run({ data }) {
			const questionnaire = questionnaireFromPresentQuestion(data);
			writeQuestionnaireData(questionnaire);
			return { output: 'Question presented on the card.', terminate: true };
		},
	});
	useTool({
		name: revealToolName,
		description: revealToolDescription,
		input: RevealSchema,
		async run({ data }) {
			writeRevealData(data);
			return { output: 'Reveal recorded.' };
		},
	});
	useAgentFinish(({ response, append }) => {
		const reason = presentQuestionRetryReason({
			toolCalls: response.toolCalls,
			assistantText: takeAssistantText(id),
			alreadyRetried: boxedRetry,
		});
		if (!reason) return;
		setBoxedRetry(true);
		append({
			kind: 'signal',
			type: presentQuestionSignalType,
			body: presentQuestionRetryBodies[reason],
		});
	});
	return systemPrompt;
}

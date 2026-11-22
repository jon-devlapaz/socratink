import type { ChatModel } from '../config/chat-model.ts';
import { appConfig } from '../config/app.config.ts';
import { userIdFromConversationId } from '../config/session.ts';
import type { ModelConfig, ModelSelection } from '../server/durable/contract.ts';

export type InferenceRoute = 'gateway' | 'local';
export type InferenceStatus = { state: 'ready'; route: InferenceRoute } | { state: 'unconfigured' };

export class InferenceUnavailableError extends Error {
	constructor() { super('No model provider is configured.'); this.name = 'InferenceUnavailableError'; }
}

export function createInference(options: { operator: () => ChatModel | undefined }) {
	function operatorModel(): ChatModel {
		const operator = options.operator();
		if (!operator) throw new InferenceUnavailableError();
		return operator;
	}

	return {
		operatorStatus(): InferenceStatus {
			const operator = options.operator();
			if (!operator) return { state: 'unconfigured' };
			return { state: 'ready', route: operator.baseUrl === appConfig.vercelAiGatewayBaseUrl ? 'gateway' : 'local' };
		},
		async selection(): Promise<ModelSelection> {
			const operator = operatorModel();
			return { provider: operator.providerId, modelId: operator.modelId };
		},
		async resolveModel(conversationId: string): Promise<ModelConfig> {
			if (!userIdFromConversationId(conversationId)) throw new Error('Conversation must belong to a learner.');
			return modelConfig(operatorModel());
		},
	};
}

/** The request config for the operator's model: what a learner's turn and the
 * daily tutor probe both send. */
export function modelConfig(operator: ChatModel): ModelConfig {
	return { provider: operator.providerId, modelId: operator.modelId,
		apiKey: operator.apiKey, baseUrl: operator.baseUrl, reasoning: operator.reasoning,
		contextWindow: operator.contextWindow, maxTokens: operator.maxTokens,
		...(operator.fallbackModelIds?.length ? { fallbackModelIds: operator.fallbackModelIds } : {}) };
}

export type Inference = ReturnType<typeof createInference>;

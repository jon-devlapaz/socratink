import {
	chatProviderId,
	learnerChatRoute,
	parseLearnerChatSpecifier,
	specifierForLearnerChat,
	type ChatModel,
} from '../config/chat-model.ts';
import { appConfig } from '../config/app.config.ts';
import { userIdFromConversationId } from '../config/session.ts';
import type { AuthDb } from '../server/auth-db.ts';
import type { CredentialStore } from '../server/credentials.ts';
import type { ModelConfig, ModelSelection } from '../server/durable/contract.ts';
import { learnerChatStatusForUser } from './learner.ts';

/** Where a learner's next model call goes. */
export type InferenceRoute = 'learner-openai' | 'gateway' | 'local';
export type InferenceStatus = { state: 'ready'; route: InferenceRoute } | { state: 'unconfigured' };

export class InferenceUnavailableError extends Error {
	constructor() { super('No model provider is configured.'); this.name = 'InferenceUnavailableError'; }
}

/** One owner for model routing: the learner's own key first, then the operator.
 * A route the learner chose never falls back to the operator's key.
 */
export function createInference(options: {
	authDb: Pick<AuthDb, 'findAliasOwner'>;
	store: Pick<CredentialStore, 'hasUserKey' | 'getUserKey'>;
	operator: () => ChatModel | undefined;
}) {
	function operatorStatus(): InferenceStatus {
		const operator = options.operator();
		if (!operator) return { state: 'unconfigured' };
		return { state: 'ready', route: operator.baseUrl === appConfig.vercelAiGatewayBaseUrl ? 'gateway' : 'local' };
	}

	async function selection(userId: string, requested?: string): Promise<ModelSelection> {
		const route = learnerChatRoute(await learnerChatStatusForUser({ store: options.store, userId }), requested);
		if (route.kind !== 'operator') {
			const specifier = specifierForLearnerChat(route);
			const split = specifier.indexOf('/');
			return { provider: specifier.slice(0, split), modelId: specifier.slice(split + 1) };
		}
		const operator = options.operator();
		if (!operator) throw new InferenceUnavailableError();
		return { provider: operator.providerId, modelId: operator.modelId };
	}

	return {
		operatorStatus,
		selection,
		async status(userId: string): Promise<InferenceStatus> {
			const learner = await learnerChatStatusForUser({ store: options.store, userId });
			if (learner.kind === 'openai') return { state: 'ready', route: 'learner-openai' };
			return operatorStatus();
		},
		async resolveModel(conversationId: string, chosen?: ModelSelection): Promise<ModelConfig> {
			const originalId = userIdFromConversationId(conversationId);
			if (!originalId) throw new Error('Conversation must belong to a learner.');
			const userId = await options.authDb.findAliasOwner(originalId) ?? originalId;
			// A turn saved for a provider Socratink no longer offers follows today's route.
			const retired = chosen && chosen.provider !== chatProviderId
				&& !parseLearnerChatSpecifier(`${chosen.provider}/${chosen.modelId}`);
			const selected = chosen && !retired ? chosen : await selection(userId);
			const pick = parseLearnerChatSpecifier(`${selected.provider}/${selected.modelId}`);
			if (pick) {
				// Never store keys in Pi history or silently switch to the operator after revoke.
				return { provider: pick.kind, modelId: pick.modelId,
					apiKey: await options.store.getUserKey({ userId, name: pick.kind }) };
			}
			const operator = options.operator();
			if (!operator) throw new InferenceUnavailableError();
			if (selected.provider !== operator.providerId) throw new Error('Unsupported learner model.');
			return { ...selected, apiKey: operator.apiKey, baseUrl: operator.baseUrl,
				reasoning: operator.reasoning, contextWindow: operator.contextWindow, maxTokens: operator.maxTokens };
		},
	};
}

export type Inference = ReturnType<typeof createInference>;

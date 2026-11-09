import { chatAllowsAutoSelection, parseFreeLlmAutoModelId } from '../../config/chat-auto.ts';
import { parseLearnerChatSpecifier, type ChatModel } from '../../config/chat-model.ts';
import { userIdFromConversationId } from '../../config/session.ts';
import type { AuthDb } from '../auth-db.ts';
import type { CredentialStore } from '../credentials.ts';
import { specifierForStoredLearner } from '../learner-key.ts';
import type { ModelConfig, ModelSelection } from './contract.ts';

export function modelRouting(options: {
	authDb: AuthDb; store: CredentialStore; operator: () => ChatModel;
}) {
	async function selection(userId: string, requested?: string, requestedAuto?: string): Promise<ModelSelection> {
		const operator = options.operator();
		const specifier = await specifierForStoredLearner({ store: options.store, userId, operator, requested });
		const split = specifier.indexOf('/');
		const selected = { provider: specifier.slice(0, split), modelId: specifier.slice(split + 1) };
		const autoModel = selected.provider === operator.providerId && chatAllowsAutoSelection(operator.modelId)
			? parseFreeLlmAutoModelId(requestedAuto) : undefined;
		return { ...selected, ...(autoModel ? { autoModel } : {}) };
	}
	return {
		selection,
		async resolveModel(conversationId: string, chosen?: ModelSelection): Promise<ModelConfig> {
			const originalId = userIdFromConversationId(conversationId);
			if (!originalId) throw new Error('Conversation must belong to a learner.');
			const userId = await options.authDb.findAliasOwner(originalId) ?? originalId;
			const selected = chosen ?? await selection(userId);
			const operator = options.operator();
			if (selected.provider === operator.providerId) {
				return { ...selected, apiKey: operator.apiKey, baseUrl: operator.baseUrl,
					reasoning: operator.reasoning, contextWindow: operator.contextWindow, maxTokens: operator.maxTokens };
			}
			const pick = parseLearnerChatSpecifier(`${selected.provider}/${selected.modelId}`);
			if (!pick) throw new Error('Unsupported learner model.');
			// Never store keys in Pi history or silently switch to the operator after revoke.
			return { provider: pick.kind, modelId: pick.modelId,
				apiKey: await options.store.getUserKey({ userId, name: pick.kind }) };
		},
	};
}

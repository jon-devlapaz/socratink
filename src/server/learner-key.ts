import { AsyncLocalStorage } from 'node:async_hooks';
import { instrument } from '@flue/runtime';
import {
	specifierForLearnerChat,
	type ChatModel,
} from '../config/chat-model.ts';
import { userIdFromConversationId } from '../config/session.ts';
import { missingUserKeyError, UserKeyError, type CredentialStore } from './credentials.ts';

// Flue AuthContext has no user. Thread userId from the HTTP instance id
// (userId:nonce), not cookies, process.env, or Pi's provider-keyed store.
// Agent intercepts read ctx.instanceId. Session-scope conversationId is Flue's
// conv_* identity and cannot recover a learner.

export const openaiCredentialName = 'openai';

export const missingChatInstanceIdError = {
	type: 'missing_chat_instance_id',
	message: 'Chat agent intercept requires a namespaced instance id.',
} as const;

const learnerUser = new AsyncLocalStorage<string>();
const chatSpecifier = new AsyncLocalStorage<string>();
const instrumentationKey = Symbol.for('socratink.learner-key');

export type LearnerKeyStore = Pick<CredentialStore, 'getUserKey' | 'hasUserKey'>;

export function capturedLearnerUserId(): string | undefined {
	return learnerUser.getStore();
}

export function capturedChatModelSpecifier(): string | undefined {
	return chatSpecifier.getStore();
}

export function requireAgentInstanceUserId(instanceId: string | undefined): string {
	const userId = userIdFromConversationId(instanceId);
	if (!userId) throw new Error(missingChatInstanceIdError.message);
	return userId;
}

export function runWithLearnerKey<T>(instanceId: string | undefined, fn: () => T): T {
	const userId = userIdFromConversationId(instanceId);
	if (!userId) return fn();
	return learnerUser.run(userId, fn);
}

export function runWithChatSpecifier<T>(specifier: string, fn: () => T): T {
	return chatSpecifier.run(specifier, fn);
}

export async function specifierForStoredLearner(options: {
	store: Pick<CredentialStore, 'hasUserKey'>;
	userId: string;
	operator: Pick<ChatModel, 'providerId' | 'modelId'>;
}): Promise<string> {
	const connected = await options.store.hasUserKey({
		userId: options.userId,
		name: openaiCredentialName,
	});
	return specifierForLearnerChat(
		connected ? { kind: 'openai' } : { kind: 'operator' },
		options.operator,
	);
}

export async function resolveLearnerChatApiKey(options: {
	store?: LearnerKeyStore;
	credentialName?: string;
	operatorApiKey?: string;
}): Promise<{ auth: { apiKey: string | undefined } }> {
	if (!options.store) {
		return { auth: { apiKey: options.operatorApiKey } };
	}

	const userId = capturedLearnerUserId();
	if (!userId) throw new UserKeyError(missingUserKeyError);

	const apiKey = await options.store.getUserKey({
		userId,
		name: options.credentialName ?? openaiCredentialName,
	});
	return { auth: { apiKey } };
}

export function installLearnerKeyCapture(options: { store: LearnerKeyStore; operator: ChatModel }): void {
	try {
		instrument({
			key: instrumentationKey,
			observe() {},
			interceptor: async (operation, ctx, next) => {
				if (operation.type !== 'agent') return next();
				const userId = requireAgentInstanceUserId(ctx.instanceId);
				return runWithLearnerKey(ctx.instanceId, async () => {
					const specifier = await specifierForStoredLearner({
						store: options.store,
						userId,
						operator: options.operator,
					});
					return runWithChatSpecifier(specifier, next);
				});
			},
			dispose() {},
		});
	} catch (error) {
		if (!isInstrumentationAlreadyInstalled(error)) throw error;
	}
}

function isInstrumentationAlreadyInstalled(error: unknown): boolean {
	return error instanceof Error && error.name === 'InstrumentationAlreadyInstalledError';
}

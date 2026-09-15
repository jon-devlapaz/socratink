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
// Submission-scope agent intercepts omit conversationId; session-scope
// conversationId is Flue's conv_* identity, not the namespaced URL.

export const openaiCredentialName = 'openai';

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

export function learnerIdFromExecution(ctx: {
	readonly instanceId?: string;
	readonly conversationId?: string;
}): string | undefined {
	return ctx.instanceId ?? ctx.conversationId;
}

export function runWithLearnerKey<T>(conversationId: string | undefined, fn: () => T): T {
	const userId = userIdFromConversationId(conversationId);
	if (!userId) return fn();
	return learnerUser.run(userId, fn);
}

export function runWithChatSpecifier<T>(specifier: string, fn: () => T): T {
	return chatSpecifier.run(specifier, fn);
}

export async function specifierForStoredLearner(options: {
	store: Pick<CredentialStore, 'hasUserKey'>;
	userId: string | undefined;
	operator: Pick<ChatModel, 'providerId' | 'modelId'>;
}): Promise<string> {
	const connected = options.userId
		? await options.store.hasUserKey({
				userId: options.userId,
				name: openaiCredentialName,
			})
		: false;
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
				return runWithLearnerKey(learnerIdFromExecution(ctx), async () => {
					const specifier = await specifierForStoredLearner({
						store: options.store,
						userId: capturedLearnerUserId(),
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

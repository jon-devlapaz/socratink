import { AsyncLocalStorage } from 'node:async_hooks';
import { instrument, InstrumentationAlreadyInstalledError } from '@flue/runtime';
import {
	learnerChatRoute,
	formatLearnerChatSpecifier,
	parseLearnerChatSpecifier,
	specifierForLearnerChatFromStatus,
	type ChatModel,
	type LearnerChatStatus,
	type LearnerCredentialName,
} from '../config/chat-model.ts';
import { userIdFromConversationId } from '../config/session.ts';
import { missingUserKeyError, UserKeyError, type CredentialStore } from './credentials.ts';

// Flue AuthContext has no user. Thread userId from the HTTP instance id
// (userId:nonce), not cookies, process.env, or Pi's provider-keyed store.
// Agent intercepts read ctx.instanceId. Session-scope conversationId is Flue's
// conv_* identity and cannot recover a learner.

export const openaiCredentialName: LearnerCredentialName = 'openai';

export const openrouterCredentialName: LearnerCredentialName = 'openrouter';

export const missingChatInstanceIdError = {
	type: 'missing_chat_instance_id',
	message: 'Chat agent intercept requires a namespaced instance id.',
} as const;

const learnerUser = new AsyncLocalStorage<string>();
const chatSpecifier = new AsyncLocalStorage<string>();
const pendingChatPicks = new Map<string, string>();
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

export async function learnerChatStatusForUser(options: {
	store: Pick<CredentialStore, 'hasUserKey'>;
	userId: string;
}): Promise<LearnerChatStatus> {
	const [openai, openrouter] = await Promise.all([
		options.store.hasUserKey({
			userId: options.userId,
			name: openaiCredentialName,
		}),
		options.store.hasUserKey({
			userId: options.userId,
			name: openrouterCredentialName,
		}),
	]);
	return {
		kind: learnerChatRoute({ openai, openrouter }).kind,
		openai,
		openrouter,
	};
}

export function rememberConversationChatPick(
	instanceId: string | undefined,
	value: string | undefined | null,
): void {
	if (!instanceId) return;
	const pick = parseLearnerChatSpecifier(value);
	if (!pick) {
		pendingChatPicks.delete(instanceId);
		return;
	}
	pendingChatPicks.set(instanceId, formatLearnerChatSpecifier(pick));
}

export async function specifierForStoredLearner(options: {
	store: Pick<CredentialStore, 'hasUserKey'>;
	userId: string;
	operator: Pick<ChatModel, 'providerId' | 'modelId'>;
	requested?: string | null;
}): Promise<string> {
	const status = await learnerChatStatusForUser({
		store: options.store,
		userId: options.userId,
	});
	return specifierForLearnerChatFromStatus(status, options.operator, options.requested);
}

function consumeConversationChatPick(instanceId: string | undefined): string | undefined {
	if (!instanceId) return undefined;
	const requested = pendingChatPicks.get(instanceId);
	pendingChatPicks.delete(instanceId);
	return requested;
}

export async function resolveStoredLearnerApiKey(options: {
	store: LearnerKeyStore;
	name: LearnerCredentialName;
}): Promise<{ auth: { apiKey: string } }> {
	const userId = capturedLearnerUserId();
	if (!userId) throw new UserKeyError(missingUserKeyError);

	const apiKey = await options.store.getUserKey({
		userId,
		name: options.name,
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
						requested: consumeConversationChatPick(ctx.instanceId),
					});
					return runWithChatSpecifier(specifier, next);
				});
			},
			dispose() {},
		});
	} catch (error) {
		if (!(error instanceof InstrumentationAlreadyInstalledError)) throw error;
	}
}

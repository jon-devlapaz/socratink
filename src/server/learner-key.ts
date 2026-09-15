import { AsyncLocalStorage } from 'node:async_hooks';
import { instrument } from '@flue/runtime';
import { userIdFromConversationId } from '../config/session.ts';
import type { CredentialStore } from './credentials.ts';

// Flue AuthContext has no user. Thread userId from conversationId (userId:nonce),
// not cookies, process.env, or Pi's provider-keyed store.

export const chatCredentialName = 'chat';

const learnerUser = new AsyncLocalStorage<string>();
const instrumentationKey = Symbol.for('socratink.learner-key');

export type LearnerKeyStore = Pick<CredentialStore, 'getUserKey'>;

export function capturedLearnerUserId(): string | undefined {
	return learnerUser.getStore();
}

export function runWithLearnerKey<T>(conversationId: string | undefined, fn: () => T): T {
	const userId = userIdFromConversationId(conversationId);
	if (!userId) return fn();
	return learnerUser.run(userId, fn);
}

export async function resolveLearnerChatApiKey(options: {
	store?: LearnerKeyStore;
	credentialName?: string;
	operatorApiKey: string | undefined;
}): Promise<{ auth: { apiKey: string | undefined } }> {
	const userId = capturedLearnerUserId();
	if (!userId || !options.store) {
		return { auth: { apiKey: options.operatorApiKey } };
	}

	const apiKey = await options.store.getUserKey({
		userId,
		name: options.credentialName ?? chatCredentialName,
	});
	return { auth: { apiKey } };
}

export function installLearnerKeyCapture(): void {
	try {
		instrument({
			key: instrumentationKey,
			observe() {},
			interceptor: async (operation, ctx, next) => {
				if (operation.type !== 'agent') return next();
				return runWithLearnerKey(ctx.conversationId, next);
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

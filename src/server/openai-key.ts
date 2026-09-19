import type { Context, Hono, MiddlewareHandler } from 'hono';
import { appConfig } from '../config/app.config.ts';
import { unauthorizedChatError } from './chat-access.ts';
import { learnerChatStatusResponse } from './chat-route.ts';
import type { CredentialStore } from './credentials.ts';
import { openaiCredentialName } from './learner-key.ts';
import { sessionFromContext } from './session.ts';

export const invalidOpenaiKeyError = {
	type: 'invalid_openai_key',
	message: 'An OpenAI API key is required.',
} as const;

const maxOpenaiKeyLength = 512;

type OpenaiKeyStore = Pick<CredentialStore, 'hasUserKey' | 'updateUserKey' | 'deleteUserKey'>;

export function mountOpenaiKeyRoutes(
	app: Hono,
	options: {
		signed: MiddlewareHandler;
		store: OpenaiKeyStore;
	},
): void {
	app.use(appConfig.openaiKeyPath, options.signed);
	app.put(appConfig.openaiKeyPath, (context) => writeOpenaiKey(context, options));
	app.delete(appConfig.openaiKeyPath, (context) => clearOpenaiKey(context, options));
}

async function writeOpenaiKey(context: Context, options: { store: OpenaiKeyStore }) {
	const userId = sessionFromContext(context)?.userId;
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	const apiKey = await readPastedKey(context);
	if (!apiKey) return context.json({ error: invalidOpenaiKeyError }, 400);
	await options.store.updateUserKey({
		userId,
		name: openaiCredentialName,
		value: apiKey,
	});
	return learnerChatStatusResponse(context, options);
}

async function clearOpenaiKey(context: Context, options: { store: OpenaiKeyStore }) {
	const userId = sessionFromContext(context)?.userId;
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	await options.store.deleteUserKey({ userId, name: openaiCredentialName });
	return learnerChatStatusResponse(context, options);
}

async function readPastedKey(context: Context): Promise<string | undefined> {
	let body: unknown;
	try {
		body = await context.req.json();
	} catch {
		return undefined;
	}
	if (typeof body !== 'object' || body === null || !('apiKey' in body)) return undefined;
	if (typeof body.apiKey !== 'string') return undefined;
	const apiKey = body.apiKey.trim();
	if (!apiKey || apiKey.length > maxOpenaiKeyLength) return undefined;
	return apiKey;
}

import type { Context, Hono } from 'hono';
import { appConfig } from '../config/app.config.ts';
import {
	requireSignedSession,
	unauthorizedChatError,
} from './chat-access.ts';
import type { CredentialStore } from './credentials.ts';
import { openaiCredentialName } from './learner-key.ts';
import type { RateLimiter } from './rate-limit.ts';
import { readSessionUserId } from './session.ts';

export const invalidOpenaiKeyError = {
	type: 'invalid_openai_key',
	message: 'An OpenAI API key is required.',
} as const;

const maxOpenaiKeyLength = 512;

type OpenaiKeyStore = Pick<CredentialStore, 'hasUserKey' | 'updateUserKey' | 'deleteUserKey'>;

export function mountOpenaiKeyRoutes(
	app: Hono,
	options: {
		secret: string;
		rateLimiter: RateLimiter;
		store: OpenaiKeyStore;
	},
): void {
	app.use(
		appConfig.openaiKeyPath,
		requireSignedSession({
			secret: options.secret,
			rateLimiter: options.rateLimiter,
		}),
	);
	app.get(appConfig.openaiKeyPath, (context) => readOpenaiKey(context, options));
	app.put(appConfig.openaiKeyPath, (context) => writeOpenaiKey(context, options));
	app.delete(appConfig.openaiKeyPath, (context) => clearOpenaiKey(context, options));
}

async function readOpenaiKey(
	context: Context,
	options: { secret: string; store: OpenaiKeyStore },
) {
	const userId = await requireUser(context, options.secret);
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	const connected = await options.store.hasUserKey({
		userId,
		name: openaiCredentialName,
	});
	return context.json({ connected });
}

async function writeOpenaiKey(
	context: Context,
	options: { secret: string; store: OpenaiKeyStore },
) {
	const userId = await requireUser(context, options.secret);
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	const apiKey = await readPastedKey(context);
	if (!apiKey) return context.json({ error: invalidOpenaiKeyError }, 400);
	await options.store.updateUserKey({
		userId,
		name: openaiCredentialName,
		value: apiKey,
	});
	return context.json({ connected: true });
}

async function clearOpenaiKey(
	context: Context,
	options: { secret: string; store: OpenaiKeyStore },
) {
	const userId = await requireUser(context, options.secret);
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	await options.store.deleteUserKey({ userId, name: openaiCredentialName });
	return context.json({ connected: false });
}

async function requireUser(context: Context, secret: string): Promise<string | undefined> {
	return readSessionUserId(context, secret);
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

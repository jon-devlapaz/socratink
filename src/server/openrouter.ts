import type { Context, Hono, MiddlewareHandler } from 'hono';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { appConfig } from '../config/app.config.ts';
import {
	encodeOpenRouterPkceCookie,
	generateOpenRouterPkce,
	openRouterAuthorizationHref,
	openRouterCodeChallengeMethod,
	openRouterPkceCookieName,
	openRouterPkceMaxAgeSeconds,
	openRouterTokenUrl,
	parseOpenRouterPkceCookie,
} from '../config/openrouter.ts';
import { sessionUsesSecureCookie } from '../config/session.ts';
import { unauthorizedChatError } from './chat-access.ts';
import { learnerChatStatusResponse } from './chat-route.ts';
import type { CredentialStore } from './credentials.ts';
import { openrouterCredentialName } from './learner-key.ts';
import { sessionFromContext } from './session.ts';

export const invalidOpenRouterCallbackError = {
	type: 'invalid_openrouter_callback',
	message: 'OpenRouter did not return a usable authorization code.',
} as const;

export const missingOpenRouterPkceError = {
	type: 'missing_openrouter_pkce',
	message: 'Start OpenRouter connect from Socratink before finishing authorization.',
} as const;

export const foreignOpenRouterPkceError = {
	type: 'foreign_openrouter_pkce',
	message: 'This OpenRouter connect attempt does not belong to the current session.',
} as const;

export const openRouterOAuthFailedError = {
	type: 'openrouter_oauth_failed',
	message: 'OpenRouter did not mint an API key for this authorization.',
} as const;

const openRouterExchangeTimeoutMs = 30_000;

type OpenRouterStore = Pick<CredentialStore, 'hasUserKey' | 'updateUserKey' | 'deleteUserKey'>;

export type OpenRouterOAuthEndpoints = {
	authorizationUrl?: string;
	tokenUrl?: string;
};

export function mountOpenrouterRoutes(
	app: Hono,
	options: {
		signed: MiddlewareHandler;
		secret: string;
		store: OpenRouterStore;
		oauth?: OpenRouterOAuthEndpoints;
	},
): void {
	app.use(`${appConfig.openrouterPath}/*`, options.signed);
	app.use(appConfig.openrouterPath, options.signed);
	app.delete(appConfig.openrouterPath, (context) => clearOpenrouter(context, options));
	app.post(appConfig.openrouterConnectPath, (context) => startOpenrouter(context, options));
	app.get(appConfig.openrouterCallbackPath, (context) => finishOpenrouter(context, options));
}

async function clearOpenrouter(
	context: Context,
	options: { store: OpenRouterStore },
) {
	const userId = sessionFromContext(context)?.userId;
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	await options.store.deleteUserKey({ userId, name: openrouterCredentialName });
	return learnerChatStatusResponse(context, options);
}

async function startOpenrouter(
	context: Context,
	options: { secret: string; oauth?: OpenRouterOAuthEndpoints },
) {
	const userId = sessionFromContext(context)?.userId;
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	const { verifier, challenge } = await generateOpenRouterPkce();
	await writePkceCookie(context, options.secret, encodeOpenRouterPkceCookie(userId, verifier));
	const callbackUrl = new URL(appConfig.openrouterCallbackPath, requestOrigin(context)).href;
	return context.redirect(
		openRouterAuthorizationHref({
			callbackUrl,
			challenge,
			authorizationUrl: options.oauth?.authorizationUrl,
		}),
	);
}

async function finishOpenrouter(
	context: Context,
	options: {
		secret: string;
		store: OpenRouterStore;
		oauth?: OpenRouterOAuthEndpoints;
	},
) {
	const userId = sessionFromContext(context)?.userId;
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);

	const code = context.req.query('code')?.trim();
	if (!code) {
		clearPkceCookie(context);
		return context.json({ error: invalidOpenRouterCallbackError }, 400);
	}

	const pkce = parseOpenRouterPkceCookie(
		await signedPkceCookie(context, options.secret),
		userId,
	);
	clearPkceCookie(context);
	switch (pkce.kind) {
		case 'missing':
		case 'invalid':
			return context.json({ error: missingOpenRouterPkceError }, 400);
		case 'foreign':
			return context.json({ error: foreignOpenRouterPkceError }, 403);
		case 'ok': {
			const apiKey = await exchangeOpenRouterCode({
				code,
				verifier: pkce.verifier,
				tokenUrl: options.oauth?.tokenUrl ?? openRouterTokenUrl,
			});
			if (!apiKey) return context.json({ error: openRouterOAuthFailedError }, 502);
			await options.store.updateUserKey({
				userId,
				name: openrouterCredentialName,
				value: apiKey,
			});
			return context.redirect('/');
		}
		default: {
			const exhaustive: never = pkce;
			throw new Error(`Unexpected OpenRouter PKCE cookie: ${JSON.stringify(exhaustive)}`);
		}
	}
}

export async function exchangeOpenRouterCode(options: {
	code: string;
	verifier: string;
	tokenUrl: string;
}): Promise<string | undefined> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), openRouterExchangeTimeoutMs);
	try {
		const response = await fetch(options.tokenUrl, {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				code: options.code,
				code_verifier: options.verifier,
				code_challenge_method: openRouterCodeChallengeMethod,
			}),
			signal: controller.signal,
		});
		if (!response.ok) return undefined;
		const body: unknown = await response.json();
		if (typeof body !== 'object' || body === null || !('key' in body)) return undefined;
		if (typeof body.key !== 'string') return undefined;
		const apiKey = body.key.trim();
		return apiKey || undefined;
	} catch {
		return undefined;
	} finally {
		clearTimeout(timeout);
	}
}

async function signedPkceCookie(context: Context, secret: string): Promise<string | undefined> {
	const value = await getSignedCookie(context, secret, openRouterPkceCookieName);
	return typeof value === 'string' && value.length > 0 ? value : undefined;
}

async function writePkceCookie(context: Context, secret: string, value: string): Promise<void> {
	await setSignedCookie(context, openRouterPkceCookieName, value, secret, {
		path: '/',
		httpOnly: true,
		sameSite: 'Lax',
		secure: sessionUsesSecureCookie(process.env),
		maxAge: openRouterPkceMaxAgeSeconds,
	});
}

function clearPkceCookie(context: Context): void {
	deleteCookie(context, openRouterPkceCookieName, {
		path: '/',
		secure: sessionUsesSecureCookie(process.env),
	});
}

function requestOrigin(context: Context): string {
	return new URL(context.req.url).origin;
}

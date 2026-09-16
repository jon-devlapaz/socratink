export const openRouterAuthorizationUrl = 'https://openrouter.ai/auth';

export const openRouterTokenUrl = 'https://openrouter.ai/api/v1/auth/keys';

export const openRouterPkceCookieName = 'socratink-openrouter-pkce';

export const openRouterPkceMaxAgeSeconds = 10 * 60;

export const openRouterKeyLabel = 'Socratink';

export const openRouterCodeChallengeMethod = 'S256';

export async function generateOpenRouterPkce(): Promise<{ verifier: string; challenge: string }> {
	const verifierBytes = new Uint8Array(32);
	crypto.getRandomValues(verifierBytes);
	const verifier = base64UrlEncode(verifierBytes);
	const challenge = await sha256Base64Url(verifier);
	return { verifier, challenge };
}

export async function sha256Base64Url(value: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return base64UrlEncode(new Uint8Array(digest));
}

export function openRouterAuthorizationHref(options: {
	callbackUrl: string;
	challenge: string;
	authorizationUrl?: string;
}): string {
	const url = new URL(options.authorizationUrl ?? openRouterAuthorizationUrl);
	url.searchParams.set('callback_url', options.callbackUrl);
	url.searchParams.set('code_challenge', options.challenge);
	url.searchParams.set('code_challenge_method', openRouterCodeChallengeMethod);
	url.searchParams.set('key_label', openRouterKeyLabel);
	return url.href;
}

export function encodeOpenRouterPkceCookie(userId: string, verifier: string): string {
	return `${userId}:${verifier}`;
}

export function parseOpenRouterPkceCookie(
	value: string | undefined,
	userId: string,
): { kind: 'missing' } | { kind: 'invalid' } | { kind: 'foreign' } | { kind: 'ok'; verifier: string } {
	if (!value) return { kind: 'missing' };
	const separator = value.indexOf(':');
	if (separator <= 0) return { kind: 'invalid' };
	const cookieUserId = value.slice(0, separator);
	const verifier = value.slice(separator + 1);
	if (!verifier) return { kind: 'invalid' };
	if (cookieUserId !== userId) return { kind: 'foreign' };
	return { kind: 'ok', verifier };
}

function base64UrlEncode(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

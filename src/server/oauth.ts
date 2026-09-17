import type { Context, Hono } from 'hono';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import type { AuthConfig } from '../config/auth.ts';
import { sessionUsesSecureCookie } from '../config/session.ts';
import type { AuthDb } from './auth-db.ts';
import { clearGuestTurns } from './guest-turns.ts';
import { readSessionUserId, writeSessionCookie } from './session.ts';

const oauthStateCookieName = 'socratink-oauth-state';

type OAuthProvider = 'google' | 'github';

type OAuthStatePayload = {
	state: string;
	codeVerifier: string;
	provider: OAuthProvider;
};

type VerifiedIdentity = {
	providerUserId: string;
	email: string;
};

const googleConfig = {
	authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
	tokenUrl: 'https://oauth2.googleapis.com/token',
	userinfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
	scopes: 'openid email profile',
};

const githubConfig = {
	authorizeUrl: 'https://github.com/login/oauth/authorize',
	tokenUrl: 'https://github.com/login/oauth/access_token',
	userUrl: 'https://api.github.com/user',
	emailsUrl: 'https://api.github.com/user/emails',
	scopes: 'user:email',
};

function generateCodeVerifier(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Buffer.from(array).toString('base64url');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
	const data = new TextEncoder().encode(verifier);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return Buffer.from(hash).toString('base64url');
}

function generateState(): string {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Buffer.from(array).toString('hex');
}

export type GitHubEmail = Readonly<{
	email: string;
	primary: boolean;
	verified: boolean;
}>;

export function selectVerifiedGitHubEmail(emails: readonly GitHubEmail[]): string | undefined {
	const verified = emails.filter((entry) => entry.verified);
	return (
		verified.find((entry) => entry.primary && !isNoreplyEmail(entry.email))?.email
		?? verified.find((entry) => !isNoreplyEmail(entry.email))?.email
		?? verified[0]?.email
	);
}

function isNoreplyEmail(email: string): boolean {
	return email.toLowerCase().endsWith('@users.noreply.github.com');
}

async function writeOAuthState(
	context: Context,
	secret: string,
	payload: OAuthStatePayload,
): Promise<void> {
	await setSignedCookie(context, oauthStateCookieName, JSON.stringify(payload), secret, {
		path: '/',
		httpOnly: true,
		sameSite: 'Lax',
		secure: sessionUsesSecureCookie(process.env),
		maxAge: 600,
	});
}

async function readOAuthState(
	context: Context,
	secret: string,
): Promise<OAuthStatePayload | undefined> {
	const val = await getSignedCookie(context, secret, oauthStateCookieName);
	if (!val) return undefined;
	try {
		return JSON.parse(val) as OAuthStatePayload;
	} catch {
		return undefined;
	}
}

function clearOAuthState(context: Context): void {
	deleteCookie(context, oauthStateCookieName, {
		path: '/',
		secure: sessionUsesSecureCookie(process.env),
	});
}

export function mountOAuthRoutes(
	app: Hono,
	options: {
		config: AuthConfig;
		secret: string;
		authDb: AuthDb;
		onRekey: (guestUserId: string, durableUserId: string) => Promise<void>;
	},
): void {
	app.get('/api/auth/providers', (context) =>
		context.json({
			google: options.config.google !== undefined,
			github: options.config.github !== undefined,
		}),
	);
	if (options.config.google) {
		app.get('/api/auth/google/login', (c) => handleLogin(c, 'google', options));
		app.get('/api/auth/google/callback', (c) => handleCallback(c, 'google', options));
	}
	if (options.config.github) {
		app.get('/api/auth/github/login', (c) => handleLogin(c, 'github', options));
		app.get('/api/auth/github/callback', (c) => handleCallback(c, 'github', options));
	}
}

async function handleLogin(
	context: Context,
	provider: OAuthProvider,
	options: { config: AuthConfig; secret: string },
) {
	const providerConfig = options.config[provider]!;
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge(codeVerifier);

	await writeOAuthState(context, options.secret, { state, codeVerifier, provider });

	const redirectUri = `${options.config.redirectBaseUrl}/api/auth/${provider}/callback`;
	const authorizeUrl = new URL(
		provider === 'google' ? googleConfig.authorizeUrl : githubConfig.authorizeUrl,
	);

	authorizeUrl.searchParams.set('client_id', providerConfig.clientId);
	authorizeUrl.searchParams.set('redirect_uri', redirectUri);
	authorizeUrl.searchParams.set('response_type', 'code');
	authorizeUrl.searchParams.set('scope', provider === 'google' ? googleConfig.scopes : githubConfig.scopes);
	authorizeUrl.searchParams.set('state', state);
	authorizeUrl.searchParams.set('code_challenge', codeChallenge);
	authorizeUrl.searchParams.set('code_challenge_method', 'S256');

	return context.redirect(authorizeUrl.href);
}

async function handleCallback(
	context: Context,
	provider: OAuthProvider,
	options: {
		config: AuthConfig;
		secret: string;
		authDb: AuthDb;
		onRekey: (guestUserId: string, durableUserId: string) => Promise<void>;
	},
) {
	try {
		const stateParam = context.req.query('state');
		const codeParam = context.req.query('code');
		const errorParam = context.req.query('error');

		if (errorParam || !stateParam || !codeParam) {
			return context.redirect('/login.html?error=auth_failed');
		}

		const cookieState = await readOAuthState(context, options.secret);
		if (!cookieState || cookieState.state !== stateParam || cookieState.provider !== provider) {
			return context.redirect('/login.html?error=auth_failed');
		}

		const redirectUri = `${options.config.redirectBaseUrl}/api/auth/${provider}/callback`;
		const providerConfig = options.config[provider]!;
		const accessToken = await exchangeCodeForToken(provider, {
			code: codeParam,
			codeVerifier: cookieState.codeVerifier,
			redirectUri,
			clientId: providerConfig.clientId,
			clientSecret: providerConfig.clientSecret,
		});
		const identity = await identityResolvers[provider](accessToken);
		if (!identity) return context.redirect('/login.html?error=unverified_email');

		const guestUserId = await readSessionUserId(context, options.secret);
		const durableUserId = await resolveDurableUserId(options.authDb, {
			provider,
			providerUserId: identity.providerUserId,
			email: identity.email,
			guestUserId,
		});
		if (guestUserId && guestUserId !== durableUserId) {
			await options.authDb.createAlias(guestUserId, durableUserId);
			await options.onRekey(guestUserId, durableUserId);
		}
		await writeSessionCookie(context, durableUserId, options.secret, process.env);

		clearOAuthState(context);
		clearGuestTurns(context, process.env);

		return context.redirect('/');
	} catch (error) {
		console.error('OAuth callback failed:', error);
		return context.redirect('/login.html?error=auth_failed');
	}
}

type TokenExchangeParams = {
	code: string;
	codeVerifier: string;
	redirectUri: string;
	clientId: string;
	clientSecret: string;
};

async function exchangeCodeForToken(
	provider: OAuthProvider,
	params: TokenExchangeParams,
): Promise<string> {
	const tokenUrl = provider === 'google' ? googleConfig.tokenUrl : githubConfig.tokenUrl;
	const tokenRes = await fetch(tokenUrl, tokenRequests[provider](params));
	if (!tokenRes.ok) throw new Error('Token exchange failed');
	const tokenData = (await tokenRes.json()) as { access_token: string };
	return tokenData.access_token;
}

const tokenRequests: Record<OAuthProvider, (params: TokenExchangeParams) => RequestInit> = {
	google: (params) => ({
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: params.clientId,
			client_secret: params.clientSecret,
			code: params.code,
			code_verifier: params.codeVerifier,
			redirect_uri: params.redirectUri,
			grant_type: 'authorization_code',
		}),
	}),
	github: (params) => ({
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			client_id: params.clientId,
			client_secret: params.clientSecret,
			code: params.code,
			code_verifier: params.codeVerifier,
			redirect_uri: params.redirectUri,
		}),
	}),
};

const identityResolvers: Record<
	OAuthProvider,
	(accessToken: string) => Promise<VerifiedIdentity | undefined>
> = {
	google: resolveGoogleIdentity,
	github: resolveGitHubIdentity,
};

async function resolveGoogleIdentity(accessToken: string): Promise<VerifiedIdentity | undefined> {
	const profileRes = await fetch(googleConfig.userinfoUrl, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!profileRes.ok) throw new Error('Profile fetch failed');
	const profile = (await profileRes.json()) as {
		sub: string;
		email: string;
		email_verified: boolean;
	};
	if (!profile.email_verified) return undefined;
	return { providerUserId: profile.sub, email: profile.email };
}

async function resolveGitHubIdentity(accessToken: string): Promise<VerifiedIdentity | undefined> {
	const profileRes = await fetch(githubConfig.userUrl, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'User-Agent': 'Socratink',
		},
	});
	if (!profileRes.ok) throw new Error('Profile fetch failed');
	const profile = (await profileRes.json()) as { id: number };

	const emailsRes = await fetch(githubConfig.emailsUrl, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'User-Agent': 'Socratink',
		},
	});
	if (!emailsRes.ok) throw new Error('Emails fetch failed');
	const emails = (await emailsRes.json()) as GitHubEmail[];
	const email = selectVerifiedGitHubEmail(emails);
	if (!email) return undefined;
	return { providerUserId: String(profile.id), email };
}

async function resolveDurableUserId(
	authDb: AuthDb,
	identity: {
		provider: OAuthProvider;
		providerUserId: string;
		email: string;
		guestUserId: string | undefined;
	},
): Promise<string> {
	const existingAccount = await authDb.findOAuthAccount(identity.provider, identity.providerUserId);
	if (existingAccount) return existingAccount.userId;

	const existingUser = await authDb.findUserByEmail(identity.email);
	if (existingUser) {
		await authDb.upsertOAuthAccount(
			identity.provider,
			identity.providerUserId,
			existingUser.id,
			identity.email,
		);
		return existingUser.id;
	}

	const durableUserId = identity.guestUserId ?? crypto.randomUUID();
	await authDb.createUser(durableUserId, identity.email);
	await authDb.upsertOAuthAccount(
		identity.provider,
		identity.providerUserId,
		durableUserId,
		identity.email,
	);
	return durableUserId;
}

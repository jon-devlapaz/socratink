import { resolveDatabaseTarget, type DatabaseTarget } from './database.ts';

export const localAuthFilename = '.cache/socratink/auth.db';

export type OAuthProviderConfig = Readonly<{
	clientId: string;
	clientSecret: string;
}>;

export type AuthConfig = Readonly<{
	google?: OAuthProviderConfig;
	github?: OAuthProviderConfig;
	redirectBaseUrl: string;
}>;

export type AuthEnvironment = Readonly<{
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GITHUB_CLIENT_ID?: string;
	GITHUB_CLIENT_SECRET?: string;
	AUTH_REDIRECT_BASE_URL?: string;
	DATABASE_URL?: string;
	NF_PROJECT_ID?: string;
	NODE_ENV?: string;
	VERCEL?: string;
}>;

function isHostedEnvironment(environment: AuthEnvironment): boolean {
	return (
		environment.NODE_ENV === 'production' ||
		Boolean(environment.NF_PROJECT_ID) ||
		environment.VERCEL === '1'
	);
}

function isProductionRedirectHost(hostname: string): boolean {
	return hostname === 'app.socratink.ai' || hostname === 'www.socratink.ai' || hostname === 'socratink.ai';
}

export function resolveAuthConfig(environment: AuthEnvironment): AuthConfig | undefined {
	const googleId = environment.GOOGLE_CLIENT_ID?.trim();
	const googleSecret = environment.GOOGLE_CLIENT_SECRET?.trim();
	const githubId = environment.GITHUB_CLIENT_ID?.trim();
	const githubSecret = environment.GITHUB_CLIENT_SECRET?.trim();
	
	const google = googleId && googleSecret ? { clientId: googleId, clientSecret: googleSecret } : undefined;
	const github = githubId && githubSecret ? { clientId: githubId, clientSecret: githubSecret } : undefined;
	
	if (!google && !github) return undefined;
	
	const configuredRedirectBaseUrl = environment.AUTH_REDIRECT_BASE_URL?.trim();
	const redirectBaseUrl = (configuredRedirectBaseUrl || 'http://localhost:5173').replace(/\/+$/, '');

	if (!isHostedEnvironment(environment) && configuredRedirectBaseUrl) {
		const redirectUrl = new URL(redirectBaseUrl);
		if (isProductionRedirectHost(redirectUrl.hostname)) {
			throw new Error(
				'AUTH_REDIRECT_BASE_URL cannot point to the production app in local development.',
			);
		}
	}

	return {
		google,
		github,
		redirectBaseUrl,
	};
}

export function resolveAuthStoreTarget(environment: AuthEnvironment): DatabaseTarget {
	const database = resolveDatabaseTarget(environment);
	switch (database.kind) {
		case 'postgres':
			return database;
		case 'sqlite':
			return { kind: 'sqlite', filename: localAuthFilename };
		default: {
			const exhaustive: never = database;
			throw new Error(`Unexpected database target: ${JSON.stringify(exhaustive)}`);
		}
	}
}

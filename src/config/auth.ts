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

export function resolveAuthConfig(environment: AuthEnvironment): AuthConfig | undefined {
	const googleId = environment.GOOGLE_CLIENT_ID?.trim();
	const googleSecret = environment.GOOGLE_CLIENT_SECRET?.trim();
	const githubId = environment.GITHUB_CLIENT_ID?.trim();
	const githubSecret = environment.GITHUB_CLIENT_SECRET?.trim();
	
	const google = googleId && googleSecret ? { clientId: googleId, clientSecret: googleSecret } : undefined;
	const github = githubId && githubSecret ? { clientId: githubId, clientSecret: githubSecret } : undefined;
	
	if (!google && !github) return undefined;
	
	const redirectBaseUrl = (
		environment.AUTH_REDIRECT_BASE_URL?.trim() || 'http://localhost:5173'
	).replace(/\/+$/, '');

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

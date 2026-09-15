import { resolveDatabaseTarget, type DatabaseTarget } from './database.ts';

export const localCredentialsFilename = '.cache/socratink/credentials.db';

export const localCredentialsSecret = 'socratink-local-credentials-secret';

export type CredentialsEnvironment = Readonly<{
	CREDENTIALS_SECRET?: string;
	DATABASE_URL?: string;
	NF_PROJECT_ID?: string;
	NODE_ENV?: string;
	VERCEL?: string;
}>;

export function resolveCredentialsSecret(environment: CredentialsEnvironment): string {
	const secret = environment.CREDENTIALS_SECRET?.trim();
	if (secret) return secret;

	if (
		environment.NODE_ENV === 'production' ||
		environment.NF_PROJECT_ID ||
		environment.VERCEL === '1'
	) {
		throw new Error('CREDENTIALS_SECRET is required for hosted credential encryption.');
	}

	return localCredentialsSecret;
}

// Flue owns `.cache/flue/local.db` and `flue_*` tables. Application secrets
// use Postgres when DATABASE_URL is set, otherwise a product SQLite file.
export function resolveCredentialStoreTarget(environment: CredentialsEnvironment): DatabaseTarget {
	const database = resolveDatabaseTarget(environment);
	switch (database.kind) {
		case 'postgres':
			return database;
		case 'sqlite':
			return { kind: 'sqlite', filename: localCredentialsFilename };
		default: {
			const exhaustive: never = database;
			throw new Error(`Unexpected database target: ${JSON.stringify(exhaustive)}`);
		}
	}
}

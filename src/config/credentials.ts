import { isHostedEnvironment, type HostedEnvironment } from './hosted.ts';
import { resolveDatabaseTarget, type DatabaseTarget } from './database.ts';

export const localCredentialsFilename = '.cache/socratink/credentials.db';

export const localCredentialsSecret = 'socratink-local-credentials-secret';

export type CredentialsEnvironment = HostedEnvironment & Readonly<{
	CREDENTIALS_SECRET?: string;
	DATABASE_URL?: string;
}>;

export function resolveCredentialsSecret(environment: CredentialsEnvironment): string {
	const secret = environment.CREDENTIALS_SECRET?.trim();
	if (secret) return secret;

	if (isHostedEnvironment(environment)) {
		throw new Error('CREDENTIALS_SECRET is required for hosted credential encryption.');
	}

	return localCredentialsSecret;
}

// Keep credentials apart from the conversation store (`.cache/socratink/local.db` locally).
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

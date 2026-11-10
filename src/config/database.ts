import { isHostedEnvironment, type HostedEnvironment } from './hosted.ts';
export type DatabaseTarget =
	| { kind: 'postgres'; connectionString: string }
	| { kind: 'sqlite'; filename: string };

type DatabaseEnvironment = HostedEnvironment & Readonly<{
	DATABASE_URL?: string;
}>;

export function resolveDatabaseTarget(environment: DatabaseEnvironment): DatabaseTarget {
	const connectionString = environment.DATABASE_URL?.trim();
	if (connectionString) return { kind: 'postgres', connectionString };

	if (isHostedEnvironment(environment)) {
		throw new Error('DATABASE_URL is required for durable hosted conversations.');
	}

	return { kind: 'sqlite', filename: '.cache/socratink/local.db' };
}

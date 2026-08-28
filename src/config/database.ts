export type DatabaseTarget =
	| { kind: 'postgres'; connectionString: string }
	| { kind: 'sqlite'; filename: string };

type DatabaseEnvironment = Readonly<{
	DATABASE_URL?: string;
	NF_PROJECT_ID?: string;
	NODE_ENV?: string;
	VERCEL?: string;
}>;

export function resolveDatabaseTarget(environment: DatabaseEnvironment): DatabaseTarget {
	const connectionString = environment.DATABASE_URL?.trim();
	if (connectionString) return { kind: 'postgres', connectionString };

	if (
		environment.NODE_ENV === 'production' ||
		environment.NF_PROJECT_ID ||
		environment.VERCEL === '1'
	) {
		throw new Error('DATABASE_URL is required for durable hosted conversations.');
	}

	return { kind: 'sqlite', filename: '.cache/flue/local.db' };
}

import { isHostedEnvironment, type HostedEnvironment } from './hosted.ts';
export type DatabaseTarget =
	| { kind: 'postgres'; connectionString: string }
	| { kind: 'sqlite'; filename: string };

type DatabaseEnvironment = HostedEnvironment & Readonly<{
	DATABASE_URL?: string;
}>;

export function resolveDatabaseTarget(environment: DatabaseEnvironment): DatabaseTarget {
	const connectionString = environment.DATABASE_URL?.trim();
	if (connectionString) return { kind: 'postgres', connectionString: withVerifyFullSsl(connectionString) };

	if (isHostedEnvironment(environment)) {
		throw new Error('DATABASE_URL is required for durable hosted conversations.');
	}

	return { kind: 'sqlite', filename: '.cache/socratink/local.db' };
}

/** pg 8 already treats sslmode prefer, require and verify-ca as verify-full, and
 * warns on every cold start. Naming verify-full keeps that behavior without the
 * warning, and keeps it when pg 9 gives those modes weaker libpq semantics.
 */
function withVerifyFullSsl(connectionString: string): string {
	if (!/[?&]sslmode=(prefer|require|verify-ca)(&|$)/.test(connectionString)) return connectionString;
	const url = new URL(connectionString);
	if (url.searchParams.has('uselibpqcompat')) return connectionString;
	url.searchParams.set('sslmode', 'verify-full');
	return url.toString();
}

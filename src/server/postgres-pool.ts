import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions/db-connections';

const pools = new Map<string, pg.Pool>();

/** One pool per connection string for the process lifetime, shared by the
 * durable, auth, and credential stores. Stores never end it: idle clients are
 * closed after a second and do not keep the process alive. Creating the pool
 * opens no connection; the first query does.
 */
export function sharedPostgresPool(connectionString: string): pg.Pool {
	let pool = pools.get(connectionString);
	if (!pool) {
		// A durable full read holds one connection for its transaction; auth and
		// credential queries are single statements. 5 leaves room for concurrent
		// requests under the previous total of 7 (3 durable + 2 auth + 2 credential).
		pool = new pg.Pool({ connectionString, max: 5, idleTimeoutMillis: 1_000, allowExitOnIdle: true });
		attachDatabasePool(pool);
		// The pool drops an idle client the server closed; the next query opens
		// another. Without a listener that drop would crash the process.
		pool.on('error', () => {});
		pools.set(connectionString, pool);
	}
	return pool;
}

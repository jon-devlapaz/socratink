import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions/db-connections';

const pools = new Map<string, pg.Pool>();

/** One pool per connection string for the process lifetime, shared by the
 * durable and auth stores. Stores never end it: idle clients are
 * closed after a second and do not keep the process alive. Creating the pool
 * opens no connection; the first query does.
 */
export function sharedPostgresPool(connectionString: string): pg.Pool {
	let pool = pools.get(connectionString);
	if (!pool) {
		pool = new pg.Pool({ connectionString, max: 5, idleTimeoutMillis: 1_000, allowExitOnIdle: true });
		attachDatabasePool(pool);
		// The pool drops an idle client the server closed; the next query opens
		// another. Without a listener that drop would crash the process.
		pool.on('error', () => {});
		pools.set(connectionString, pool);
	}
	return pool;
}

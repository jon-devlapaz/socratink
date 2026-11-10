import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions/db-connections';
import { emptyLog, logFormat, maximumId, type LogBackend, type LogState } from './storage-types.ts';

const schema = 'socratink_pi';

/** Session advisory locks require a dedicated database session. Derive Neon's
 * direct endpoint from this same URL; never borrow a second environment's URL.
 */
export function postgresOwnerConnectionString(connectionString: string): string {
	const url = new URL(connectionString);
	if (/^ep-[a-z0-9-]+-pooler\.[a-z0-9.-]+\.neon\.tech$/.test(url.hostname)) {
		url.hostname = url.hostname.replace('-pooler.', '.');
		return url.toString();
	}
	if (/pooler|pgbouncer/i.test(url.hostname) || url.searchParams.get('pool_mode') === 'transaction') {
		throw new Error('Pi execution requires a direct or session-pooled PostgreSQL endpoint.');
	}
	return connectionString;
}

export function postgresLog(connectionString: string): LogBackend {
	const ownerConnectionString = postgresOwnerConnectionString(connectionString);
	const pool = new pg.Pool({ connectionString, max: 3, idleTimeoutMillis: 1_000, allowExitOnIdle: true });
	attachDatabasePool(pool);
	// Initialize on first use, inside a request that awaits it: a handshake
	// started at module load can stall while the function is frozen between
	// requests. A failed attempt is forgotten so the next request retries.
	let initialized: Promise<void> | undefined;
	const ready = () => initialized ??= initialize().catch((error) => { initialized = undefined; throw error; });
	async function initialize() {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`${schema}:schema-init`]);
			await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema};
				CREATE TABLE IF NOT EXISTS ${schema}.namespaces (
					namespace TEXT PRIMARY KEY, format INTEGER NOT NULL,
					next_id BIGINT NOT NULL CHECK(next_id >= 2), abort_through BIGINT NOT NULL DEFAULT 0);
				CREATE TABLE IF NOT EXISTS ${schema}.commits (
					namespace TEXT NOT NULL REFERENCES ${schema}.namespaces(namespace),
					seq BIGINT NOT NULL CHECK(seq > 0), writes TEXT NOT NULL, PRIMARY KEY(namespace, seq));
				-- Retired tables: the browser journal (replaced by SSE) and pre-Pi
				-- conversations. Remove these lines once prod has run them.
				DROP TABLE IF EXISTS ${schema}.browser_events, ${schema}.browser_progress;
				DO $$ DECLARE retired text; BEGIN
					FOR retired IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'flue\\_%' LOOP
						EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', retired);
					END LOOP;
				END $$;`);
			await client.query('COMMIT');
		} catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
		finally { client.release(); }
	}
	async function state(client: Pick<pg.Client, 'query'>, namespace: string): Promise<LogState> {
		const metadata = (await client.query(`SELECT format, next_id FROM ${schema}.namespaces WHERE namespace=$1`, [namespace])).rows[0];
		if (!metadata) return emptyLog();
		const rows = (await client.query(`SELECT seq,writes FROM ${schema}.commits WHERE namespace=$1 ORDER BY seq`, [namespace])).rows;
		return { format: metadata.format, nextId: Number(metadata.next_id),
			commits: rows.map((row) => ({ seq: Number(row.seq), writes: row.writes })) };
	}
	return {
		async exists(namespace) {
			await ready();
			return (await pool.query(`SELECT 1 FROM ${schema}.namespaces WHERE namespace=$1`, [namespace])).rowCount === 1;
		},
		async read(namespace) {
			await ready();
			const client = await pool.connect();
			try {
				await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
				const value = await state(client, namespace);
				await client.query('COMMIT');
				return value;
			} catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
			finally { client.release(); }
		},
		async claim(namespace) {
			await ready();
			const client = new pg.Client({ connectionString: ownerConnectionString, connectionTimeoutMillis: 5_000, statement_timeout: 30_000 });
			let failure: unknown;
			let closed = false;
			client.on('error', (error) => { failure ??= error; });
			const assertOwned = () => {
				if (closed || failure) throw new Error('PostgreSQL execution ownership was lost.', { cause: failure });
			};
			try {
				await client.connect();
				const lock = await client.query('SELECT pg_try_advisory_lock(hashtextextended($1,0)) AS owned', [`${schema}:owner:${namespace}`]);
				if (!lock.rows[0]?.owned) { await client.end(); return undefined; }
				await client.query(`INSERT INTO ${schema}.namespaces(namespace,format,next_id) VALUES ($1,$2,2) ON CONFLICT(namespace) DO NOTHING`, [namespace, logFormat]);
				const initial = await state(client, namespace);
				return {
					state: initial, assertOwned,
					async append(seq, writes, nextId) {
						assertOwned();
						await client.query('BEGIN');
						try {
							await client.query(`UPDATE ${schema}.namespaces SET next_id=GREATEST(next_id,$2) WHERE namespace=$1`, [namespace, nextId]);
							// JSON as TEXT preserves escaped NUL and lone UTF-16 surrogates.
							await client.query(`INSERT INTO ${schema}.commits VALUES ($1,$2,$3)`, [namespace, seq, writes]);
							await client.query('COMMIT');
						} catch (error) { failure = error; await client.query('ROLLBACK').catch(() => {}); throw error; }
					},
					async mintId() {
						assertOwned();
						const result = await client.query(`UPDATE ${schema}.namespaces SET next_id=next_id+1
							WHERE namespace=$1 AND next_id<=$2 RETURNING next_id-1 AS id`, [namespace, maximumId]);
						return Number(result.rows[0]?.id);
					},
					async cancelThrough() {
						assertOwned();
						return Number((await client.query(`SELECT abort_through FROM ${schema}.namespaces WHERE namespace=$1`, [namespace])).rows[0].abort_through);
					},
					async close() { if (!closed) { closed = true; await client.end(); } },
				};
			} catch (error) { await client.end().catch(() => {}); throw error; }
		},
		async cancel(namespace, through) {
			await ready();
			await pool.query(`UPDATE ${schema}.namespaces SET abort_through=GREATEST(abort_through,$2) WHERE namespace=$1`, [namespace, through]);
		},
		async close() { await initialized?.catch(() => {}); await pool.end(); },
	};
}

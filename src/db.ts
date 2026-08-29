import { postgres } from '@flue/postgres';
import { sqlite } from '@flue/runtime/node';
import { attachDatabasePool } from '@vercel/functions';
import { Pool } from 'pg';
import { resolveDatabaseTarget } from './config/database.ts';

const target = resolveDatabaseTarget(process.env);

function createPostgresAdapter(connectionString: string) {
	const pool = new Pool({ connectionString, max: 5 });
	if (process.env.VERCEL === '1') attachDatabasePool(pool);

	return postgres({
		query: async (text, params) => (await pool.query(text, params)).rows,
		transaction: async (run) => {
			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				const result = await run({
					query: async (text, params) => (await client.query(text, params)).rows,
				});
				await client.query('COMMIT');
				return result;
			} catch (error) {
				await client.query('ROLLBACK');
				throw error;
			} finally {
				client.release();
			}
		},
		close: () => pool.end(),
	});
}

export default target.kind === 'postgres'
	? createPostgresAdapter(target.connectionString)
	: sqlite(target.filename);

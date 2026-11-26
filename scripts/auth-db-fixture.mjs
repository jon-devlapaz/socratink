import { createSqliteAuthDb } from '../src/server/auth-db.ts';

export async function withAuthDb(run) {
	const db = createSqliteAuthDb(':memory:');
	try {
		return await run(db);
	} finally {
		await db.close();
	}
}

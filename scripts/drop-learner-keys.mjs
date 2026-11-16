// One-off cleanup for the learner API key table that the single model route retired.
// Without --drop it changes nothing: it reports only whether the table exists and its row count.
// With --drop it deletes socratink_credentials and every encrypted learner key in it. That cannot be undone.
// It never selects or prints key values. Delete this script once the operator has run it.
import { pathToFileURL } from 'node:url';
import pg from 'pg';

export async function cleanLearnerKeys(client, { drop }) {
	const { rows } = await client.query("SELECT to_regclass('socratink_credentials') IS NOT NULL AS present");
	if (!rows[0].present) return { present: false, rows: 0, dropped: false };
	const count = Number((await client.query('SELECT count(*) AS rows FROM socratink_credentials')).rows[0].rows);
	if (drop) await client.query('DROP TABLE socratink_credentials');
	return { present: true, rows: count, dropped: drop };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const args = process.argv.slice(2);
	const connectionString = process.env.DATABASE_URL?.trim();
	if (args.some((arg) => arg !== '--drop') || !connectionString) {
		console.error('Usage: DATABASE_URL=<postgres url> node scripts/drop-learner-keys.mjs [--drop]');
		process.exit(2);
	}
	const target = new URL(connectionString);
	const client = new pg.Client({ connectionString });
	await client.connect();
	try {
		const result = await cleanLearnerKeys(client, { drop: args.includes('--drop') });
		const where = `${target.hostname}${target.pathname}`;
		if (!result.present) console.log(`${where}: socratink_credentials does not exist. Nothing to do.`);
		else if (result.dropped) console.log(`${where}: dropped socratink_credentials (${result.rows} rows).`);
		else console.log(`${where}: socratink_credentials has ${result.rows} rows. Dry run; rerun with --drop to delete it.`);
	} finally {
		await client.end();
	}
}

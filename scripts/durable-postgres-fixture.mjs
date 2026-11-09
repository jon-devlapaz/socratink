import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import pg from 'pg';

const run = promisify(execFile);

// Own one disposable database. Never read a developer or deployment DATABASE_URL.
export async function startDisposablePostgres() {
	const name = `socratink-durable-proof-${process.pid}-${randomBytes(4).toString('hex')}`;
	const password = randomBytes(24).toString('hex');
	let owned = false;
	const stop = async () => {
		if (!owned) return;
		await run('docker', ['rm', '--force', name], { timeout: 15_000 });
		owned = false;
	};
	try {
		await run('docker', ['run', '--detach', '--rm', '--pull=never', '--name', name,
			'--publish', '127.0.0.1::5432', '--tmpfs', '/var/lib/postgresql/data',
			'--env', 'POSTGRES_USER=socratink', '--env', 'POSTGRES_DB=socratink_durable_smoke',
			'--env', `POSTGRES_PASSWORD=${password}`, 'postgres:17-alpine'], { timeout: 30_000 });
		owned = true;
		const port = Number((await run('docker', ['port', name, '5432/tcp'])).stdout.trim().split(':').at(-1));
		if (!Number.isSafeInteger(port) || port < 1) throw new Error('Disposable PostgreSQL has no loopback port.');
		const connectionString = `postgresql://socratink:${password}@127.0.0.1:${port}/socratink_durable_smoke`;
		const deadline = Date.now() + 15_000;
		for (;;) {
			try {
				await run('docker', ['exec', name, 'pg_isready', '-h', '127.0.0.1', '-U', 'socratink',
					'-d', 'socratink_durable_smoke'], { timeout: 2_000 });
				break;
			} catch {
				if (Date.now() >= deadline) throw new Error('Disposable PostgreSQL did not become ready.');
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}
		const pool = new pg.Pool({ connectionString, max: 1 });
		try {
			const version = (await pool.query('SHOW server_version')).rows[0].server_version;
			return { connectionString, version, stop };
		} finally {
			await pool.end();
		}
	} catch (error) {
		await stop();
		throw error;
	}
}

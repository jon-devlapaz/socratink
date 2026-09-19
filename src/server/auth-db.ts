// Mirrors credential-db.ts's dual-dialect shape on purpose: the stores evolve
// independently, and the third store is the trigger to extract a shared executor.
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Pool } from 'pg';
import type { DatabaseTarget } from '../config/database.ts';

export type UserRow = Readonly<{
	id: string;
	email: string;
	createdAt: string;
}>;

export type OAuthAccountRow = Readonly<{
	provider: string;
	providerUserId: string;
	userId: string;
	email: string | null;
	createdAt: string;
}>;

export interface AuthDb {
	findUserByEmail(email: string): Promise<UserRow | undefined>;
	findUserById(id: string): Promise<UserRow | undefined>;
	createUser(id: string, email: string): Promise<UserRow>;
	upsertOAuthAccount(provider: string, providerUserId: string, userId: string, email: string | null): Promise<void>;
	findOAuthAccount(provider: string, providerUserId: string): Promise<OAuthAccountRow | undefined>;
	createAlias(guestUserId: string, durableUserId: string): Promise<void>;
	findAliases(durableUserId: string): Promise<string[]>;
	findAliasOwner(guestUserId: string): Promise<string | undefined>;
	close(): Promise<void>;
}

export type AuthPgClient = {
	query(text: string, values?: unknown[]): Promise<{ rows: object[] }>;
	end(): Promise<void>;
};

const CREATE_TABLES_SQL = `CREATE TABLE IF NOT EXISTS socratink_users (
	id TEXT PRIMARY KEY,
	email TEXT UNIQUE,
	created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS socratink_oauth_accounts (
	provider TEXT NOT NULL,
	provider_user_id TEXT NOT NULL,
	user_id TEXT NOT NULL REFERENCES socratink_users(id) ON DELETE CASCADE,
	email TEXT,
	created_at TEXT NOT NULL,
	PRIMARY KEY (provider, provider_user_id)
);
CREATE TABLE IF NOT EXISTS socratink_user_aliases (
	guest_user_id TEXT PRIMARY KEY,
	durable_user_id TEXT NOT NULL REFERENCES socratink_users(id) ON DELETE CASCADE,
	created_at TEXT NOT NULL
);`;

// POSTGRES SQL
const POSTGRES_FIND_USER_BY_EMAIL_SQL =
	'SELECT id, email, created_at FROM socratink_users WHERE email = $1';
const POSTGRES_FIND_USER_BY_ID_SQL =
	'SELECT id, email, created_at FROM socratink_users WHERE id = $1';
const POSTGRES_CREATE_USER_SQL =
	'INSERT INTO socratink_users (id, email, created_at) VALUES ($1, $2, $3) RETURNING id, email, created_at';
const POSTGRES_UPSERT_OAUTH_ACCOUNT_SQL = `INSERT INTO socratink_oauth_accounts (provider, provider_user_id, user_id, email, created_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (provider, provider_user_id) DO UPDATE SET
	user_id = EXCLUDED.user_id,
	email = EXCLUDED.email,
	created_at = EXCLUDED.created_at`;
const POSTGRES_FIND_OAUTH_ACCOUNT_SQL =
	'SELECT provider, provider_user_id, user_id, email, created_at FROM socratink_oauth_accounts WHERE provider = $1 AND provider_user_id = $2';
const POSTGRES_CREATE_ALIAS_SQL = `INSERT INTO socratink_user_aliases (guest_user_id, durable_user_id, created_at)
VALUES ($1, $2, $3)
ON CONFLICT (guest_user_id) DO UPDATE SET durable_user_id = EXCLUDED.durable_user_id`;
const POSTGRES_FIND_ALIASES_SQL =
	'SELECT guest_user_id FROM socratink_user_aliases WHERE durable_user_id = $1';
const POSTGRES_FIND_ALIAS_OWNER_SQL =
	'SELECT durable_user_id FROM socratink_user_aliases WHERE guest_user_id = $1';

// SQLITE SQL
const SQLITE_FIND_USER_BY_EMAIL_SQL =
	'SELECT id, email, created_at FROM socratink_users WHERE email = ?';
const SQLITE_FIND_USER_BY_ID_SQL =
	'SELECT id, email, created_at FROM socratink_users WHERE id = ?';
const SQLITE_CREATE_USER_SQL =
	'INSERT INTO socratink_users (id, email, created_at) VALUES (?, ?, ?) RETURNING id, email, created_at';
const SQLITE_UPSERT_OAUTH_ACCOUNT_SQL = `INSERT INTO socratink_oauth_accounts (provider, provider_user_id, user_id, email, created_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT (provider, provider_user_id) DO UPDATE SET
	user_id = excluded.user_id,
	email = excluded.email,
	created_at = excluded.created_at`;
const SQLITE_FIND_OAUTH_ACCOUNT_SQL =
	'SELECT provider, provider_user_id, user_id, email, created_at FROM socratink_oauth_accounts WHERE provider = ? AND provider_user_id = ?';
const SQLITE_CREATE_ALIAS_SQL = `INSERT INTO socratink_user_aliases (guest_user_id, durable_user_id, created_at)
VALUES (?, ?, ?)
ON CONFLICT (guest_user_id) DO UPDATE SET durable_user_id = excluded.durable_user_id`;
const SQLITE_FIND_ALIASES_SQL =
	'SELECT guest_user_id FROM socratink_user_aliases WHERE durable_user_id = ?';
const SQLITE_FIND_ALIAS_OWNER_SQL =
	'SELECT durable_user_id FROM socratink_user_aliases WHERE guest_user_id = ?';

export function createAuthDb(target: DatabaseTarget): AuthDb {
	switch (target.kind) {
		case 'postgres':
			return openPostgresAuthDb(target.connectionString);
		case 'sqlite':
			return createSqliteAuthDb(target.filename);
		default: {
			const exhaustive: never = target;
			throw new Error(`Unexpected store target: ${JSON.stringify(exhaustive)}`);
		}
	}
}

function openPostgresAuthDb(connectionString: string): AuthDb {
	const pool = new Pool({ connectionString, max: 2 });
	return createPostgresAuthDb({
		query: (text, values) => pool.query(text, values),
		end: () => pool.end(),
	});
}

export function createPostgresAuthDb(client: AuthPgClient): AuthDb {
	let ready: Promise<void> | undefined;
	const ensure = () => (ready ??= client.query(CREATE_TABLES_SQL).then(() => undefined));

	return {
		async findUserByEmail(email) {
			await ensure();
			const result = await client.query(POSTGRES_FIND_USER_BY_EMAIL_SQL, [email]);
			return mapOptionalUserRow(result.rows[0]);
		},
		async findUserById(id) {
			await ensure();
			const result = await client.query(POSTGRES_FIND_USER_BY_ID_SQL, [id]);
			return mapOptionalUserRow(result.rows[0]);
		},
		async createUser(id, email) {
			await ensure();
			const result = await client.query(POSTGRES_CREATE_USER_SQL, [
				id,
				email,
				new Date().toISOString(),
			]);
			const row = result.rows[0];
			if (!row) throw new Error('User creation did not return a row.');
			return mapStoredUserRow(row);
		},
		async upsertOAuthAccount(provider, providerUserId, userId, email) {
			await ensure();
			await client.query(POSTGRES_UPSERT_OAUTH_ACCOUNT_SQL, [
				provider,
				providerUserId,
				userId,
				email,
				new Date().toISOString(),
			]);
		},
		async findOAuthAccount(provider, providerUserId) {
			await ensure();
			const result = await client.query(POSTGRES_FIND_OAUTH_ACCOUNT_SQL, [
				provider,
				providerUserId,
			]);
			return mapOptionalOAuthAccountRow(result.rows[0]);
		},
		async createAlias(guestUserId, durableUserId) {
			await ensure();
			await client.query(POSTGRES_CREATE_ALIAS_SQL, [
				guestUserId,
				durableUserId,
				new Date().toISOString(),
			]);
		},
		async findAliases(durableUserId) {
			await ensure();
			const result = await client.query(POSTGRES_FIND_ALIASES_SQL, [durableUserId]);
			return result.rows.map(readGuestUserId);
		},
		async findAliasOwner(guestUserId) {
			await ensure();
			const result = await client.query(POSTGRES_FIND_ALIAS_OWNER_SQL, [guestUserId]);
			return readOptionalDurableUserId(result.rows[0]);
		},
		close: () => client.end(),
	};
}

export function createSqliteAuthDb(filename: string): AuthDb {
	if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
	const database = new DatabaseSync(filename);
	database.exec(CREATE_TABLES_SQL);

	return {
		async findUserByEmail(email) {
			return mapOptionalUserRow(database.prepare(SQLITE_FIND_USER_BY_EMAIL_SQL).get(email));
		},
		async findUserById(id) {
			return mapOptionalUserRow(database.prepare(SQLITE_FIND_USER_BY_ID_SQL).get(id));
		},
		async createUser(id, email) {
			const rows = database.prepare(SQLITE_CREATE_USER_SQL).all(id, email, new Date().toISOString());
			const row = rows[0];
			if (!row) throw new Error('User creation did not return a row.');
			return mapStoredUserRow(row);
		},
		async upsertOAuthAccount(provider, providerUserId, userId, email) {
			database
				.prepare(SQLITE_UPSERT_OAUTH_ACCOUNT_SQL)
				.run(provider, providerUserId, userId, email, new Date().toISOString());
		},
		async findOAuthAccount(provider, providerUserId) {
			return mapOptionalOAuthAccountRow(
				database.prepare(SQLITE_FIND_OAUTH_ACCOUNT_SQL).get(provider, providerUserId)
			);
		},
		async createAlias(guestUserId, durableUserId) {
			database
				.prepare(SQLITE_CREATE_ALIAS_SQL)
				.run(guestUserId, durableUserId, new Date().toISOString());
		},
		async findAliases(durableUserId) {
			const rows = database.prepare(SQLITE_FIND_ALIASES_SQL).all(durableUserId);
			return rows.map(readGuestUserId);
		},
		async findAliasOwner(guestUserId) {
			return readOptionalDurableUserId(
				database.prepare(SQLITE_FIND_ALIAS_OWNER_SQL).get(guestUserId),
			);
		},
		async close() {
			database.close();
		},
	};
}

function mapOptionalUserRow(row: object | undefined): UserRow | undefined {
	return row === undefined ? undefined : mapStoredUserRow(row);
}

function mapStoredUserRow(row: object): UserRow {
	const record = row as {
		id?: unknown;
		email?: unknown;
		created_at?: unknown;
	};
	if (
		typeof record.id !== 'string' ||
		typeof record.email !== 'string' ||
		typeof record.created_at !== 'string'
	) {
		throw new Error('Malformed user row.');
	}
	return {
		id: record.id,
		email: record.email,
		createdAt: record.created_at,
	};
}

function mapOptionalOAuthAccountRow(row: object | undefined): OAuthAccountRow | undefined {
	return row === undefined ? undefined : mapStoredOAuthAccountRow(row);
}

function mapStoredOAuthAccountRow(row: object): OAuthAccountRow {
	const record = row as {
		provider?: unknown;
		provider_user_id?: unknown;
		user_id?: unknown;
		email?: unknown;
		created_at?: unknown;
	};
	if (
		typeof record.provider !== 'string' ||
		typeof record.provider_user_id !== 'string' ||
		typeof record.user_id !== 'string' ||
		(record.email !== null && record.email !== undefined && typeof record.email !== 'string') ||
		typeof record.created_at !== 'string'
	) {
		throw new Error('Malformed oauth account row.');
	}
	return {
		provider: record.provider,
		providerUserId: record.provider_user_id,
		userId: record.user_id,
		email: (record.email === null || record.email === undefined) ? null : (record.email as string),
		createdAt: record.created_at,
	};
}

function readGuestUserId(row: object): string {
	const record = row as { guest_user_id?: unknown };
	if (typeof record.guest_user_id !== 'string') {
		throw new Error('Malformed user alias row.');
	}
	return record.guest_user_id;
}

function readOptionalDurableUserId(row: object | undefined): string | undefined {
	if (row === undefined) return undefined;
	const record = row as { durable_user_id?: unknown };
	if (typeof record.durable_user_id !== 'string') {
		throw new Error('Malformed user alias row.');
	}
	return record.durable_user_id;
}

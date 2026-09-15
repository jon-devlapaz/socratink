import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Pool } from 'pg';
import type { DatabaseTarget } from '../config/database.ts';

export type CredentialRow = Readonly<{
	userId: string;
	name: string;
	credentialRef: string;
	ciphertext: string;
}>;

export type CredentialDb = {
	upsert(row: CredentialRow): Promise<string>;
	getByName(lookup: { userId: string; name: string }): Promise<CredentialRow | undefined>;
	getByRef(credentialRef: string): Promise<CredentialRow | undefined>;
	deleteByName(lookup: { userId: string; name: string }): Promise<void>;
	close(): Promise<void>;
};

export type CredentialPgClient = {
	query(text: string, values?: unknown[]): Promise<{ rows: object[] }>;
	end(): Promise<void>;
};

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS socratink_credentials (
	user_id TEXT NOT NULL,
	name TEXT NOT NULL,
	credential_ref TEXT NOT NULL UNIQUE,
	ciphertext TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	PRIMARY KEY (user_id, name)
)`;

const POSTGRES_UPSERT_SQL = `INSERT INTO socratink_credentials (user_id, name, credential_ref, ciphertext, updated_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (user_id, name) DO UPDATE SET
	credential_ref = EXCLUDED.credential_ref,
	ciphertext = EXCLUDED.ciphertext,
	updated_at = EXCLUDED.updated_at
RETURNING credential_ref`;
const POSTGRES_SELECT_BY_NAME_SQL =
	'SELECT user_id, name, credential_ref, ciphertext FROM socratink_credentials WHERE user_id = $1 AND name = $2';
const POSTGRES_SELECT_BY_REF_SQL =
	'SELECT user_id, name, credential_ref, ciphertext FROM socratink_credentials WHERE credential_ref = $1';
const POSTGRES_DELETE_SQL =
	'DELETE FROM socratink_credentials WHERE user_id = $1 AND name = $2';

const SQLITE_UPSERT_SQL = `INSERT INTO socratink_credentials (user_id, name, credential_ref, ciphertext, updated_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT (user_id, name) DO UPDATE SET
	credential_ref = excluded.credential_ref,
	ciphertext = excluded.ciphertext,
	updated_at = excluded.updated_at
RETURNING credential_ref`;
const SQLITE_SELECT_BY_NAME_SQL =
	'SELECT user_id, name, credential_ref, ciphertext FROM socratink_credentials WHERE user_id = ? AND name = ?';
const SQLITE_SELECT_BY_REF_SQL =
	'SELECT user_id, name, credential_ref, ciphertext FROM socratink_credentials WHERE credential_ref = ?';
const SQLITE_DELETE_SQL = 'DELETE FROM socratink_credentials WHERE user_id = ? AND name = ?';

export function createCredentialDb(target: DatabaseTarget): CredentialDb {
	switch (target.kind) {
		case 'postgres':
			return openPostgresCredentialDb(target.connectionString);
		case 'sqlite':
			return createSqliteCredentialDb(target.filename);
		default: {
			const exhaustive: never = target;
			throw new Error(`Unexpected store target: ${JSON.stringify(exhaustive)}`);
		}
	}
}

function openPostgresCredentialDb(connectionString: string): CredentialDb {
	const pool = new Pool({ connectionString, max: 2 });
	return createPostgresCredentialDb({
		query: (text, values) => pool.query(text, values),
		end: () => pool.end(),
	});
}

export function createPostgresCredentialDb(client: CredentialPgClient): CredentialDb {
	let ready: Promise<void> | undefined;
	const ensure = () => (ready ??= client.query(CREATE_TABLE_SQL).then(() => undefined));

	return {
		async upsert(row) {
			await ensure();
			const result = await client.query(POSTGRES_UPSERT_SQL, upsertValues(row));
			const credentialRef = readReturnedRef(result.rows[0]);
			if (!credentialRef) throw new Error('Credential upsert did not return a ref.');
			return credentialRef;
		},
		async getByName(lookup) {
			await ensure();
			const result = await client.query(POSTGRES_SELECT_BY_NAME_SQL, [lookup.userId, lookup.name]);
			return mapOptionalRow(result.rows[0]);
		},
		async getByRef(credentialRef) {
			await ensure();
			const result = await client.query(POSTGRES_SELECT_BY_REF_SQL, [credentialRef]);
			return mapOptionalRow(result.rows[0]);
		},
		async deleteByName(lookup) {
			await ensure();
			await client.query(POSTGRES_DELETE_SQL, [lookup.userId, lookup.name]);
		},
		close: () => client.end(),
	};
}

export function createSqliteCredentialDb(filename: string): CredentialDb {
	if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
	const database = new DatabaseSync(filename);
	database.exec(CREATE_TABLE_SQL);

	return {
		async upsert(row) {
			const rows = database.prepare(SQLITE_UPSERT_SQL).all(...upsertValues(row));
			const credentialRef = readReturnedRef(rows[0]);
			if (!credentialRef) throw new Error('Credential upsert did not return a ref.');
			return credentialRef;
		},
		async getByName(lookup) {
			return mapOptionalRow(database.prepare(SQLITE_SELECT_BY_NAME_SQL).get(lookup.userId, lookup.name));
		},
		async getByRef(credentialRef) {
			return mapOptionalRow(database.prepare(SQLITE_SELECT_BY_REF_SQL).get(credentialRef));
		},
		async deleteByName(lookup) {
			database.prepare(SQLITE_DELETE_SQL).run(lookup.userId, lookup.name);
		},
		async close() {
			database.close();
		},
	};
}

function upsertValues(row: CredentialRow): [string, string, string, string, string] {
	return [row.userId, row.name, row.credentialRef, row.ciphertext, new Date().toISOString()];
}

function mapOptionalRow(row: object | undefined): CredentialRow | undefined {
	return row === undefined ? undefined : mapStoredRow(row);
}

function mapStoredRow(row: object): CredentialRow {
	const record = row as {
		user_id?: unknown;
		name?: unknown;
		credential_ref?: unknown;
		ciphertext?: unknown;
	};
	if (
		typeof record.user_id !== 'string' ||
		typeof record.name !== 'string' ||
		typeof record.credential_ref !== 'string' ||
		typeof record.ciphertext !== 'string'
	) {
		throw new Error('Malformed credential row.');
	}
	return {
		userId: record.user_id,
		name: record.name,
		credentialRef: record.credential_ref,
		ciphertext: record.ciphertext,
	};
}

function readReturnedRef(row: object | undefined): string | undefined {
	if (row === undefined) return undefined;
	const credentialRef = (row as { credential_ref?: unknown }).credential_ref;
	return typeof credentialRef === 'string' && credentialRef.length > 0 ? credentialRef : undefined;
}

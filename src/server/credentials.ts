import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { attachDatabasePool } from '@vercel/functions/db-connections';
import { Pool } from 'pg';
import type { DatabaseTarget } from '../config/database.ts';
import { isSessionUserId } from '../config/session.ts';
import { decryptSecret, deriveCredentialsKey, encryptSecret } from './credential-crypto.ts';

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS socratink_credentials (
	user_id TEXT NOT NULL,
	name TEXT NOT NULL,
	credential_ref TEXT NOT NULL UNIQUE,
	ciphertext TEXT NOT NULL,
	disabled INTEGER NOT NULL DEFAULT 0,
	updated_at TEXT NOT NULL,
	PRIMARY KEY (user_id, name)
)`;

const SELECT_BY_NAME_SQL =
	'SELECT user_id, name, credential_ref, ciphertext, disabled FROM socratink_credentials WHERE user_id = ? AND name = ?';
const SELECT_BY_REF_SQL =
	'SELECT user_id, name, credential_ref, ciphertext, disabled FROM socratink_credentials WHERE credential_ref = ?';
const UPSERT_SQL = `INSERT INTO socratink_credentials (user_id, name, credential_ref, ciphertext, disabled, updated_at)
VALUES (?, ?, ?, ?, 0, ?)
ON CONFLICT (user_id, name) DO UPDATE SET
	credential_ref = excluded.credential_ref,
	ciphertext = excluded.ciphertext,
	disabled = 0,
	updated_at = excluded.updated_at
RETURNING credential_ref`;
const DISABLE_SQL =
	'UPDATE socratink_credentials SET disabled = 1, updated_at = ? WHERE user_id = ? AND name = ?';
const DELETE_SQL = 'DELETE FROM socratink_credentials WHERE user_id = ? AND name = ?';

export const missingUserKeyError = {
	type: 'missing_user_key',
	message: 'No credential is stored for this user and name.',
} as const;

export const foreignUserKeyError = {
	type: 'foreign_user_key',
	message: 'This credential does not belong to the current session.',
} as const;

export const disabledUserKeyError = {
	type: 'disabled_user_key',
	message: 'This credential has been disabled.',
} as const;

type UserKeyErrorBody =
	| typeof missingUserKeyError
	| typeof foreignUserKeyError
	| typeof disabledUserKeyError;

export class UserKeyError extends Error {
	readonly type: UserKeyErrorBody['type'];

	constructor(error: UserKeyErrorBody) {
		super(error.message);
		this.name = 'UserKeyError';
		this.type = error.type;
	}
}

type SqlValue = string | number;
type SqlRow = Readonly<Record<string, unknown>>;

type SqlClient = {
	query(sql: string, params: readonly SqlValue[]): Promise<SqlRow[]>;
	close(): Promise<void>;
};

export type CredentialStore = {
	updateUserKey(params: {
		userId: string;
		name: string;
		value: string;
	}): Promise<{ credentialRef: string }>;
	getUserKey(params: { userId: string; name: string }): Promise<string>;
	getUserKeyByRef(params: { userId: string; credentialRef: string }): Promise<string>;
	disableUserKey(params: { userId: string; name: string }): Promise<void>;
	deleteUserKey(params: { userId: string; name: string }): Promise<void>;
	close(): Promise<void>;
};

export function createCredentialStore(options: {
	secret: string;
	target: DatabaseTarget;
}): CredentialStore {
	const key = deriveCredentialsKey(options.secret);
	const client = createSqlClient(options.target);

	return {
		async updateUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			const value = requireSecretValue(params.value);
			const credentialRef = crypto.randomUUID();
			const rows = await client.query(UPSERT_SQL, [
				userId,
				name,
				credentialRef,
				encryptSecret(value, key),
				new Date().toISOString(),
			]);
			const storedRef = readText(rows[0]?.credential_ref);
			if (!storedRef) throw new UserKeyError(missingUserKeyError);
			return { credentialRef: storedRef };
		},

		async getUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			const rows = await client.query(SELECT_BY_NAME_SQL, [userId, name]);
			return decryptOwnedRow(rows[0], userId, key);
		},

		async getUserKeyByRef(params) {
			const userId = requireUserId(params.userId);
			const credentialRef = requireCredentialRef(params.credentialRef);
			const rows = await client.query(SELECT_BY_REF_SQL, [credentialRef]);
			const row = rows[0];
			if (!row) throw new UserKeyError(missingUserKeyError);
			if (readText(row.user_id) !== userId) throw new UserKeyError(foreignUserKeyError);
			return decryptOwnedRow(row, userId, key);
		},

		async disableUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			const existing = await client.query(SELECT_BY_NAME_SQL, [userId, name]);
			if (!existing[0]) throw new UserKeyError(missingUserKeyError);
			await client.query(DISABLE_SQL, [new Date().toISOString(), userId, name]);
		},

		async deleteUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			await client.query(DELETE_SQL, [userId, name]);
		},

		close: () => client.close(),
	};
}

function decryptOwnedRow(row: SqlRow | undefined, userId: string, key: Buffer): string {
	if (!row) throw new UserKeyError(missingUserKeyError);
	if (readText(row.user_id) !== userId) throw new UserKeyError(foreignUserKeyError);
	if (isDisabled(row.disabled)) throw new UserKeyError(disabledUserKeyError);
	const ciphertext = readText(row.ciphertext);
	if (!ciphertext) throw new UserKeyError(missingUserKeyError);
	return decryptSecret(ciphertext, key);
}

function requireUserId(value: string): string {
	if (!isSessionUserId(value)) {
		throw new Error('A session user id is required to access credentials.');
	}
	return value;
}

function requireName(value: string): string {
	const name = value.trim();
	if (!name || name.length > 128) {
		throw new Error('A credential name is required.');
	}
	return name;
}

function requireCredentialRef(value: string): string {
	const credentialRef = value.trim();
	if (!credentialRef) throw new UserKeyError(missingUserKeyError);
	return credentialRef;
}

function requireSecretValue(value: string): string {
	if (!value) throw new Error('A credential value is required.');
	return value;
}

function readText(value: unknown): string | undefined {
	return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isDisabled(value: unknown): boolean {
	return value === true || value === 1 || value === '1' || value === 't' || value === 'true';
}

function createSqlClient(target: DatabaseTarget): SqlClient {
	switch (target.kind) {
		case 'postgres':
			return createPostgresClient(target.connectionString);
		case 'sqlite':
			return createSqliteClient(target.filename);
		default: {
			const exhaustive: never = target;
			throw new Error(`Unexpected store target: ${JSON.stringify(exhaustive)}`);
		}
	}
}

function createPostgresClient(connectionString: string): SqlClient {
	const pool = new Pool({ connectionString, max: 2 });
	if (process.env.VERCEL === '1') attachDatabasePool(pool);
	let ready: Promise<void> | undefined;

	return {
		async query(sql, params) {
			await (ready ??= pool.query(CREATE_TABLE_SQL).then(() => undefined));
			const result = await pool.query(toPostgresSql(sql), [...params]);
			return result.rows;
		},
		close: () => pool.end(),
	};
}

function createSqliteClient(filename: string): SqlClient {
	if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
	const database = new DatabaseSync(filename);
	database.exec(CREATE_TABLE_SQL);

	return {
		async query(sql, params) {
			const statement = database.prepare(sql);
			if (/^\s*SELECT\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) {
				return statement.all(...params);
			}
			statement.run(...params);
			return [];
		},
		async close() {
			database.close();
		},
	};
}

function toPostgresSql(sql: string): string {
	let index = 0;
	return sql.replaceAll('?', () => `$${++index}`);
}

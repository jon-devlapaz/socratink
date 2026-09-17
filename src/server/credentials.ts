import { isSessionUserId } from '../config/session.ts';
import type { CredentialDb } from './credential-db.ts';
import { decryptSecret, deriveCredentialsKey, encryptSecret } from './credential-crypto.ts';

export const missingUserKeyError = {
	type: 'missing_user_key',
	message: 'No credential is stored for this user and name.',
} as const;

export const foreignUserKeyError = {
	type: 'foreign_user_key',
	message: 'This credential does not belong to the current session.',
} as const;

type UserKeyErrorBody = typeof missingUserKeyError | typeof foreignUserKeyError;

export class UserKeyError extends Error {
	readonly type: UserKeyErrorBody['type'];

	constructor(error: UserKeyErrorBody) {
		super(error.message);
		this.name = 'UserKeyError';
		this.type = error.type;
	}
}

export type CredentialStore = {
	updateUserKey(params: {
		userId: string;
		name: string;
		value: string;
	}): Promise<{ credentialRef: string }>;
	getUserKey(params: { userId: string; name: string }): Promise<string>;
	getUserKeyByRef(params: { userId: string; credentialRef: string }): Promise<string>;
	hasUserKey(params: { userId: string; name: string }): Promise<boolean>;
	deleteUserKey(params: { userId: string; name: string }): Promise<void>;
	rekeyUser(params: { fromUserId: string; toUserId: string }): Promise<void>;
	close(): Promise<void>;
};

export function createCredentialStore(options: {
	secret: string;
	db: CredentialDb;
}): CredentialStore {
	const key = deriveCredentialsKey(options.secret);
	const { db } = options;

	return {
		async updateUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			const value = requireSecretValue(params.value);
			const credentialRef = crypto.randomUUID();
			const storedRef = await db.upsert({
				userId,
				name,
				credentialRef,
				ciphertext: encryptSecret(value, key),
			});
			return { credentialRef: storedRef };
		},

		async getUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			const row = await db.getByName({ userId, name });
			if (!row) throw new UserKeyError(missingUserKeyError);
			return decryptSecret(row.ciphertext, key);
		},

		async getUserKeyByRef(params) {
			const userId = requireUserId(params.userId);
			const credentialRef = requireCredentialRef(params.credentialRef);
			const row = await db.getByRef(credentialRef);
			if (!row) throw new UserKeyError(missingUserKeyError);
			if (row.userId !== userId) throw new UserKeyError(foreignUserKeyError);
			return decryptSecret(row.ciphertext, key);
		},

		async hasUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			const row = await db.getByName({ userId, name });
			return row !== undefined;
		},

		async deleteUserKey(params) {
			const userId = requireUserId(params.userId);
			const name = requireName(params.name);
			await db.deleteByName({ userId, name });
		},

		async rekeyUser(params) {
			const fromUserId = requireUserId(params.fromUserId);
			const toUserId = requireUserId(params.toUserId);
			if (fromUserId === toUserId) return;
			await db.rekeyUser({ fromUserId, toUserId });
		},

		close: () => db.close(),
	};
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

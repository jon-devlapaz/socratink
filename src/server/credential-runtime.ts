import {
	resolveCredentialsSecret,
	resolveCredentialStoreTarget,
	type CredentialsEnvironment,
} from '../config/credentials.ts';
import { createCredentialDb } from './credential-db.ts';
import { createCredentialStore, type CredentialStore } from './credentials.ts';

export function openCredentialStore(
	environment: CredentialsEnvironment = process.env,
): CredentialStore {
	return createCredentialStore({
		secret: resolveCredentialsSecret(environment),
		db: createCredentialDb(resolveCredentialStoreTarget(environment)),
	});
}

let opened: CredentialStore | undefined;

export function getCredentialStore(): CredentialStore {
	opened ??= openCredentialStore();
	return opened;
}

import { resolveAuthStoreTarget } from '../config/auth.ts';
import { createAuthDb, type AuthDb } from './auth-db.ts';

let opened: AuthDb | undefined;

export function getAuthDb(): AuthDb {
	opened ??= createAuthDb(resolveAuthStoreTarget(process.env));
	return opened;
}

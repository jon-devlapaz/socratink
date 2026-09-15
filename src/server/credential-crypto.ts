import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const HKDF_SALT = 'socratink-credentials-v1';
const HKDF_INFO = 'aes-256-gcm';

export function deriveCredentialsKey(secret: string): Buffer {
	return Buffer.from(hkdfSync('sha256', secret, HKDF_SALT, HKDF_INFO, KEY_LENGTH));
}

export function encryptSecret(plaintext: string, key: Buffer): string {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LENGTH });
	const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

export function decryptSecret(packed: string, key: Buffer): string {
	const parts = packed.split('.');
	if (parts.length !== 4 || parts[0] !== 'v1') {
		throw new Error('Unsupported credential ciphertext.');
	}

	const iv = Buffer.from(parts[1] ?? '', 'base64url');
	const tag = Buffer.from(parts[2] ?? '', 'base64url');
	const ciphertext = Buffer.from(parts[3] ?? '', 'base64url');
	if (iv.length !== IV_LENGTH || tag.length !== AUTH_TAG_LENGTH) {
		throw new Error('Unsupported credential ciphertext.');
	}

	const decipher = createDecipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LENGTH });
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

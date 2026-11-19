/** A random v4 UUID, also on non-secure pages (http://<lan-ip>) where crypto.randomUUID is absent. */
export function randomId(): string {
	if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	bytes[6] = (bytes[6]! & 0x0f) | 0x40;
	return formatId(bytes);
}

export function feedbackSubmissionId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	let milliseconds = Date.now();
	for (let index = 5; index >= 0; index--) {
		bytes[index] = milliseconds % 256;
		milliseconds = Math.floor(milliseconds / 256);
	}
	bytes[6] = (bytes[6]! & 0x0f) | 0x70;
	return formatId(bytes);
}

function formatId(bytes: Uint8Array): string {
	bytes[8] = (bytes[8]! & 0x3f) | 0x80;
	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

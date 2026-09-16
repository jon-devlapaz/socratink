import assert from 'node:assert/strict';

export function cookiePairFromResponse(response) {
	const listed =
		typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
	const header = listed[0] ?? response.headers.get('set-cookie');
	assert.ok(header, 'session response should set a cookie');
	const pair = header.split(';', 1)[0];
	assert.ok(pair && pair.includes('='), 'session cookie should be a name=value pair');
	assert.match(header, /HttpOnly/i);
	return pair;
}

export function mergeCookies(response, previous = '') {
	const listed =
		typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
	const headers = listed.length > 0 ? listed : [response.headers.get('set-cookie')].filter(Boolean);
	const map = new Map();
	for (const part of previous.split(';').map((entry) => entry.trim()).filter(Boolean)) {
		map.set(part.split('=', 1)[0], part);
	}
	for (const header of headers) {
		const pair = header.split(';', 1)[0];
		if (!pair || !pair.includes('=')) continue;
		map.set(pair.split('=', 1)[0], pair);
	}
	return [...map.values()].join('; ');
}

export async function mintSessionFixture(origin) {
	const response = await fetch(`${origin}/api/session`, { method: 'POST' });
	assert.equal(response.status, 200, 'session fixture should mint a signed cookie');
	const body = await response.json();
	assert.equal(typeof body.userId, 'string');
	assert.ok(body.userId.length > 0);
	assert.equal(body.userId.includes(':'), false);
	return { userId: body.userId, cookie: cookiePairFromResponse(response) };
}

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

export async function mintSessionFixture(origin) {
	const response = await fetch(`${origin}/api/session`, { method: 'POST' });
	assert.equal(response.status, 200, 'session fixture should mint a signed cookie');
	const body = await response.json();
	assert.equal(typeof body.userId, 'string');
	assert.ok(body.userId.length > 0);
	assert.equal(body.userId.includes(':'), false);
	return { userId: body.userId, cookie: cookiePairFromResponse(response) };
}

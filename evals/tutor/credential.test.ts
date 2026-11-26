import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseRoute, credentialRejected, gatewayCredentialProblem, modelRouteProblem, routeStopReason } from './credential.ts';

// Failure case: an expired 12-hour gateway token reached a paid run, and all 24
// conversations failed with HTTP 401 before anyone saw why.
const now = Date.parse('2026-11-26T02:00:00Z');
const token = (exp: number) => `header.${Buffer.from(JSON.stringify({ exp: exp / 1000 })).toString('base64url')}.signature`;

test('an expired gateway token stops the run before any model call, with the fix', () => {
	const problem = gatewayCredentialProblem({ VERCEL_OIDC_TOKEN: token(now - 60_000) }, 30, now);
	assert.match(problem ?? '', /expired at 2026-11-26T01:59:00\.000Z/);
	assert.match(problem ?? '', /AI_GATEWAY_API_KEY/);
});

test('a token that would expire during the run stops it too', () => {
	assert.match(gatewayCredentialProblem({ VERCEL_OIDC_TOKEN: token(now + 10 * 60_000) }, 30, now) ?? '', /before this run can finish/);
	assert.equal(gatewayCredentialProblem({ VERCEL_OIDC_TOKEN: token(now + 90 * 60_000) }, 30, now), undefined);
});

test('a gateway API key is used as is, and no credential at all is named', () => {
	assert.equal(gatewayCredentialProblem({ AI_GATEWAY_API_KEY: 'key', VERCEL_OIDC_TOKEN: token(now - 1) }, 30, now), undefined);
	assert.match(gatewayCredentialProblem({}, 30, now) ?? '', /No AI Gateway credential/);
});

test('the gateway route is chosen when a gateway credential exists, unless --local', () => {
	assert.equal(chooseRoute({ AI_GATEWAY_API_KEY: 'key' }, false), 'gateway');
	assert.equal(chooseRoute({ VERCEL_OIDC_TOKEN: 'token' }, false), 'gateway');
	assert.equal(chooseRoute({ AI_GATEWAY_API_KEY: 'key' }, true), 'local');
	assert.equal(chooseRoute({ JON_LOCAL_BASE_URL: 'http://127.0.0.1:3001/v1' }, false), 'local');
});

test('a 401 or 403 from the provider stops the run; other failures do not', () => {
	assert.equal(credentialRejected('turn ended failed: provider status 401 request errors: HTTP 401'), true);
	assert.equal(credentialRejected('provider status 403'), true);
	assert.equal(credentialRejected('provider status 429'), false);
	assert.equal(credentialRejected(undefined), false);
});

// Failure case: a router with no usable provider key answered HTTP 503 to all 24 conversations.
test('a tiny test request stops a run whose model route cannot answer, with the reason and no key', async () => {
	const target = { baseUrl: 'http://router.test/v1/', modelId: 'm', apiKey: 'secret-key' };
	const sent: { url: string; body: string; auth: string }[] = [];
	const answer = (status: number, body: string): typeof fetch => async (url, init) => {
		sent.push({ url: String(url), body: String(init?.body), auth: new Headers(init?.headers).get('authorization') ?? '' });
		return new Response(body, { status });
	};
	assert.equal(await modelRouteProblem(target, answer(200, '{}')), undefined);
	assert.equal(sent[0]?.url, 'http://router.test/v1/chat/completions');
	assert.equal(JSON.parse(sent[0]?.body ?? '{}').max_tokens, 32);
	assert.equal(JSON.parse(sent[0]?.body ?? '{}').tools?.length, 1, 'a route without tool calling fails the check, as the tutor would');
	assert.equal(sent[0]?.auth, 'Bearer secret-key');
	const refused = await modelRouteProblem(target, answer(503, '{"error":"No usable provider key for secret-key"}'));
	assert.match(refused ?? '', /HTTP 503\) for m: .*No usable provider key/);
	assert.equal(refused?.includes('secret-key'), false);
	const down = await modelRouteProblem(target, async () => { throw new Error('connect ECONNREFUSED'); });
	assert.match(down ?? '', /did not answer: connect ECONNREFUSED/);
});

// Failure case: rate limits failed 21 turns in a row and the run kept going.
test('a run stops on a refused credential at once, or after three first-turn route failures in a row', () => {
	const failed = (status: number) => [{ check: 'turn-completed', status: 'fail', turn: 0, detail: `turn ended failed: provider status ${status}` }];
	const passed = [{ check: 'turn-completed', status: 'pass', turn: 0 }];
	assert.match(routeStopReason(failed(401), { count: 0 }) ?? '', /rejected the model credential/);
	const streak = { count: 0 };
	assert.equal(routeStopReason(failed(429), streak), undefined);
	assert.equal(routeStopReason(failed(429), streak), undefined);
	assert.equal(routeStopReason(passed, streak), undefined, 'a conversation that ran resets the count');
	assert.equal(routeStopReason(failed(429), streak), undefined);
	assert.equal(routeStopReason(failed(503), streak), undefined);
	assert.match(routeStopReason(failed(429), streak) ?? '', /3 conversations in a row \(last: provider status 429\)/);
	const later = [{ check: 'turn-completed', status: 'fail', turn: 2, detail: 'provider status 429' }];
	assert.equal(routeStopReason(later, { count: 2 }), undefined, 'a failure after the first turn is a tutor problem, not the route');
});


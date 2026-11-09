// Keep the built app's OAuth, provider routing, and credential reads intact.
// Only external HTTP transports are replaced with a loopback fixture.
const fixture = new URL(process.env.POSTGRES_SMOKE_FIXTURE_ORIGIN);
if (fixture.protocol !== 'http:' || fixture.hostname !== '127.0.0.1') {
	throw new Error('Postgres smoke requires a loopback fixture.');
}
const redirects = new Map([
	['https://api.openai.com/v1/responses', '/v1/responses'],
	['https://oauth2.googleapis.com/token', '/oauth/token'],
	['https://openidconnect.googleapis.com/v1/userinfo', '/oauth/userinfo'],
]);
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
	const request = new Request(input, init);
	const url = new URL(request.url);
	const path = redirects.get(`${url.origin}${url.pathname}`);
	if (path) return originalFetch(new Request(`${fixture.origin}${path}`, request));
	if (url.origin === fixture.origin) return originalFetch(request);
	throw new Error(`Postgres smoke blocked outbound request to ${url.origin}`);
};

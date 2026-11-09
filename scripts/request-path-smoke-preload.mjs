// Redirect the real provider's HTTP transport; routing, credentials, and Flue run unchanged.
const providerOrigin = new URL(process.env.REQUEST_PATH_SMOKE_PROVIDER_ORIGIN);
if (providerOrigin.hostname !== '127.0.0.1' || providerOrigin.protocol !== 'http:') {
	throw new Error('Request-path smoke requires a loopback fake provider.');
}
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
	const request = new Request(input, init);
	const url = new URL(request.url);
	if (url.origin === 'https://api.openai.com' && url.pathname === '/v1/responses') {
		return originalFetch(new Request(`${providerOrigin.origin}${url.pathname}`, request));
	}
	if (url.origin === providerOrigin.origin) return originalFetch(request);
	throw new Error(`Request-path smoke blocked outbound request to ${url.origin}`);
};

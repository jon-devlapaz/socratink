// A Vercel preview build ends with one tiny real tutor call, so a preview whose model
// call fails never reaches a taster. Any other build calls nothing. Prints the provider's
// HTTP status only, never its error text.
if (process.env.VERCEL_ENV === 'preview') {
	const { probeOnce } = await import('../dist/tutor-probe.mjs');
	const result = await probeOnce();
	if (!result.ok) {
		console.error(`Preview tutor call failed: ${result.status === undefined ? 'no model key in the build' : `provider status ${result.status}`}.`);
		process.exit(1);
	}
	console.log(`Preview tutor call: ok in ${result.latencyMs} ms.`);
}

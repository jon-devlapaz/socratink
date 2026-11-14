export default {
	async fetch(request: Request): Promise<Response> {
		// Vercel's schedule/v1beta trigger makes this function private. These
		// headers select the expected event; they are not public authentication.
		if (request.method !== 'POST' || request.headers.get('ce-type') !== 'com.vercel.schedule.v1beta'
			|| request.headers.get('ce-vssschedulename') !== 'runtime-monitor') {
			return new Response(null, { status: 400 });
		}
		if (process.env.VERCEL_ENV !== 'production') return new Response(null, { status: 204 });
		const token = process.env.MONITOR_GITHUB_TOKEN;
		if (!token) {
			console.error('runtime_monitor_dispatch_unconfigured');
			return new Response(null, { status: 503 });
		}
		try {
			const response = await fetch('https://api.github.com/repos/jon-devlapaz/socratink/actions/workflows/runtime-monitor.yml/dispatches', {
				method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15_000),
				headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
					'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
				body: JSON.stringify({ ref: 'main' }),
			});
			await response.body?.cancel();
			if (response.status !== 204) throw new Error();
			return new Response(null, { status: 200 });
		} catch {
			console.error('runtime_monitor_dispatch_failed');
			return new Response(null, { status: 502 });
		}
	},
};

// dist/app.mjs exists only after `pnpm build`. @ts-ignore stays valid
// both before that file exists and after a local build.
// @ts-ignore
import { loadFlueNodeApplication } from '../dist/app.mjs';

let application = loadFlueNodeApplication();

export default {
	async fetch(request: Request) {
		const oidcToken = request.headers.get('x-vercel-oidc-token');
		if (oidcToken) process.env.VERCEL_OIDC_TOKEN = oidcToken;

		const loaded = await application;
		const activity = loaded.enterActivity();
		try {
			return await loaded.fetch(request);
		} finally {
			activity.release();
		}
	},
};

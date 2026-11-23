import app from '../dist/app.mjs';

export default {
	async fetch(request: Request) {
		const oidcToken = request.headers.get('x-vercel-oidc-token');
		if (oidcToken) process.env.VERCEL_OIDC_TOKEN = oidcToken;
		return app.fetch(request);
	},
};

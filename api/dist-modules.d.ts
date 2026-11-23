declare module '*/dist/app.mjs' {
	const app: { fetch(request: Request): Response | Promise<Response> };
	export default app;
}

declare module '*/dist/tutor-probe.mjs' {
	const probe: { fetch(request: Request): Promise<Response> };
	export default probe;
}

export type Setup = { (): Promise<void>; settled(): Promise<void> };

export function setupOnce(setup: () => Promise<unknown>): Setup {
	let attempt: Promise<void> | undefined;
	const ready = () => attempt ??= setup().then(() => undefined, (error: unknown) => {
		attempt = undefined;
		throw error;
	});
	return Object.assign(ready, { settled: async () => { await attempt?.catch(() => {}); } });
}

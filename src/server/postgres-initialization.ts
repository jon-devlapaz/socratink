export function createPostgresInitializer(
	client: { query(sql: string): Promise<unknown> },
	schema: string,
): () => Promise<void> {
	let ready: Promise<void> | undefined;
	return () => (ready ??= client.query(schema)
		.then(() => undefined)
		.catch((error: unknown) => {
			// Share this failure with current callers; a later request may retry once.
			ready = undefined;
			throw error;
		}));
}

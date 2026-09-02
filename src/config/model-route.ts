export type ModelRouteRecord = {
	readonly routedModel: string;
	readonly fallbackAttempts?: number;
};

export function decodeRoute(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export function parseFallbackAttempts(value: string | undefined): number {
	if (value === undefined) return 0;
	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function routingFromHeaders(headers: Headers | Record<string, string>): {
	readonly present: boolean;
	readonly routedModel?: string;
	readonly fallbackAttempts: number;
} {
	const routedRaw = headerValue(headers, 'x-routed-via');
	const attemptsRaw = headerValue(headers, 'x-fallback-attempts');
	return {
		present: routedRaw !== undefined || attemptsRaw !== undefined,
		...(routedRaw ? { routedModel: decodeRoute(routedRaw) } : {}),
		fallbackAttempts: parseFallbackAttempts(attemptsRaw),
	};
}

export function modelRouteMetadata(record: ModelRouteRecord): { socratink: ModelRouteRecord } {
	return {
		socratink: {
			routedModel: record.routedModel,
			...(record.fallbackAttempts && record.fallbackAttempts > 0
				? { fallbackAttempts: record.fallbackAttempts }
				: {}),
		},
	};
}

export function modelRouteFromMetadata(metadata: unknown): ModelRouteRecord | undefined {
	if (!isRecord(metadata)) return undefined;
	const nested = isRecord(metadata.socratink) ? metadata.socratink : metadata;
	const routedModel = optionalString(nested.routedModel);
	const fallbackAttempts = optionalAttempts(nested.fallbackAttempts);
	if (!routedModel) return undefined;
	return {
		routedModel,
		...(fallbackAttempts ? { fallbackAttempts } : {}),
	};
}

export function formatModelRoute(record: ModelRouteRecord | undefined): string | undefined {
	if (!record?.routedModel) return undefined;
	const fallback =
		record.fallbackAttempts && record.fallbackAttempts > 0 ? ` · ↻${record.fallbackAttempts}` : '';
	return `${record.routedModel}${fallback}`;
}

export function modelRouteLabel(metadata: unknown): string | undefined {
	return formatModelRoute(modelRouteFromMetadata(metadata));
}

function headerValue(headers: Headers | Record<string, string>, name: string): string | undefined {
	if (headers instanceof Headers) return nonempty(headers.get(name));
	const lower = name.toLowerCase();
	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() === lower) return nonempty(value);
	}
	return undefined;
}

function nonempty(value: string | null | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

function optionalString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function optionalAttempts(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined;
	return Math.trunc(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

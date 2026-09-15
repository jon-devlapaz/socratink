export type RateLimitClock = {
	now(): number;
};

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

export type RateLimiter = {
	consume(key: string): RateLimitResult;
};

// Internal process default, not a public SLA. Tests inject a fake clock and max.
export const chatRateLimitWindowMs = 60_000;
export const chatRateLimitMax = 120;

export function createRateLimiter(options: {
	windowMs: number;
	max: number;
	clock?: RateLimitClock;
}): RateLimiter {
	const clock = options.clock ?? { now: () => Date.now() };
	const buckets = new Map<string, { count: number; windowStart: number }>();

	return {
		consume(key: string): RateLimitResult {
			const now = clock.now();
			const bucket = buckets.get(key);
			if (!bucket || now - bucket.windowStart >= options.windowMs) {
				buckets.set(key, { count: 1, windowStart: now });
				return { ok: true };
			}
			if (bucket.count >= options.max) {
				return { ok: false, retryAfterMs: options.windowMs - (now - bucket.windowStart) };
			}
			bucket.count += 1;
			return { ok: true };
		},
	};
}

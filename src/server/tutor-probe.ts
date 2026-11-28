import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { normalizeContext } from '@earendil-works/pi-ai/utils/transcript';
import { setTimeout as sleep } from 'node:timers/promises';
import { modelConfig } from '../inference/index.ts';
import { resolveChatModel } from '../inference/operator.ts';
import { operatorApiModel, providerHttpStatus } from './durable/provider.ts';
import { reportFailure } from './logging.ts';

/** One tiny real call through the model, key and limits a learner's turn uses, with one
 * retry after a 429. It passes only on a non-empty reply text. `status` is the provider's
 * HTTP status only, never its error text; it is undefined when no model is configured.
 * Sends no learner data. */
export async function probeOnce(): Promise<{ ok: boolean; status: number | null | undefined; latencyMs: number }> {
	const started = Date.now();
	const operator = resolveChatModel(process.env);
	if (!operator) return { ok: false, status: undefined, latencyMs: 0 };
	const config = modelConfig(operator);
	const model = operatorApiModel(config);
	const call = async () => {
		let status: number | null = null;
		const reply = await openAICompletionsApi().streamSimple(model,
			normalizeContext({ messages: [{ role: 'user', content: 'Reply with the single word: ok', timestamp: Date.now() }] }),
			{ apiKey: config.apiKey, maxTokens: model.maxTokens, signal: AbortSignal.timeout(60_000),
				onResponse: (response) => { status = response.status; } }).result();
		status ??= providerHttpStatus(reply.errorMessage) ?? null;
		const text = reply.content.some((block) => block.type === 'text' && block.text.trim() !== '');
		return { status, ok: status === 200 && reply.stopReason !== 'error' && reply.stopReason !== 'aborted' && text };
	};
	let result = await call();
	if (result.status === 429) {
		await sleep(5_000);
		result = await call();
	}
	return { ...result, latencyMs: Date.now() - started };
}

/** Once a day in production, one tiny real call through the model, key and limits a
 * learner's turn uses. A pass needs a non-empty reply text; reasoning alone fails.
 * A failure logs `probe_failed` with the provider's HTTP status only, so the runtime
 * monitor fails its GitHub run. Sends no learner data and writes nothing. Other
 * deployments and requests that are not its schedule event call nothing. */
export default {
	async fetch(request: Request): Promise<Response> {
		// Vercel's schedule/v1beta trigger makes this function private. These
		// headers select the expected event; they are not public authentication.
		if (request.method !== 'POST' || request.headers.get('ce-type') !== 'com.vercel.schedule.v1beta'
			|| request.headers.get('ce-vssschedulename') !== 'tutor-probe') {
			return new Response(null, { status: 400 });
		}
		if (process.env.VERCEL_ENV !== 'production') return new Response(null, { status: 204 });
		const oidcToken = request.headers.get('x-vercel-oidc-token');
		if (oidcToken) process.env.VERCEL_OIDC_TOKEN = oidcToken;
		const result = await probeOnce();
		if (!result.ok) {
			reportFailure('probe_failed', { providerStatus: result.status ?? null });
			return new Response(null, { status: result.status === undefined ? 503 : 502 });
		}
		console.log(JSON.stringify({ event: 'socratink_probe', status: 'ok', latencyMs: result.latencyMs }));
		return new Response(null, { status: 200 });
	},
};

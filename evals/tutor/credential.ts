// The model credential a paid eval needs, checked before any model call.
// A VERCEL_OIDC_TOKEN from `vercel env pull` lasts about 12 hours; an expired one
// once failed all 24 conversations of a run with HTTP 401. AI_GATEWAY_API_KEY
// does not expire that way, so the eval prefers it.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

type Environment = Record<string, string | undefined>;

/** Loads .env and .env.local from here, then from the main checkout when this is a
 * git worktree, which has no env files of its own. Values already set win. */
export function loadEvalEnvironment(cwd = process.cwd()): string[] {
	const roots = [resolve(cwd)];
	try {
		const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd, encoding: 'utf8' }).trim();
		roots.push(dirname(common));
	} catch {}
	const loaded: string[] = [];
	for (const file of [...new Set(roots)].flatMap((root) => [join(root, '.env.local'), join(root, '.env')])) {
		if (!existsSync(file) || loaded.includes(file)) continue;
		process.loadEnvFile(file);
		loaded.push(file);
	}
	return loaded;
}

/** The AI Gateway route when a gateway credential exists, unless the run asks for the local model. */
export function chooseRoute(environment: Environment, local: boolean): 'gateway' | 'local' {
	if (local) return 'local';
	return environment.VERCEL === '1' || environment.AI_GATEWAY_API_KEY || environment.VERCEL_OIDC_TOKEN ? 'gateway' : 'local';
}

/** Why the gateway credential cannot last this run, or undefined when it can. */
export function gatewayCredentialProblem(environment: Environment, minutesNeeded: number, now = Date.now()): string | undefined {
	if (environment.AI_GATEWAY_API_KEY) return undefined;
	const token = environment.VERCEL_OIDC_TOKEN;
	const fix = 'Add a long-lived AI_GATEWAY_API_KEY to .env (it does not expire every 12 hours), or refresh the token with `vercel env pull .env.local`.';
	if (!token) return `No AI Gateway credential. ${fix}`;
	const expires = tokenExpiry(token);
	if (expires === undefined) return undefined;
	if (expires <= now) return `The AI Gateway token (VERCEL_OIDC_TOKEN) expired at ${new Date(expires).toISOString()}. ${fix}`;
	if (expires < now + minutesNeeded * 60_000) {
		return `The AI Gateway token (VERCEL_OIDC_TOKEN) expires at ${new Date(expires).toISOString()}, before this run can finish. ${fix}`;
	}
	return undefined;
}

function tokenExpiry(token: string): number | undefined {
	try {
		const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { exp?: unknown };
		return typeof payload.exp === 'number' ? payload.exp * 1000 : undefined;
	} catch {
		return undefined;
	}
}

/** A provider refusing the credential fails every later turn the same way, so the run stops. */
export function credentialRejected(detail: string | undefined): boolean {
	return /provider status (?:401|403)\b/u.test(detail ?? '');
}

type ProbeTarget = { baseUrl?: string; modelId: string; apiKey?: string };

/** One tiny request to the chosen model before a paid run (32 tokens, so a reasoning model can still answer, with one tool). A route that cannot
 * answer (an expired or missing credential, a router with no usable provider key,
 * an unknown model) stops the run here, with the provider's reason, instead of
 * failing every conversation. Returns undefined when the model answered. */
export async function modelRouteProblem(target: ProbeTarget, request: typeof fetch = fetch): Promise<string | undefined> {
	if (!target.baseUrl) return `The model route has no base URL for ${target.modelId}.`;
	let response: Response;
	try {
		response = await request(`${target.baseUrl.replace(/\/$/u, '')}/chat/completions`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', ...(target.apiKey ? { authorization: `Bearer ${target.apiKey}` } : {}) },
			body: JSON.stringify({ model: target.modelId, messages: [{ role: 'user', content: 'Reply with OK.' }], max_tokens: 32, stream: false,
				// The tutor calls tools, so a route that cannot must fail here too.
				tools: [{ type: 'function', function: { name: 'route_check', description: 'Not used.', parameters: { type: 'object', properties: {} } } }] }),
			signal: AbortSignal.timeout(60_000),
		});
	} catch (error) {
		return `The model route did not answer: ${error instanceof Error ? error.message : String(error)}.`;
	}
	if (response.ok) return undefined;
	const body = (await response.text().catch(() => '')).replace(/\s+/gu, ' ').slice(0, 300);
	const secret = target.apiKey;
	return `The model route refused a tiny test request (HTTP ${response.status}) for ${target.modelId}: ${secret ? body.replaceAll(secret, '[key]') : body}`;
}

type FirstTurnCheck = { check: string; status: string; turn?: number; detail?: string };

/** Why a run should stop after this conversation, or undefined to go on: a refused credential
 * at once, or a route failing three conversations in a row on their first turn (rate limits,
 * an exhausted router), since every later conversation would fail the same way. */
export function routeStopReason(checks: readonly FirstTurnCheck[], streak: { count: number }): string | undefined {
	const failed = checks.find((check) => check.check === 'turn-completed' && check.status === 'fail' && (check.turn ?? 0) === 0
		&& /provider status \d{3}/u.test(check.detail ?? ''));
	if (failed && credentialRejected(failed.detail)) return 'the provider rejected the model credential, so every later turn would fail the same way.';
	streak.count = failed ? streak.count + 1 : 0;
	if (streak.count < 3) return undefined;
	const status = /provider status (\d{3})/u.exec(failed?.detail ?? '')?.[1];
	return `the model route failed the first turn of ${streak.count} conversations in a row (last: provider status ${status}), so later ones would fail too.`;
}


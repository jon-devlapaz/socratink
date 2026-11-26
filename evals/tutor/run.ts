// Runs scripted conversations through the real durable engine, tools, hooks and consent
// projection, then checks what the learner saw. The model is whatever `resolveModel`
// returns: a fake server in tests, the operator model when live.
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import type { Engine, EngineOptions, Snapshot } from '../../src/server/durable/contract.ts';
import { openEngine } from '../../src/server/durable/engine.ts';
import { project } from '../../src/server/durable/browser-projection.ts';
import { replyChecks, type CheckName, type CheckResult } from './checks.ts';
import type { Scenario, Turn } from './scenarios.ts';

export type ScenarioResult = { scenario: string; run: number; turns: Turn[]; checks: CheckResult[] };

// Submission errors are generic on purpose; `providerStatus` adds the HTTP status the engine logged,
// and `providerErrors` the request failures this process saw during the turn.
async function runScenario(engine: Engine, scenario: Scenario, conversationId: string, turnTimeoutMs: number,
	providerStatus: (conversationId: string, submissionId: string) => Promise<number | undefined>,
	providerErrors: () => string[]): Promise<Omit<ScenarioResult, 'scenario' | 'run'>> {
	const turns: Turn[] = [];
	while (turns.length < (scenario.maxTurns ?? 6)) {
		const next = scenario.next(turns);
		if (!next) break;
		const { text, cardHelp, ...flags } = next;
		providerErrors();
		const started = Date.now();
		const submissionId = await engine.submit(conversationId, text, undefined, cardHelp);
		const state = await settled(engine, conversationId, submissionId, turnTimeoutMs);
		const submission = state.submissions.find((s) => s.id === submissionId);
		const outcome = submission?.outcome ?? 'timeout';
		const reply = project(conversationId, state).messages.find((m) => m.submissionId === submissionId && m.role === 'assistant');
		const status = outcome === 'completed' ? undefined : await providerStatus(conversationId, submissionId);
		const seen = outcome === 'completed' ? [] : [...new Set(providerErrors())];
		const error = outcome === 'completed' ? '' : [submission?.error, status ? `provider status ${status}` : undefined,
			seen.length ? `request errors: ${seen.join(' | ')}` : undefined, `after ${Date.now() - started} ms`].filter(Boolean).join(' ');
		turns.push({ ...flags, learner: text, outcome, reply, ...(error ? { error } : {}) });
		if (outcome !== 'completed') break;
	}
	const checks: CheckResult[] = [
		...turns.flatMap((turn, index) => [
			{ check: 'turn-completed' as const, status: turn.outcome === 'completed' ? 'pass' as const : 'fail' as const, turn: index,
				...(turn.outcome === 'completed' ? {} : { detail: `turn ended ${turn.outcome}${turn.error ? `: ${turn.error}` : ''}` }) },
			...(turn.reply ? replyChecks(turn.reply).map((c) => ({ ...c, turn: index })) : []),
		]),
		...scenario.expect(turns),
	];
	return { turns, checks };
}

async function settled(engine: Engine, conversationId: string, submissionId: string, timeoutMs: number): Promise<Snapshot> {
	const until = Date.now() + timeoutMs;
	for (;;) {
		const state = await engine.snapshot(conversationId);
		if (state.submissions.find((s) => s.id === submissionId)?.outcome || Date.now() > until) return state;
		await delay(250);
	}
}

/** Each scenario `runs` times, each in a fresh conversation, on a temporary SQLite
 * database that is removed afterwards. */
export async function runEval(options: { scenarios: readonly Scenario[]; runs?: number; resolveModel: EngineOptions['resolveModel'];
	turnTimeoutMs?: number; onResult?: (result: ScenarioResult) => void }): Promise<ScenarioResult[]> {
	await mkdir('.cache', { recursive: true });
	const directory = await mkdtemp(resolve('.cache/tutor-eval-db-'));
	const work: Promise<void>[] = [];
	const statuses = new Map<string, number>();
	const keys = new Set<string>();
	const watch = watchRequestFailures(keys);
	const engine = await openEngine({ target: { kind: 'sqlite', filename: join(directory, 'pi.sqlite') },
		resolveModel: async (...args) => {
			const config = await options.resolveModel(...args);
			if (config.apiKey) keys.add(config.apiKey);
			return config;
		}, keepAlive: (promise) => work.push(promise),
		logTurn: (turn) => { if (turn.providerStatus) statuses.set(`${turn.conversationId}:${turn.submissionId}`, turn.providerStatus); } });
	// The engine logs a turn after it settles, so wait for its work before reading.
	const providerStatus = async (conversationId: string, submissionId: string) => {
		await Promise.allSettled(work);
		return statuses.get(`${conversationId}:${submissionId}`);
	};
	const results: ScenarioResult[] = [];
	try {
		for (let run = 1; run <= (options.runs ?? 1); run += 1) {
			for (const scenario of options.scenarios) {
				let outcome: Omit<ScenarioResult, 'scenario' | 'run'>;
				try {
					outcome = await runScenario(engine, scenario, `learner:tutor-eval-${scenario.name}-${run}`, options.turnTimeoutMs ?? 300_000, providerStatus, watch.take);
				} catch (error) {
					outcome = { turns: [], checks: [{ check: 'scenario-ran', status: 'fail', detail: error instanceof Error ? error.message : String(error) }] };
				}
				const result = { scenario: scenario.name, run, ...outcome };
				results.push(result);
				options.onResult?.(result);
			}
		}
	} finally {
		await Promise.allSettled(work);
		await engine.close();
		watch.restore();
		await rm(directory, { recursive: true, force: true });
	}
	return results;
}

/** The engine keeps provider text out of its turn records, so the eval watches this
 * process's fetch calls to report why a turn failed. Turns run one at a time, so a
 * failure belongs to the turn in flight. A stream that breaks after a 2xx is not seen. */
function watchRequestFailures(keys: ReadonlySet<string>) {
	const original = globalThis.fetch;
	const failures: string[] = [];
	const redact = (text: string) => [...keys].reduce((result, key) => result.split(key).join('[redacted]'), text).slice(0, 300);
	globalThis.fetch = async (input, init) => {
		try {
			const response = await original(input, init);
			if (!response.ok) failures.push(redact(`HTTP ${response.status}: ${await response.clone().text().catch(() => '')}`));
			return response;
		} catch (error) {
			failures.push(redact(describe(error)));
			throw error;
		}
	};
	return { take: () => failures.splice(0), restore: () => { globalThis.fetch = original; } };
}

function describe(error: unknown): string {
	if (!(error instanceof Error)) return String(error);
	const cause = error.cause instanceof Error ? error.cause : undefined;
	const code = cause && 'code' in cause ? ` ${String(cause.code)}` : '';
	return cause ? `${error.message} (${cause.message}${code})` : error.message;
}

export type Counts = { pass: number; fail: number; skip: number };

export function summarize(results: readonly ScenarioResult[]): Partial<Record<CheckName, Counts>> {
	const summary: Partial<Record<CheckName, Counts>> = {};
	for (const { check, status } of results.flatMap((r) => r.checks)) {
		const counts = summary[check] ??= { pass: 0, fail: 0, skip: 0 };
		counts[status] += 1;
	}
	return summary;
}

// Runs scripted conversations through the real durable engine, tools, hooks and consent
// projection, then checks what the learner saw. The model is whatever `resolveModel`
// returns: a fake server in tests, the operator model when live.
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import type { Engine, EngineOptions, Snapshot, TurnRecord } from '../../src/server/durable/contract.ts';
import { BACKGROUND_CONTEXT as context } from '@earendil-works/chord/context';
import { ROOT_CONVERSATION_ID } from '@earendil-works/pi-durable';
import { openEngine } from '../../src/server/durable/engine.ts';
import { createDurableStorage } from '../../src/server/durable/storage.ts';
import { project } from '../../src/server/durable/browser-projection.ts';
import { replyChecks, type CheckName, type CheckResult } from './checks.ts';
import type { Scenario, Turn } from './scenarios.ts';

type TurnDiagnostics = Partial<Pick<TurnRecord, 'providerStatus' | 'latencyMs'>> & { providerError?: string };

export type ScenarioResult = { scenario: string; run: number; turns: Turn[]; checks: CheckResult[] };

// Submission errors are generic on purpose; `turnLog` adds what the engine logged: the
// HTTP status, the provider's redacted error text and the turn's latency.
async function runScenario(engine: Engine, scenario: Scenario, conversationId: string, turnTimeoutMs: number,
	turnLog: (conversationId: string, submissionId: string) => Promise<TurnDiagnostics | undefined>): Promise<Omit<ScenarioResult, 'scenario' | 'run'>> {
	const turns: Turn[] = [];
	while (turns.length < (scenario.maxTurns ?? 6)) {
		const next = scenario.next(turns);
		if (!next) break;
		const { text, ...flags } = next;
		const submissionId = await engine.submit(conversationId, text);
		const state = await settled(engine, conversationId, submissionId, turnTimeoutMs);
		const submission = state.submissions.find((s) => s.id === submissionId);
		const outcome = submission?.outcome ?? 'timeout';
		const reply = project(conversationId, state).messages.find((m) => m.submissionId === submissionId && m.role === 'assistant');
		const log = outcome === 'completed' ? undefined : await turnLog(conversationId, submissionId);
		const error = [submission?.error, log?.providerStatus ? `provider status ${log.providerStatus}` : undefined,
			log?.providerError ? `(${log.providerError})` : undefined, log?.latencyMs ? `after ${log.latencyMs} ms` : undefined].filter(Boolean).join(' ');
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
	const logs = new Map<string, TurnRecord>();
	const target = { kind: 'sqlite', filename: join(directory, 'pi.sqlite') } as const;
	const engine = await openEngine({ target,
		resolveModel: options.resolveModel, keepAlive: (promise) => work.push(promise),
		logTurn: (turn) => logs.set(`${turn.conversationId}:${turn.submissionId}`, turn) });
	// The engine logs a turn after it settles, so wait for its work before reading. The turn
	// log carries no provider text, so the eval reads the provider's (redacted) error from its
	// own temporary database before that is removed.
	const turnLog = async (conversationId: string, submissionId: string): Promise<TurnDiagnostics> => {
		await Promise.allSettled(work);
		const log = logs.get(`${conversationId}:${submissionId}`);
		return { ...(log?.providerStatus ? { providerStatus: log.providerStatus } : {}), ...(log ? { latencyMs: log.latencyMs } : {}),
			...await providerError(target, conversationId) };
	};
	const results: ScenarioResult[] = [];
	try {
		for (let run = 1; run <= (options.runs ?? 1); run += 1) {
			for (const scenario of options.scenarios) {
				let outcome: Omit<ScenarioResult, 'scenario' | 'run'>;
				try {
					outcome = await runScenario(engine, scenario, `learner:tutor-eval-${scenario.name}-${run}`, options.turnTimeoutMs ?? 300_000, turnLog);
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
		await rm(directory, { recursive: true, force: true });
	}
	return results;
}

/** The last provider error the conversation stored, already redacted by the provider adapter. */
async function providerError(target: EngineOptions['target'], conversationId: string): Promise<{ providerError?: string }> {
	const manager = createDurableStorage(target);
	try {
		const storage = await manager.read(conversationId);
		const recent = await storage.scanEntries({ conversationId: ROOT_CONVERSATION_ID, order: 'descending' }, 20, undefined, context);
		const failed = recent.items.flatMap((entry) => [...(entry.model ?? [])].reverse())
			.find((message) => message.role === 'assistant' && message.stopReason === 'error');
		const text = failed?.role === 'assistant' ? failed.errorMessage?.slice(0, 500) : undefined;
		return text ? { providerError: text } : {};
	} catch { return {}; } finally { await manager.close(); }
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

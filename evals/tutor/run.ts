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

async function runScenario(engine: Engine, scenario: Scenario, conversationId: string, turnTimeoutMs: number): Promise<Omit<ScenarioResult, 'scenario' | 'run'>> {
	const turns: Turn[] = [];
	while (turns.length < (scenario.maxTurns ?? 6)) {
		const next = scenario.next(turns);
		if (!next) break;
		const { text, ...flags } = next;
		const submissionId = await engine.submit(conversationId, text);
		const state = await settled(engine, conversationId, submissionId, turnTimeoutMs);
		const outcome = state.submissions.find((s) => s.id === submissionId)?.outcome ?? 'timeout';
		const reply = project(conversationId, state).messages.find((m) => m.submissionId === submissionId && m.role === 'assistant');
		turns.push({ ...flags, learner: text, outcome, reply });
		if (outcome !== 'completed') break;
	}
	const checks: CheckResult[] = [
		...turns.flatMap((turn, index) => [
			{ check: 'turn-completed' as const, status: turn.outcome === 'completed' ? 'pass' as const : 'fail' as const, turn: index,
				...(turn.outcome === 'completed' ? {} : { detail: `turn ended ${turn.outcome}` }) },
			...(turn.reply ? replyChecks(turn.reply).map((c) => ({ ...c, turn: index })) : []),
		]),
		...(turns.every((turn) => turn.outcome === 'completed') ? scenario.expect(turns) : []),
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
	const engine = await openEngine({ target: { kind: 'sqlite', filename: join(directory, 'pi.sqlite') },
		resolveModel: options.resolveModel, keepAlive: (promise) => work.push(promise) });
	const results: ScenarioResult[] = [];
	try {
		for (let run = 1; run <= (options.runs ?? 1); run += 1) {
			for (const scenario of options.scenarios) {
				let outcome: Omit<ScenarioResult, 'scenario' | 'run'>;
				try {
					outcome = await runScenario(engine, scenario, `learner:tutor-eval-${scenario.name}-${run}`, options.turnTimeoutMs ?? 300_000);
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

export type Counts = { pass: number; fail: number; skip: number };

export function summarize(results: readonly ScenarioResult[]): Partial<Record<CheckName, Counts>> {
	const summary: Partial<Record<CheckName, Counts>> = {};
	for (const { check, status } of results.flatMap((r) => r.checks)) {
		const counts = summary[check] ??= { pass: 0, fail: 0, skip: 0 };
		counts[status] += 1;
	}
	return summary;
}

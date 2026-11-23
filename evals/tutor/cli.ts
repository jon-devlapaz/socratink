// Tutor behaviour eval against the real tutor model. This calls a paid model, so it
// refuses to run without --live. Learner text is synthetic; nothing is sent to Modem.
//
//   VERCEL=1 AI_GATEWAY_API_KEY=... pnpm eval:tutor --live [--runs 3] [--only name,name]
//
// Without VERCEL=1 it uses the JON_LOCAL_* model, as `pnpm dev` does. Writes the full
// transcripts and results to .cache/tutor-eval/<time>.json and exits 1 on any failed check.
import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { modelConfig } from '../../src/inference/index.ts';
import { resolveChatModel } from '../../src/inference/operator.ts';
import { scenarios as allScenarios } from './scenarios.ts';
import { runEval, summarize } from './run.ts';

const { values } = parseArgs({ options: {
	live: { type: 'boolean', default: false },
	runs: { type: 'string', default: '1' },
	only: { type: 'string' },
	list: { type: 'boolean', default: false },
} });

const only = values.only?.split(',').map((name) => name.trim()).filter(Boolean);
const scenarios = only ? allScenarios.filter((s) => only.includes(s.name)) : allScenarios;
const runs = Number.parseInt(values.runs ?? '1', 10);
if (only && scenarios.length !== only.length) {
	console.error(`Unknown scenario. Known: ${allScenarios.map((s) => s.name).join(', ')}`);
	process.exit(2);
}
if (!Number.isInteger(runs) || runs < 1 || runs > 20) {
	console.error('--runs must be a whole number from 1 to 20.');
	process.exit(2);
}
if (values.list || !values.live) {
	for (const s of scenarios) console.log(`${s.name}${s.issue ? ` (#${s.issue})` : ''}: ${s.summary}`);
	if (!values.live) console.log('\nThis eval calls the real tutor model. Add --live to run it.');
	process.exit(values.list ? 0 : 2);
}

// Synthetic eval conversations must not create Modem feedback.
delete process.env.VITE_MODEM_FEEDBACK_TOKEN;
const operator = resolveChatModel(process.env);
if (!operator) {
	console.error('No model credential: set AI_GATEWAY_API_KEY (with VERCEL=1) or the JON_LOCAL_* settings.');
	process.exit(2);
}
const config = modelConfig(operator);
console.log(`Model: ${config.modelId} at ${config.baseUrl}${config.fallbackModelIds?.length ? ` (fallback ${config.fallbackModelIds.join(', ')})` : ''}`);
console.log(`Scenarios: ${scenarios.length} x ${runs} run(s)\n`);

const started = new Date();
const results = await runEval({ scenarios, runs, resolveModel: async () => config, onResult: (entry) => {
	const failed = entry.checks.filter((c) => c.status === 'fail');
	const skippedCount = entry.checks.filter((c) => c.status === 'skip').length;
	console.log(`${failed.length ? 'FAIL' : 'PASS'} ${entry.scenario} run ${entry.run}: ${entry.turns.length} turn(s)${skippedCount ? `, ${skippedCount} skipped` : ''}`);
	for (const c of failed) console.log(`  - ${c.check}${c.turn === undefined ? '' : ` (turn ${c.turn + 1})`}: ${c.detail ?? ''}`);
} });

const summary = summarize(results);
console.log('\nCheck                      pass  fail  skip');
for (const [check, counts] of Object.entries(summary)) {
	console.log(`${check.padEnd(26)} ${String(counts.pass).padStart(4)}  ${String(counts.fail).padStart(4)}  ${String(counts.skip).padStart(4)}`);
}
await mkdir('.cache/tutor-eval', { recursive: true });
const file = `.cache/tutor-eval/${started.toISOString().replace(/[:.]/g, '-')}.json`;
await writeFile(file, JSON.stringify({ model: config.modelId, fallbackModelIds: config.fallbackModelIds ?? [], startedAt: started.toISOString(),
	runs, summary, results }, null, 2));
console.log(`\nTranscripts and results: ${file}`);
console.log('A pass shows the rule held in these synthetic runs only. It does not establish learning effectiveness.');
process.exit(Object.values(summary).some((counts) => counts.fail > 0) ? 1 : 0);

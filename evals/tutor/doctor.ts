// `pnpm eval:tutor:doctor [--local | --gateway]`: is a paid tutor eval ready to run here?
// It loads the env files the eval would, reports the route, the model, and the
// credential (with a 12-hour token's expiry), then sends one tiny request with a
// tool. It prints each problem with its fix and exits 2, or prints "Ready" and exits 0.
// It never prints a credential.
import { parseArgs } from 'node:util';
import { modelConfig } from '../../src/inference/index.ts';
import { resolveChatModel } from '../../src/inference/operator.ts';
import { chooseRoute, gatewayCredentialProblem, loadEvalEnvironment, modelRouteProblem } from './credential.ts';

export type DoctorReport = { lines: string[]; problem?: string };

export async function doctor(options: { local: boolean; gateway?: boolean; minutes: number; probe?: typeof modelRouteProblem;
	load?: () => string[] }): Promise<DoctorReport> {
	const loaded = (options.load ?? loadEvalEnvironment)();
	// CI must use the production route: a missing secret arrives as an empty string and must not fall back to a local model.
	const route = options.gateway ? 'gateway' : chooseRoute(process.env, options.local);
	if (route === 'gateway') process.env.VERCEL = '1';
	else delete process.env.VERCEL;
	const lines = [
		`Env files: ${loaded.length ? loaded.join(', ') : 'none'}`,
		`Route: ${route === 'gateway' ? 'AI Gateway' : 'JON_LOCAL_* model'}`,
	];
	if (route === 'gateway') {
		const credential = process.env.AI_GATEWAY_API_KEY ? 'AI_GATEWAY_API_KEY' : process.env.VERCEL_OIDC_TOKEN ? 'VERCEL_OIDC_TOKEN (lasts about 12 hours)' : 'none';
		lines.push(`Credential: ${credential}`);
		const problem = gatewayCredentialProblem(process.env, options.minutes);
		if (problem) return { lines, problem: process.env.GITHUB_ACTIONS ? `${problem} In GitHub, set it as the AI_GATEWAY_API_KEY secret of the tutor-eval environment.` : problem };
	}
	const operator = resolveChatModel(process.env);
	if (!operator) return { lines, problem: 'No model credential: add AI_GATEWAY_API_KEY to .env, or set the JON_LOCAL_* settings and use --local.' };
	const config = modelConfig(operator);
	lines.push(`Model: ${config.modelId}${config.fallbackModelIds?.length ? ` (fallback ${config.fallbackModelIds.join(', ')})` : ''}`);
	const problem = await (options.probe ?? modelRouteProblem)(config);
	if (problem) return { lines, problem };
	lines.push('Model check: answered a tiny request with a tool');
	return { lines };
}

async function main() {
	const { values } = parseArgs({ options: { local: { type: 'boolean', default: false }, gateway: { type: 'boolean', default: false },
		minutes: { type: 'string', default: '90' } } });
	const minutes = Number(values.minutes);
	const report = await doctor({ local: values.local, gateway: values.gateway, minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 90 });
	for (const line of report.lines) console.log(line);
	if (report.problem) {
		console.error(`Not ready: ${report.problem}`);
		process.exit(2);
	}
	console.log('Ready for a paid tutor eval.');
}

if (process.argv[1]?.endsWith('evals/tutor/doctor.ts')) await main();

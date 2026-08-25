/**
 * Optional Braintrust observability for Chat/Flue runs.
 *
 * Purpose: attach a development logger when a key is present.
 * Inputs: process environment and optional test adapters.
 * Outputs: Flue instrumentation, or a no-op when no key exists.
 * Constraints: do not configure on import; the chat app calls configureBraintrust.
 */
import { instrument } from '@flue/runtime';
import { braintrustFlueInstrumentation, initLogger } from 'braintrust';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { braintrustProjectName } from './config/environment.ts';

type BraintrustEnvironment = {
	readonly BRAINTRUST_API_KEY?: string;
	readonly BRAINTRUST_PROJECT_NAME?: string;
};

type BraintrustDependencies<TInstrumentation> = {
	initLogger(options: { projectName: string; apiKey: string }): unknown;
	createFlueInstrumentation(): TInstrumentation;
	instrument(instrumentation: TInstrumentation): unknown;
};

const productionDependencies: BraintrustDependencies<
	ReturnType<typeof braintrustFlueInstrumentation>
> = {
	initLogger,
	createFlueInstrumentation: braintrustFlueInstrumentation,
	instrument,
};

export function resolveBraintrustApiKey(
	environment: BraintrustEnvironment,
	startDirectory = process.cwd(),
): string | undefined {
	const environmentKey = environment.BRAINTRUST_API_KEY?.trim();
	if (environmentKey) return environmentKey;

	let directory = resolve(startDirectory);
	while (true) {
		try {
			const fileKey = parseEnv(readFileSync(join(directory, '.env.braintrust'), 'utf8'))
				.BRAINTRUST_API_KEY?.trim();
			return fileKey || undefined;
		} catch (error) {
			if (
				typeof error !== 'object' ||
				error === null ||
				!('code' in error) ||
				error.code !== 'ENOENT'
			) {
				return undefined;
			}
		}

		const parent = dirname(directory);
		if (parent === directory) return undefined;
		directory = parent;
	}
}

export function configureBraintrust<TInstrumentation>(
	environment: BraintrustEnvironment,
	dependencies: BraintrustDependencies<TInstrumentation> = productionDependencies as BraintrustDependencies<TInstrumentation>,
	startDirectory = process.cwd(),
): void {
	const apiKey = resolveBraintrustApiKey(environment, startDirectory);
	if (!apiKey) return;

	dependencies.initLogger({
		projectName: braintrustProjectName(environment),
		apiKey,
	});

	dependencies.instrument(dependencies.createFlueInstrumentation());
}

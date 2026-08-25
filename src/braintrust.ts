import { instrument } from '@flue/runtime';
import { braintrustFlueInstrumentation, initLogger } from 'braintrust';

type BraintrustEnvironment = {
	readonly BRAINTRUST_API_KEY?: string;
	readonly BRAINTRUST_PROJECT_NAME?: string;
};

type BraintrustDependencies<TInstrumentation> = {
	initLogger(options: { projectName: string; apiKey: string }): unknown;
	createFlueInstrumentation(): TInstrumentation;
	instrument(instrumentation: TInstrumentation): unknown;
};

export function configureBraintrust<TInstrumentation>(
	environment: BraintrustEnvironment,
	dependencies: BraintrustDependencies<TInstrumentation>,
): void {
	const apiKey = environment.BRAINTRUST_API_KEY;
	if (!apiKey) return;

	dependencies.initLogger({
		projectName: environment.BRAINTRUST_PROJECT_NAME ?? 'socratink',
		apiKey,
	});

	dependencies.instrument(dependencies.createFlueInstrumentation());
}

configureBraintrust(process.env, {
	initLogger,
	createFlueInstrumentation: braintrustFlueInstrumentation,
	instrument,
});

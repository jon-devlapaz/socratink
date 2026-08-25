import { appConfig } from './app.config.ts';

export type AppEnvironment = {
	readonly JON_LOCAL_API_KEY?: string;
	readonly JON_LOCAL_BASE_URL?: string;
	readonly BRAINTRUST_API_KEY?: string;
	readonly BRAINTRUST_PROJECT_NAME?: string;
};

export function localModelBaseUrl(environment: AppEnvironment): string {
	return environment.JON_LOCAL_BASE_URL ?? appConfig.defaultLocalBaseUrl;
}

export function localModelApiKey(environment: AppEnvironment): string | undefined {
	return environment.JON_LOCAL_API_KEY;
}

export function braintrustProjectName(environment: AppEnvironment): string {
	return environment.BRAINTRUST_PROJECT_NAME ?? appConfig.braintrustProjectName;
}

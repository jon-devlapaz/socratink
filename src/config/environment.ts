import { appConfig } from './app.config.ts';

export type AppEnvironment = {
	readonly JON_LOCAL_API_KEY?: string;
	readonly JON_LOCAL_BASE_URL?: string;
	readonly JON_LOCAL_MODEL_ID?: string;
	readonly AI_GATEWAY_API_KEY?: string;
	readonly VERCEL?: string;
	readonly VERCEL_OIDC_TOKEN?: string;
	readonly BRAINTRUST_API_KEY?: string;
	readonly BRAINTRUST_PROJECT_NAME?: string;
};

function onVercel(environment: AppEnvironment): boolean {
	return environment.VERCEL === '1';
}

function isUnreachableFromVercel(baseUrl: string): boolean {
	try {
		const { hostname } = new URL(baseUrl);
		return (
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname.endsWith('.localhost') ||
			hostname.endsWith('.ts.net') ||
			/^100\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
		);
	} catch {
		return true;
	}
}

export function localModelBaseUrl(environment: AppEnvironment): string {
	const configured = environment.JON_LOCAL_BASE_URL;
	if (onVercel(environment)) {
		if (configured && !isUnreachableFromVercel(configured)) return configured;
		return appConfig.vercelAiGatewayBaseUrl;
	}
	return configured ?? appConfig.defaultLocalBaseUrl;
}

export function localModelId(environment: AppEnvironment): string {
	if (environment.JON_LOCAL_MODEL_ID) return environment.JON_LOCAL_MODEL_ID;
	if (localModelBaseUrl(environment) === appConfig.vercelAiGatewayBaseUrl) {
		return appConfig.vercelAiGatewayModelId;
	}
	return appConfig.defaultLocalModelId;
}

export function localModelApiKey(environment: AppEnvironment): string | undefined {
	if (localModelBaseUrl(environment) === appConfig.vercelAiGatewayBaseUrl) {
		return environment.AI_GATEWAY_API_KEY ?? environment.VERCEL_OIDC_TOKEN;
	}
	return environment.JON_LOCAL_API_KEY;
}

export function braintrustProjectName(environment: AppEnvironment): string {
	return environment.BRAINTRUST_PROJECT_NAME ?? appConfig.braintrustProjectName;
}

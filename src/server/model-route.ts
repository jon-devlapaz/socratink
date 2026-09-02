import { AsyncLocalStorage } from 'node:async_hooks';
import type { ProviderStreams, StreamOptions } from '@earendil-works/pi-ai';
import { instrument } from '@flue/runtime';
import { routingFromHeaders } from '../config/model-route.ts';

type RouteCapture = {
	routedModel?: string;
	fallbackAttempts: number;
};

const capture = new AsyncLocalStorage<RouteCapture>();
const instrumentationKey = Symbol.for('socratink.model-route');

export function runWithRouteCapture<T>(fn: () => T): T {
	return capture.run({ fallbackAttempts: 0 }, fn);
}

export function capturedRoute(): RouteCapture | undefined {
	const store = capture.getStore();
	if (!store) return undefined;
	return { ...store };
}

export function rememberRoutingHeaders(headers: Headers | Record<string, string>): void {
	const store = capture.getStore();
	if (!store) return;
	const routing = routingFromHeaders(headers);
	if (!routing.present) return;
	if (routing.routedModel) store.routedModel = routing.routedModel;
	if (routing.fallbackAttempts > 0) store.fallbackAttempts = routing.fallbackAttempts;
}

export function rememberResponseModel(model: string): void {
	const store = capture.getStore();
	if (!store || store.routedModel) return;
	const routedModel = model.trim();
	if (routedModel) store.routedModel = routedModel;
}

export function wrapStreamsForRouteCapture(api: ProviderStreams): ProviderStreams {
	return {
		stream: (model, context, options) => api.stream(model, context, withRouteOnResponse(options)),
		streamSimple: (model, context, options) =>
			api.streamSimple(model, context, withRouteOnResponse(options)),
	};
}

export function installModelRouteCapture(): void {
	try {
		instrument({
			key: instrumentationKey,
			observe(event) {
				if (event.type !== 'turn' || event.purpose !== 'agent') return;
				const model = event.response.responseModel;
				if (typeof model === 'string') rememberResponseModel(model);
			},
			interceptor: async (operation, _ctx, next) => {
				if (operation.type !== 'agent') return next();
				return runWithRouteCapture(next);
			},
			dispose() {},
		});
	} catch (error) {
		if (!isInstrumentationAlreadyInstalled(error)) throw error;
	}
}

function withRouteOnResponse<T extends StreamOptions | undefined>(options: T): T {
	const previous = options?.onResponse;
	return {
		...options,
		onResponse: async (response, model) => {
			rememberRoutingHeaders(response.headers);
			await previous?.(response, model);
		},
	} as T;
}

function isInstrumentationAlreadyInstalled(error: unknown): boolean {
	return error instanceof Error && error.name === 'InstrumentationAlreadyInstalledError';
}

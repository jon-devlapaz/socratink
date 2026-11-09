import { AsyncLocalStorage } from 'node:async_hooks';
import type { ProviderStreams, StreamOptions } from '@earendil-works/pi-ai';
import { instrument, InstrumentationAlreadyInstalledError } from '@flue/runtime';
import { parseFreeLlmAutoModelId, type FreeLlmAutoModelId } from '../config/chat-auto.ts';

const requested = new AsyncLocalStorage<FreeLlmAutoModelId>();
const pending = new Map<string, FreeLlmAutoModelId>();
const instrumentationKey = Symbol.for('socratink.chat-auto');

export function rememberConversationAuto(
	instanceId: string | undefined,
	value: string | undefined | null,
): void {
	if (!instanceId) return;
	const model = parseFreeLlmAutoModelId(value);
	if (!model) {
		pending.delete(instanceId);
		return;
	}
	pending.set(instanceId, model);
}

export function runWithConversationAuto<T>(instanceId: string | undefined, fn: () => T): T {
	if (!instanceId) return fn();
	const model = pending.get(instanceId);
	if (!model) return fn();
	pending.delete(instanceId);
	return requested.run(model, fn);
}

export function applyRequestedAutoModel(payload: unknown): Record<string, unknown> | undefined {
	const modelId = requested.getStore();
	if (!modelId || !isRecord(payload) || payload.model === modelId) return undefined;
	return { ...payload, model: modelId };
}

export function wrapStreamsForChatAuto(api: ProviderStreams): ProviderStreams {
	return {
		stream: (model, context, options) => api.stream(model, context, withAutoModelPayload(options)),
		streamSimple: (model, context, options) =>
			api.streamSimple(model, context, withAutoModelPayload(options)),
	};
}

export function installChatAutoCapture(): void {
	try {
		instrument({
			key: instrumentationKey,
			observe() {},
			interceptor: async (operation, ctx, next) => {
				if (operation.type !== 'agent') return next();
				return runWithConversationAuto(ctx.instanceId, next);
			},
			dispose() {},
		});
	} catch (error) {
		if (!(error instanceof InstrumentationAlreadyInstalledError)) throw error;
	}
}

function withAutoModelPayload<T extends StreamOptions | undefined>(options: T): T {
	const previous = options?.onPayload;
	return {
		...options,
		onPayload: async (payload, model) => {
			const rewritten = applyRequestedAutoModel(payload);
			if (!previous) return rewritten;
			const fromPrevious = await previous(rewritten ?? payload, model);
			return fromPrevious === undefined ? rewritten : fromPrevious;
		},
	} as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

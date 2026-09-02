import { AsyncLocalStorage } from 'node:async_hooks';
import type { ProviderStreams, StreamOptions } from '@earendil-works/pi-ai';
import { instrument } from '@flue/runtime';
import { appConfig } from '../config/app.config.ts';
import { parseFreeLlmAutoModelId, type FreeLlmAutoModelId } from '../config/chat-auto.ts';

const requested = new AsyncLocalStorage<FreeLlmAutoModelId>();
const pending = new Map<string, FreeLlmAutoModelId>();
const instrumentationKey = Symbol.for('socratink.chat-auto');

export function chatConversationIdFromPath(path: string): string | undefined {
	const prefix = `${appConfig.chatAgentPath}/`;
	if (!path.startsWith(prefix)) return undefined;
	const id = path.slice(prefix.length).split('/')[0];
	if (!id) return undefined;
	try {
		return decodeURIComponent(id);
	} catch {
		return id;
	}
}

export function rememberConversationAuto(
	conversationId: string | undefined,
	value: string | undefined | null,
): void {
	if (!conversationId) return;
	const model = parseFreeLlmAutoModelId(value);
	if (!model) {
		pending.delete(conversationId);
		return;
	}
	pending.set(conversationId, model);
}

export function runWithConversationAuto<T>(conversationId: string | undefined, fn: () => T): T {
	if (!conversationId) return fn();
	const model = pending.get(conversationId);
	if (!model) return fn();
	pending.delete(conversationId);
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
				return runWithConversationAuto(ctx.conversationId, next);
			},
			dispose() {},
		});
	} catch (error) {
		if (!isInstrumentationAlreadyInstalled(error)) throw error;
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

function isInstrumentationAlreadyInstalled(error: unknown): boolean {
	return error instanceof Error && error.name === 'InstrumentationAlreadyInstalledError';
}

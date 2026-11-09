import {
	createAssistantMessageEventStream, createModels, createProvider,
	type Api, type AssistantMessage, type AssistantMessageEventStream, type Message,
	type Model, type ProviderStreams, type SimpleStreamOptions, type StreamOptions,
} from 'pi-ai-durable';
import { openAICompletionsApi } from 'pi-ai-durable/api/openai-completions.lazy';
import { openaiProvider } from 'pi-ai-durable/providers/openai';
import { openrouterProvider } from 'pi-ai-durable/providers/openrouter';
import { appConfig } from '../../config/app.config.ts';
import { capOpenrouterChatMaxTokens } from '../../config/chat-model.ts';
import { modelRouteFromMetadata, routingFromHeaders, type ModelRouteRecord } from '../../config/model-route.ts';
import type { EngineOptions, ModelConfig, ModelSelection } from './contract.ts';

export const modelRef = { provider: 'socratink', modelId: 'selected' };
type RoutedMessage = AssistantMessage & { socratinkRoute?: ModelRouteRecord };

/** Each conversation owns its resolver; keys never enter model history. */
export function conversationModels(options: EngineOptions, conversationId: string,
	selection: () => Promise<ModelSelection | undefined>) {
	const models = createModels();
	const openai = openaiProvider();
	const openrouter = openrouterProvider();
	const compatible = openAICompletionsApi();
	let current: { config: ModelConfig; model: Model<Api>; streams: ProviderStreams } | undefined;
	const catalogModel = openai.getModels().find((model) => model.id === 'gpt-5-nano');
	if (!catalogModel) throw new Error('The installed Pi catalog lacks the default learner model.');
	function select(config: ModelConfig): NonNullable<typeof current> {
		if (config.provider === 'openai' || config.provider === 'openrouter') {
			const provider = config.provider === 'openai' ? openai : openrouter;
			const catalog: readonly Model<Api>[] = config.provider === 'openrouter'
				? capOpenrouterChatMaxTokens(openrouter.getModels()) : openai.getModels();
			const model = catalog.find((entry) => entry.id === config.modelId);
			if (!model) throw new Error('The installed Pi catalog lacks the selected learner model.');
			return { config, model: { ...model, ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}) }, streams: provider };
		}
		if (config.provider !== 'jon-local' || !config.baseUrl || !config.contextWindow || !config.maxTokens) {
			throw new Error('The operator model requires its configured endpoint and limits.');
		}
		const model: Model<'openai-completions'> = {
			id: config.autoModel ?? config.modelId, name: config.modelId, api: 'openai-completions',
			provider: config.provider, baseUrl: config.baseUrl, reasoning: config.reasoning ?? false,
			compat: { supportsReasoningEffort: config.baseUrl === appConfig.vercelAiGatewayBaseUrl },
			input: ['text'], contextWindow: config.contextWindow, maxTokens: config.maxTokens,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		};
		return { config, model, streams: compatible };
	}
	function requestOptions<T extends StreamOptions | SimpleStreamOptions>(request: T | undefined) {
		if (!current) throw new Error('Model credentials have not been resolved.');
		const selected = current;
		let route: ModelRouteRecord | undefined;
		let fallbackAttempts = 0;
		const options = { ...request, apiKey: selected.config.apiKey,
			maxTokens: Math.min(request?.maxTokens ?? selected.model.maxTokens, selected.model.maxTokens),
			onResponse: async (response: Parameters<NonNullable<StreamOptions['onResponse']>>[0], model: Model<Api>) => {
				const captured = routingFromHeaders(response.headers);
				fallbackAttempts = captured.fallbackAttempts || fallbackAttempts;
				if (captured.routedModel) route = { routedModel: captured.routedModel, ...(fallbackAttempts ? { fallbackAttempts } : {}) };
				await request?.onResponse?.(response, model);
			},
		};
		return { selected, options, route: (message: AssistantMessage) => {
			const routedModel = route?.routedModel ?? message.responseModel?.trim();
			return routedModel ? { routedModel, ...(fallbackAttempts ? { fallbackAttempts } : {}) } : undefined;
		} };
	}
	models.setProvider(createProvider({
		id: modelRef.provider,
		models: [{ ...catalogModel, id: modelRef.modelId, name: 'Selected Socratink model', provider: modelRef.provider }],
		auth: { apiKey: { name: 'Socratink learner or operator credential', resolve: async () => {
			current = select(await options.resolveModel(conversationId, await selection()));
			return { auth: { apiKey: current.config.apiKey } };
		} } },
		api: {
			stream: (_model, context, request) => {
				const resolved = requestOptions(request);
				return withRoute(resolved.selected.streams.stream(resolved.selected.model, context, resolved.options), resolved.route, resolved.selected.config.apiKey);
			},
			streamSimple: (_model, context, request) => {
				const resolved = requestOptions(request);
				return withRoute(resolved.selected.streams.streamSimple(resolved.selected.model, context, resolved.options), resolved.route, resolved.selected.config.apiKey);
			},
		},
	}));
	return models;
}

/** A product-owned field travels with Pi's normal live and committed message. */
export function messageRoute(message: Message): ModelRouteRecord | undefined {
	return message.role === 'assistant' ? modelRouteFromMetadata((message as RoutedMessage).socratinkRoute) : undefined;
}

function withRoute(source: AssistantMessageEventStream, route: (message: AssistantMessage) => ModelRouteRecord | undefined, apiKey: string | undefined) {
	const output = createAssistantMessageEventStream();
	const redact = credentialRedactor(apiKey);
	const annotate = (message: AssistantMessage): RoutedMessage => {
		const captured = route(message);
		// Provider errors and headers are untrusted. Remove this request's key
		// before Pi publishes or commits them; preserve status and retry wording.
		return { ...message,
			...(message.errorMessage ? { errorMessage: redact(message.errorMessage) } : {}),
			...(message.responseModel ? { responseModel: redact(message.responseModel) } : {}),
			...(message.responseId ? { responseId: redact(message.responseId) } : {}),
			...(message.rawStopReason ? { rawStopReason: redact(message.rawStopReason) } : {}),
			...(message.diagnostics ? { diagnostics: JSON.parse(JSON.stringify(message.diagnostics,
				(_name, value: unknown) => typeof value === 'string' ? redact(value) : value)) as AssistantMessage['diagnostics'] } : {}),
			...(captured ? { socratinkRoute: { ...captured, routedModel: redact(captured.routedModel) } } : {}),
		};
	};
	void (async () => {
		for await (const event of source) {
			if ('partial' in event) output.push({ ...event, partial: annotate(event.partial) });
			else if (event.type === 'done') output.push({ ...event, message: annotate(event.message) });
			else if (event.type === 'error') output.push({ ...event, error: annotate(event.error) });
		}
		output.end(annotate(await source.result()));
	})();
	return output;
}

function credentialRedactor(apiKey: string | undefined): (text: string) => string {
	if (!apiKey) return (text) => text;
	const encoded = encodeURIComponent(apiKey);
	const variants = [...new Set([apiKey, encoded, encoded.replace(/%[\dA-F]{2}/g, (part) => part.toLowerCase())])];
	return (text) => variants.reduce((result, secret) => result.split(secret).join('[redacted]'), text);
}

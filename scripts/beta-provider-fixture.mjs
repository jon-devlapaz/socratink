import { createAssistantMessageEventStream, createProvider } from '@earendil-works/pi-ai';

export function betaProviderFixture(modelId = 'budget-fixture') {
	const model = {
		id: modelId, name: 'Budget fixture', api: 'openai-completions', provider: 'jon-local',
		baseUrl: 'http://fixture.invalid/v1', reasoning: false, input: ['text'],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 8192, maxTokens: 128,
	};
	let calls = 0;
	const stream = () => {
		calls += 1;
		const output = createAssistantMessageEventStream();
		const message = {
			role: 'assistant', content: [{ type: 'text', text: 'Synthetic beta reply.' }],
			api: model.api, provider: model.provider, model: model.id, timestamp: Date.now(),
			stopReason: 'stop', usage: {
				input: 1, output: 1, cacheRead: 0, cacheWrite: 0, totalTokens: 2,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
			},
		};
		output.push({ type: 'start', partial: message });
		output.push({ type: 'text_start', contentIndex: 0, partial: message });
		output.push({ type: 'text_delta', contentIndex: 0, delta: message.content[0].text, partial: message });
		output.push({ type: 'text_end', contentIndex: 0, content: message.content[0].text, partial: message });
		output.push({ type: 'done', reason: 'stop', message });
		output.end(message);
		return output;
	};
	const provider = createProvider({
		id: model.provider,
		models: [model],
		auth: { apiKey: { name: 'Synthetic credential', resolve: async () => ({ auth: {} }) } },
		api: { stream, streamSimple: stream },
	});
	return { provider, model, calls: () => calls };
}

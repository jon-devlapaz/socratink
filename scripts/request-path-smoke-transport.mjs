export function writeModelResponse(response, { path, model, text, id }) {
	response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
	const emit = (event) => response.write(`data: ${JSON.stringify(event)}\n\n`);
	if (path === '/v1/responses') {
		const item = { id: `msg_${id}`, type: 'message', role: 'assistant', status: 'completed',
			content: [{ type: 'output_text', text, annotations: [] }] };
		emit({ type: 'response.created', response: { id } });
		emit({ type: 'response.output_item.added', output_index: 0, item: { ...item, content: [] } });
		emit({ type: 'response.output_text.delta', output_index: 0, content_index: 0, delta: text });
		emit({ type: 'response.output_item.done', output_index: 0, item });
		emit({ type: 'response.completed', response: { id, status: 'completed', model, output: [item],
			usage: { input_tokens: 8, output_tokens: 8, total_tokens: 16 } } });
		response.end();
		return;
	}
	if (path !== '/v1/chat/completions') throw new Error(`Unexpected fake model path: ${path}`);
	const chunk = { id, object: 'chat.completion.chunk', created: 0, model };
	for (const delta of [{ role: 'assistant', content: '' }, { content: text }]) {
		emit({ ...chunk, choices: [{ index: 0, delta, finish_reason: null }] });
	}
	emit({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
	response.end('data: [DONE]\n\n');
}

export function writeModelResponse(response, { path, model, text, id }) {
	response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
	const emit = (event) => response.write(`data: ${JSON.stringify(event)}\n\n`);
	if (path !== '/v1/chat/completions') throw new Error(`Unexpected fake model path: ${path}`);
	const chunk = { id, object: 'chat.completion.chunk', created: 0, model };
	for (const delta of [{ role: 'assistant', content: '' }, { content: text }]) {
		emit({ ...chunk, choices: [{ index: 0, delta, finish_reason: null }] });
	}
	emit({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
	response.end('data: [DONE]\n\n');
}

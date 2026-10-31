// OpenAI-compatible streaming replies for keyless runs: the smoke test's scripted
// provider and the practice tutor behind `pnpm dev:phone` share this wire format.

export function writeCompletion(response, id, deltas) {
	response.writeHead(200, {
		'content-type': 'text/event-stream',
		'cache-control': 'no-cache',
		connection: 'keep-alive',
	});
	const chunks = [
		...deltas.map((delta) => ({
			id,
			object: 'chat.completion.chunk',
			created: 0,
			model: 'auto',
			choices: [delta],
		})),
		{
			id,
			object: 'chat.completion.chunk',
			created: 0,
			model: 'auto',
			choices: [],
			usage: { prompt_tokens: 8, completion_tokens: 8, total_tokens: 16 },
		},
	];
	for (const chunk of chunks) response.write(`data: ${JSON.stringify(chunk)}\n\n`);
	response.end('data: [DONE]\n\n');
}

export function scriptedCompletionDeltas({ text, tools, finishReason }) {
	return [
		{ index: 0, delta: { role: 'assistant' }, finish_reason: null },
		...(text ? [{ index: 0, delta: { content: text }, finish_reason: null }] : []),
		...(tools ?? []).map((tool, index) => ({
			index: 0,
			delta: {
				tool_calls: [
					{
						index,
						id: tool.id,
						type: 'function',
						function: { name: tool.name, arguments: JSON.stringify(tool.arguments) },
					},
				],
			},
			finish_reason: null,
		})),
		{ index: 0, delta: {}, finish_reason: finishReason },
	];
}

#!/usr/bin/env node
// Scripted tutor model for verification runs. It stands in only for the model
// provider (the OpenAI-compatible endpoint behind JON_LOCAL_BASE_URL); the app,
// durable engine, SSE stream and browser stay real.
//
//   node fake-model.mjs <port-file>
//
// Replies stream word by word. Control it over HTTP on the same port:
//   POST /control/hold     the next replies pause after their first words
//   POST /control/release  finish every held reply
//   GET  /control/calls    {"calls": n, "held": n}
import { writeFileSync } from 'node:fs';
import { createServer } from 'node:http';

const wordMs = Number(process.env.FAKE_MODEL_WORD_MS ?? 35);
const replies = [
	'Good place to start. Before we go further, tell me what you already believe about it.\n\nWhat do you expect would happen first, and why?',
	'That is a reasonable guess. Notice that your answer depends on one assumption you have not said out loud.\n\nWhich assumption is it?',
	'You are close. Try to say it in one sentence, using your own words rather than a definition.\n\nWhat would that sentence be?',
];
const long = Array.from({ length: 12 }, (_, i) =>
	`Paragraph ${i + 1}. This is a deliberately long scripted reply so the transcript has to scroll past the composer.`).join('\n\n')
	+ '\n\nWhich paragraph surprised you most?';

let calls = 0;
let holding = false;
const held = new Set();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function lastUserText(body) {
	const messages = body.messages ?? [];
	for (let i = messages.length - 1; i >= 0; i -= 1) {
		if (messages[i].role !== 'user') continue;
		const content = messages[i].content;
		return typeof content === 'string' ? content : (content ?? []).map((part) => part.text ?? '').join(' ');
	}
	return '';
}

const server = createServer(async (request, response) => {
	let raw = '';
	for await (const chunk of request) raw += chunk;
	if (request.url === '/control/hold') { holding = true; response.end('{"holding":true}'); return; }
	if (request.url === '/control/release') {
		holding = false;
		for (const release of held) release();
		held.clear();
		response.end('{"holding":false}');
		return;
	}
	if (request.url === '/control/calls') { response.end(JSON.stringify({ calls, held: held.size })); return; }
	if (request.url !== '/v1/chat/completions') { response.writeHead(404); response.end(); return; }

	const body = JSON.parse(raw);
	calls += 1;
	const text = /\bLONG\b/.test(lastUserText(body)) ? long : replies[(calls - 1) % replies.length];
	const id = `scripted_${calls}`;
	response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache',
		'x-routed-via': encodeURIComponent('scripted/verify-model') });
	const chunk = (delta, finish = null) => response.write(`data: ${JSON.stringify({ id, object: 'chat.completion.chunk',
		created: 0, model: body.model, choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`);
	chunk({ role: 'assistant', content: '' });
	const words = text.split(/(?<= )/);
	for (const [index, word] of words.entries()) {
		if (response.destroyed) return;
		chunk({ content: word });
		if (index === 3 && holding) await new Promise((resolve) => held.add(resolve));
		await sleep(wordMs);
	}
	chunk({}, 'stop');
	response.write(`data: ${JSON.stringify({ id, object: 'chat.completion.chunk', created: 0, model: body.model, choices: [],
		usage: { prompt_tokens: 8, completion_tokens: words.length, total_tokens: 8 + words.length } })}\n\n`);
	response.end('data: [DONE]\n\n');
});

server.listen(0, '127.0.0.1', () => writeFileSync(process.argv[2], String(server.address().port)));

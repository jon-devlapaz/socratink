// `pnpm dev:phone`: the dev server on every network interface, so a phone on the same
// Wi-Fi or tailnet can open it. Without JON_LOCAL_BASE_URL and JON_LOCAL_API_KEY it
// answers with a keyless practice tutor, so trying the app never needs a key or spends
// money. Real models stay opt-in through those variables or the Providers panel.
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { scriptedCompletionDeltas, writeCompletion } from './fake-provider.mjs';

const practiceKey = 'practice-tutor';
const practiceQuestion = {
	prompt: 'Which would you check first?',
	choices: [
		'What I expected to happen',
		'What actually happened',
		'The smallest example that shows the gap',
		'Something else',
	],
	reasoning: true,
};

// One practice turn: a tool result gets a short acknowledgement, every second learner
// message gets a questionnaire, and the rest get one Socratic question in plain text.
export function practiceTurn(messages) {
	if (messages.at(-1)?.role === 'tool') {
		return { text: 'Practice tutor: noted. What made you choose that?', finishReason: 'stop' };
	}
	const learnerTurns = messages.filter((message) => message.role === 'user').length;
	if (learnerTurns % 2 === 0) {
		return {
			tools: [{ id: `call_${randomUUID()}`, name: 'present_question', arguments: practiceQuestion }],
			finishReason: 'tool_calls',
		};
	}
	return {
		text: 'Practice tutor (no model connected): what have you tried so far, and what happened when you tried it?',
		finishReason: 'stop',
	};
}

function startPracticeTutor() {
	const server = createServer(async (request, response) => {
		if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
			response.writeHead(404).end();
			return;
		}
		let body = '';
		for await (const chunk of request) body += chunk;
		const { messages = [] } = JSON.parse(body);
		writeCompletion(response, `chatcmpl-practice-${randomUUID()}`, scriptedCompletionDeltas(practiceTurn(messages)));
	});
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const environment = { ...process.env };
	const realModel = environment.JON_LOCAL_BASE_URL?.trim() && environment.JON_LOCAL_API_KEY?.trim();
	let tutor;
	if (!realModel) {
		tutor = await startPracticeTutor();
		environment.JON_LOCAL_BASE_URL = `http://127.0.0.1:${tutor.address().port}/v1`;
		environment.JON_LOCAL_API_KEY = practiceKey;
		console.log('Practice tutor on: no model key set, replies are scripted and free.');
	}
	const run = (args) => spawn('pnpm', args, { env: environment, stdio: 'inherit' });
	const build = run(['exec', 'vite', 'build', '--config', 'vite.config.ui.ts']);
	build.on('exit', (code) => {
		if (code !== 0) process.exit(code ?? 1);
		console.log('Open the Network address below on your phone (same Wi-Fi or tailnet).');
		const dev = run(['exec', 'vite', 'dev', '--host']);
		dev.on('exit', (devCode) => {
			tutor?.close();
			process.exit(devCode ?? 0);
		});
	});
}

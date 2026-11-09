import { appConfig } from '../config/app.config.ts';
import {
	isLearnerChatStatus,
	type LearnerChatStatus,
} from '../config/chat-model.ts';

export async function loadLearnerChatStatus(): Promise<LearnerChatStatus> {
	const response = await fetch(appConfig.chatRoutePath, { credentials: 'same-origin' });
	return readLearnerChatStatus(response);
}

export async function readLearnerChatStatus(response: Response): Promise<LearnerChatStatus> {
	if (!response.ok) throw new Error('Unable to load the chat provider.');
	const body: unknown = await response.json();
	if (!isLearnerChatStatus(body)) throw new Error('Unable to load the chat provider.');
	return body;
}

export function providersChatStatusCopy(status: LearnerChatStatus): string {
	switch (status.kind) {
		case 'operator':
			return 'Chat uses the local Socratink model.';
		case 'openai':
			return 'Chat uses your OpenAI key.';
		case 'openrouter':
			return 'Chat uses your OpenRouter key.';
		default: {
			const exhaustive: never = status.kind;
			throw new Error(`Unexpected chat route: ${JSON.stringify(exhaustive)}`);
		}
	}
}

export function openaiChatStatusCopy(status: LearnerChatStatus): string {
	if (!status.openai) return '';
	switch (status.kind) {
		case 'openai':
			return 'Connected. Chat uses your OpenAI key.';
		case 'openrouter':
		case 'operator':
			return 'OpenAI key stored.';
		default: {
			const exhaustive: never = status.kind;
			throw new Error(`Unexpected chat route: ${JSON.stringify(exhaustive)}`);
		}
	}
}


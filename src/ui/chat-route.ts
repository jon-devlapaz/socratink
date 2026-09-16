import { appConfig } from '../config/app.config.ts';
import {
	isLearnerChatStatus,
	operatorChatStatus,
	type LearnerChatStatus,
} from '../config/chat-model.ts';

export async function loadLearnerChatStatus(): Promise<LearnerChatStatus> {
	const response = await fetch(appConfig.chatRoutePath, { credentials: 'same-origin' });
	if (!response.ok) return operatorChatStatus;
	const body: unknown = await response.json();
	return isLearnerChatStatus(body) ? body : operatorChatStatus;
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

export function openrouterChatStatusCopy(status: LearnerChatStatus): string {
	if (!status.openrouter) return '';
	switch (status.kind) {
		case 'openrouter':
			return 'Connected. Chat uses your OpenRouter key.';
		case 'openai':
		case 'operator':
			return 'OpenRouter key stored.';
		default: {
			const exhaustive: never = status.kind;
			throw new Error(`Unexpected chat route: ${JSON.stringify(exhaustive)}`);
		}
	}
}

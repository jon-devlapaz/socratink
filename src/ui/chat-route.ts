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

export function openaiChatStatusCopy(status: LearnerChatStatus): string {
	switch (status.kind) {
		case 'openai':
			return 'Connected. Chat uses your OpenAI key.';
		case 'openrouter':
			return status.openai
				? 'OpenAI key stored. Chat is using OpenRouter.'
				: 'Not connected. Chat is using OpenRouter.';
		case 'operator':
			return 'Not connected. Chat uses the local Socratink model.';
		default: {
			const exhaustive: never = status.kind;
			throw new Error(`Unexpected chat route: ${JSON.stringify(exhaustive)}`);
		}
	}
}

export function openrouterChatStatusCopy(status: LearnerChatStatus): string {
	switch (status.kind) {
		case 'openrouter':
			return 'Connected. Chat uses your OpenRouter key.';
		case 'openai':
			return status.openrouter
				? 'OpenRouter key stored. Chat is using OpenAI.'
				: 'Not connected. Chat is using OpenAI.';
		case 'operator':
			return 'Not connected. Chat uses the local Socratink model.';
		default: {
			const exhaustive: never = status.kind;
			throw new Error(`Unexpected chat route: ${JSON.stringify(exhaustive)}`);
		}
	}
}

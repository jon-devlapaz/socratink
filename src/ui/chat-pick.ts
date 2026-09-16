import { appConfig } from '../config/app.config.ts';
import {
	applyLearnerChatPick,
	formatLearnerChatSpecifier,
	parseLearnerChatSpecifier,
	type LearnerChatStatus,
} from '../config/chat-model.ts';

export function storedLearnerChatSpecifier(): string | undefined {
	const pick = parseLearnerChatSpecifier(localStorage.getItem(appConfig.chatModelStorageKey));
	return pick ? formatLearnerChatSpecifier(pick) : undefined;
}

export function writeLearnerChatSpecifier(specifier: string): void {
	const pick = parseLearnerChatSpecifier(specifier);
	if (!pick) return;
	localStorage.setItem(appConfig.chatModelStorageKey, formatLearnerChatSpecifier(pick));
}

export function learnerChatStatusFromStoredPick(status: LearnerChatStatus): LearnerChatStatus {
	const stored = localStorage.getItem(appConfig.chatModelStorageKey);
	const pick = parseLearnerChatSpecifier(stored);
	if (!pick) {
		if (stored) localStorage.removeItem(appConfig.chatModelStorageKey);
		return status;
	}
	const connected = pick.kind === 'openai' ? status.openai : status.openrouter;
	if (!connected) {
		localStorage.removeItem(appConfig.chatModelStorageKey);
		return status;
	}
	return applyLearnerChatPick(status, stored);
}

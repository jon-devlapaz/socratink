import { appConfig } from '../config/app.config.ts';
import {
	formatLearnerChatSpecifier,
	parseLearnerChatSpecifier,
} from '../config/chat-model.ts';

export function storedLearnerChatSpecifier(): string | undefined {
	const pick = parseLearnerChatSpecifier(localStorage.getItem(appConfig.chatModelStorageKey));
	return pick ? formatLearnerChatSpecifier(pick) : undefined;
}

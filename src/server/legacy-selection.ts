import type { Context } from 'hono';
import { chatAutoModelHeader, chatAllowsAutoSelection } from '../config/chat-auto.ts';
import { chatModelHeader, type LearnerChatRoute } from '../config/chat-model.ts';
import { chatModel } from '../config/operator-model.ts';
import { chatConversationIdFromPath } from '../config/session.ts';
import { rememberConversationAuto } from './chat-auto.ts';
import { getCredentialStore } from './credential-runtime.ts';
import { learnerChatStatusForUser, rememberConversationChatPick } from './learner-key.ts';
import { sessionFromContext } from './session.ts';

/** Legacy header state is consumed only by a Flue conversation. */
export async function rememberLegacySelection(context: Context): Promise<void> {
	const credentialStore = getCredentialStore();
	const userId = sessionFromContext(context)?.userId;
	const route: LearnerChatRoute = userId
		? await learnerChatStatusForUser({ store: credentialStore, userId })
		: { kind: 'operator' };
	const conversationId = chatConversationIdFromPath(context.req.path);
	if (route.kind === 'operator' && chatAllowsAutoSelection(chatModel.modelId)) {
		rememberConversationAuto(conversationId, context.req.header(chatAutoModelHeader));
	}
	rememberConversationChatPick(conversationId, context.req.header(chatModelHeader));

}

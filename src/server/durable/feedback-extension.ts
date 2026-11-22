import { createHash } from 'node:crypto';
import type { Context } from '@earendil-works/chord/context';
import { defineExtension, defineTool, hook, ToolTask, type HookApi } from '@earendil-works/pi-durable';
import { validFeedbackMessage, feedback } from '../../config/feedback.ts';
import { feedbackEnvironment, readFeedbackToken } from '../../config/feedback-server.ts';
import { userIdFromConversationId } from '../../config/session.ts';
import { learningToolDefinitions } from '../../learning/tools.ts';
import { getAuthDb } from '../auth-runtime.ts';
import { sendAgentFeedback } from '../modem-feedback.ts';
import { inputKind } from './contract.ts';
import { messageText } from './extension.ts';

const confirm = 'Send feedback';
const direct = `${confirm}: `;
const draftStart = 'Feedback draft:\n';
const draftEnd = `\nReply "${confirm}" to send this report.`;
const deliveryNotice = 'This goes to the Socratink team through Modem.';
const accountNotice = 'Your account email goes with it.';
const toolNames = learningToolDefinitions.map(({ name }) => name);

export async function feedbackExtension(conversationId: string) {
	const token = readFeedbackToken();
	const ownerId = userIdFromConversationId(conversationId);
	if (!token || !ownerId) return undefined;
	const authDb = getAuthDb();
	const aliasOwner = await authDb.findAliasOwner(ownerId).catch(() => null);
	if (aliasOwner === null) return undefined;
	const userId = aliasOwner ?? ownerId;
	const account = await authDb.findUserById(userId).catch(() => null);
	if (account === null) return undefined;
	const user = account ? { id: account.id, email: account.email } : undefined;
	const context = {
		session_id: createHash('sha256').update(conversationId).digest('hex'),
		client: 'Socratink tutor',
		environment: feedbackEnvironment(),
	};
	return defineExtension({
		name: 'socratink-feedback',
		sections: [{ key: 'feedback', render: () => `Feedback about Socratink takes precedence over the tutoring flow. Offer to report agent_friction when a Socratink tool fails, is unclear or unusable, or lacks a capability. Offer user_feedback when the learner expresses feedback or frustration with Socratink or asks for something the app cannot do. Do not turn a rating into written feedback. Offer written feedback or let the learner defer.
Use the learner's words for user_feedback. For agent_friction, include only what you tried, what happened, and what you expected. Never include credentials, a whole conversation, or unrelated personal information. ${user ? 'Do not ask for contact details.' : 'Include contact details only if the learner gives them for this report and can see them in the draft.'}
End the offer with exactly this plain text format and no other text after it:
${deliveryNotice}${user ? ' ' + accountNotice : ''}
${draftStart}<exact message>${draftEnd}
Call ${feedback.toolName} only in reply to "${confirm}" after that offer, using the exact proposed message. ${user ? '' : 'A direct request with the exact format "' + direct + '<message>" also authorizes that message.'} Treat other requests or replies as a chance to show the draft and ask for confirmation. Call the tool once. Never repeat a call, including after an error or interruption. Report its outcome accurately.` }],
		tools: [defineTool<object>({
			name: feedback.toolName,
			description: 'Send the exact feedback the learner authorized to the Socratink team through Modem.',
			parameters: {
				type: 'object', required: ['message', 'category'], additionalProperties: false,
				properties: {
					message: { type: 'string', minLength: 1, maxLength: feedback.maxMessage },
					category: { type: 'string', enum: ['user_feedback', 'agent_friction'] },
					tool_name: { type: 'string', enum: toolNames },
					...(!user ? { name: { type: 'string', maxLength: 256 }, email: { type: 'string', maxLength: 320 } } : {}),
				},
			},
			replay: 'unsafe',
			executionMode: 'sequential',
			callers: ['model'],
			async execute(args) {
				const { message, category, tool_name, name, email } = args as Record<string, string>;
				const outcome = await sendAgentFeedback(token, user, context, {
					message: message!.trim(), category: category!,
					...(tool_name ? { tags: { tool_name } } : {}),
					...(!user && name ? { name } : {}), ...(!user && email ? { email } : {}),
				});
				const result = {
					accepted: 'Modem accepted the feedback.',
					rejected: 'Modem declined the feedback.',
					unavailable: 'The connection to Modem could not be opened.',
					unconfirmed: 'Modem may have received the feedback. Do not send it again.',
				}[outcome];
				return { isError: outcome !== 'accepted', output: [{ type: 'text', text: result }] };
			},
		})],
		hooks: [hook(ToolTask, {
			async beforeTool(call, api, ctx) {
				if (call.name !== feedback.toolName) return;
				const { message, name, email } = call.arguments;
				if (typeof message !== 'string' || !validFeedbackMessage(message.trim())) return { block: 'A written report is required.' };
				if (call.parent || !await approved(api, ctx, call.id, message.trim(), Boolean(user))) {
					return { block: 'Show a draft and ask the learner to confirm. Send only one report per confirmation.' };
				}
				if ([name, email].some((value) => typeof value === 'string' && !message.includes(value))) {
					return { block: 'Contact details must be visible in the approved draft.' };
				}
			},
		})],
	});
}

async function approved(api: HookApi, context: Context, callId: string, message: string, registered: boolean) {
	let cursor;
	let calls: string[] = [];
	let confirming = false;
	do {
		const page = await api.entries({ order: 'descending' }, 100, cursor, context);
		for (const entry of page.items) {
			if (entry.kind === inputKind) {
				if (confirming || calls.length !== 1 || calls[0] !== callId) return false;
				const input = entry.model?.map(messageText).join('').trim() ?? '';
				if (!registered && input.startsWith(direct)) return input.slice(direct.length).trim() === message;
				if (input.toLowerCase() !== confirm.toLowerCase()) return false;
				confirming = true;
			}
			for (const response of entry.model ?? []) {
				if (response.role !== 'assistant') continue;
				if (!confirming) {
					calls.push(...response.content.flatMap((block) => block.type === 'toolCall' && block.name === feedback.toolName ? [block.id] : []));
				} else {
					// Consume only the preceding turn's offer, never an older offer or a tool result.
					const text = messageText(response).trim();
					if (!text) continue;
					const start = text.lastIndexOf(draftStart);
					const notice = text.slice(0, start);
					return start >= 0 && text.endsWith(draftEnd)
						&& notice.includes(deliveryNotice) && (!registered || notice.includes(accountNotice))
						&& text.slice(start + draftStart.length, -draftEnd.length).trim() === message;
				}
			}
		}
		cursor = page.next;
	} while (cursor);
	return false;
}

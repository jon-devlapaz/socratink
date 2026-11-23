import { BACKGROUND_CONTEXT as context } from '@earendil-works/chord/context';
import { LiveDoc, ROOT_CONVERSATION_ID, type Cursor, type EntryRecord, type LiveState, type SubmissionRecord } from '@earendil-works/pi-durable';
import type { AssistantMessage, Message } from '@earendil-works/pi-ai';
import type { ModelSelection, ProductMessage, ProductTool, Snapshot } from './contract.ts';
import { inputKind } from './contract.ts';
import { messageText } from './extension.ts';
import { messageRoute } from './provider.ts';
import { asksForNoText, splitReasoning } from '../../learning/learner-text.ts';
import { withRevealConsent } from './reveal-consent.ts';
import type { CommittedStorage } from './storage.ts';

export type InputData = { requestId: string; selection?: ModelSelection; revealConsent?: true };

export async function readSnapshot(storage: CommittedStorage): Promise<Snapshot> {
	const snapshot: Snapshot = { revision: storage.revision, messages: [], submissions: [] };
	if (!await storage.conversation(ROOT_CONVERSATION_ID, context)) return snapshot;
	let cursor: Cursor | undefined;
	let assistant: ProductMessage | undefined;
	let silenced = false;
	const tools = new Map<string, ProductTool>();
	const consentRequired = new Set<string>();
	do {
		const page = await storage.scanEntries({ conversationId: ROOT_CONVERSATION_ID, order: 'ascending' }, 100, cursor, context);
		for (const entry of page.items) {
			if (entry.kind === inputKind) {
				assistant = await beginSubmission(snapshot, storage, entry);
				if ((entry.data as InputData).revealConsent) consentRequired.add(assistant.submissionId);
				tools.clear();
				silenced = false;
			} else if (assistant) silenced = appendEntry(assistant, entry, tools, silenced);
		}
		cursor = page.next;
	} while (cursor);
	const record = await storage.findDocument({ kind: LiveDoc.definition.kind,
		scope: { kind: 'conversation', conversationId: ROOT_CONVERSATION_ID } }, 'current', context);
	const live = record ? (await storage.document(record.id, 'current', context))?.value as LiveState | undefined : undefined;
	if (assistant && live?.generation?.message) appendAssistant(assistant, live.generation.message, silenced);
	for (const slot of live?.tools ?? []) {
		const tool = tools.get(slot.callId);
		if (tool && slot.output) tool.output = slot.output;
	}
	snapshot.messages = snapshot.messages.filter((message) => message.role === 'user'
		|| message.text || message.reasoning || message.tools?.length || Object.keys(message.data ?? {}).length);
	return withRevealConsent(snapshot, consentRequired);
}

async function beginSubmission(snapshot: Snapshot, storage: CommittedStorage, entry: EntryRecord): Promise<ProductMessage> {
	const record = await storage.submissionByRequest(ROOT_CONVERSATION_ID, (entry.data as InputData).requestId, context);
	if (!record) throw new Error('Input has no durable submission.');
	const submissionId = String(record.id);
	const text = entry.model?.map(messageText).join('') ?? '';
	snapshot.submissions.push({ id: submissionId, text, ...settlement(record) });
	snapshot.messages.push({ role: 'user', submissionId, text });
	const assistant: ProductMessage = { role: 'assistant', submissionId, text: '' };
	snapshot.messages.push(assistant);
	return assistant;
}

function appendEntry(assistant: ProductMessage, entry: EntryRecord, tools: Map<string, ProductTool>, silenced: boolean): boolean {
	for (const message of entry.model ?? []) {
		if (message.role === 'user' && asksForNoText(messageText(message))) silenced = true;
		if (message.role === 'assistant') {
			appendAssistant(assistant, message, silenced);
			for (const call of message.content.filter((block) => block.type === 'toolCall')) {
				const tool: ProductTool = { id: `${entry.id}:${call.id}`, name: call.name, input: call.arguments, state: 'running' };
				(assistant.tools ??= []).push(tool);
				tools.set(call.id, tool);
			}
		}
		if (message.role === 'toolResult') appendResult(assistant, message, tools);
	}
	return silenced;
}

function appendResult(assistant: ProductMessage, message: Extract<Message, { role: 'toolResult' }>, tools: Map<string, ProductTool>) {
	const tool = tools.get(message.toolCallId);
	if (tool) Object.assign(tool, { state: 'done', output: messageText(message), isError: message.isError });
	if (message.isError || !message.details) return;
	for (const [name, values] of Object.entries(message.details)) {
		if (Array.isArray(values)) (assistant.data ??= {})[name] = [...(assistant.data?.[name] ?? []), ...values];
	}
}

function appendAssistant(target: ProductMessage, message: AssistantMessage, silenced: boolean) {
	const split = splitReasoning(messageText(message));
	const text = silenced ? '' : split.text;
	const inline = silenced ? [split.text, split.reasoning].filter(Boolean).join('\n\n') : split.reasoning;
	const reasoning = [...message.content.flatMap((block) => block.type === 'thinking' && !block.redacted ? [block.thinking] : []), inline]
		.filter(Boolean).join('\n\n');
	if (text) target.text += `${target.text ? '\n\n' : ''}${text}`;
	if (reasoning) target.reasoning = `${target.reasoning ? `${target.reasoning}\n\n` : ''}${reasoning}`;
	const route = messageRoute(message);
	if (route) target.metadata = { socratink: route };
}

function settlement(record: SubmissionRecord): { outcome?: 'completed' | 'failed' | 'aborted'; error?: string } {
	if (record.status === 'done') return { outcome: 'completed' };
	if (record.status !== 'unanswered') return {};
	return record.reason === 'aborted' ? { outcome: 'aborted' }
		: { outcome: 'failed', error: 'The model request could not complete.' };
}

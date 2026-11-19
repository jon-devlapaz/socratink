export const feedback = {
	ingest: 'https://ingest.modem.dev/feedback',
	mcp: 'https://mcp.modem.dev/feedback',
	route: '/api/feedback',
	maxMessage: 4096,
	timeoutMs: 10_000,
	toolName: 'submit_feedback',
} as const;

export function validFeedbackMessage(message: string): boolean {
	return message.length > 0 && Array.from(message).length <= feedback.maxMessage;
}

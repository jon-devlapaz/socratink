export type ConversationSummary = Readonly<{ id: string; title: string; updatedAt: string }>;

export function conversationTitle(text: string): string {
	const line = text.replace(/\s+/g, ' ').trim();
	return line.length > 60 ? `${line.slice(0, 59).trimEnd()}…` : line;
}

/** The `GET /api/conversations` body, or undefined when it is not one. */
export function parseConversationList(body: unknown): ConversationSummary[] | undefined {
	const rows = (body as { conversations?: unknown } | null)?.conversations;
	if (!Array.isArray(rows)) return undefined;
	return rows.every((row) => typeof row?.id === 'string' && typeof row.title === 'string'
		&& typeof row.updatedAt === 'string' && Number.isFinite(Date.parse(row.updatedAt))) ? rows : undefined;
}

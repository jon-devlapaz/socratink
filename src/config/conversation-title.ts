/** A conversation's title: the learner's first admitted message on one line,
 * shortened. The server stores it; the History page shows it. */
export function conversationTitle(text: string): string {
	const line = text.replace(/\s+/g, ' ').trim();
	return line.length > 60 ? `${line.slice(0, 59).trimEnd()}…` : line;
}

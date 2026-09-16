const internalAssistantMarkerPattern = /^«[A-Z][A-Z0-9_]*»\s*/u;

export function learnerVisibleAssistantText(text: string): string {
	let visible = text;
	while (internalAssistantMarkerPattern.test(visible)) {
		visible = visible.replace(internalAssistantMarkerPattern, '');
	}
	return visible;
}

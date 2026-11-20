import { displayLabel, type DisplayedTurn } from './chat-turns.ts';
import { toolStateLabel, visibleToolOutput } from './tool-state.ts';

export function conversationMarkdown(turns: readonly DisplayedTurn[]): string {
	return turns.map((turn) => {
		const sections = [turn.shownText ?? turn.text];
		if (turn.reveal) {
			sections.unshift(`Socratink supplied ${turn.reveal.kind.replaceAll('_', ' ')}${turn.reveal.target ? `: ${turn.reveal.target}` : ''}.`);
		}
		for (const item of turn.questionnaire?.items ?? []) {
			sections.push([
				item.prompt,
				item.description,
				...item.choices.map((choice) => `- ${choice.label}${choice.description ? `: ${choice.description}` : ''}`),
				item.input?.label,
			].filter(Boolean).join('\n'));
		}
		for (const tool of turn.tools ?? []) {
			sections.push([`${tool.name}: ${toolStateLabel(tool.state)}`, visibleToolOutput(tool)].filter(Boolean).join('\n\n'));
		}
		return `## ${displayLabel(turn.role)}\n\n${sections.filter(Boolean).join('\n\n')}`;
	}).join('\n\n');
}

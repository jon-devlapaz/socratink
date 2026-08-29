export const r1LearningTarget =
	'Given an agent execution trace, I can reconstruct its loop stages and justify whether it should continue, stop, or pause using observable conditions.';

export const r1FirstExampleTrace = `goal: summarize notes.md for the user
tool: read
path: notes.md
result: File not found
listed tools: read, write
next: summarize notes.md`;

export const r1OpeningKickoff = 'Begin.';

export const r1OpeningMessage = `Your target:\n${r1LearningTarget}`;

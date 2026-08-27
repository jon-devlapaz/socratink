export const r1LearningTarget =
	'Given an agent execution trace, I can reconstruct its loop stages and justify whether it should continue, stop, or pause using observable conditions.';

export const r1StartingPaths = [
	{
		label: 'Explore an example agent trace',
		message: 'I want to explore an example agent trace.',
	},
	{
		label: 'Try a small interactive puzzle',
		message: 'I want to try a small interactive puzzle.',
	},
	{
		label: 'Build a tiny agent loop',
		message: 'I want to build a tiny agent loop.',
	},
] as const;

export const r1OpeningMessage = `Your target:\n${r1LearningTarget}`;

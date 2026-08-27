export const r1LearningTarget =
	'Given a simple synapse description, I can name the presynaptic side, the postsynaptic side, and the transmitter, and say whether the next neuron is more or less likely to fire.';

export const r1StartingPaths = [
	{
		label: 'Explore a worked example',
		message: 'I want to explore a worked example of one synapse.',
	},
	{
		label: 'Try a small puzzle',
		message: 'I want to try a small synapse puzzle.',
	},
	{
		label: 'Apply it',
		message: 'I want to judge a new synapse on my own.',
	},
] as const;

export const r1OpeningMessage = `Your target:\n${r1LearningTarget}`;

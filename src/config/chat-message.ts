const maxLearnerMessageLength = 16_000;
export const steeringPrefix = 'Steering:';
export const steeringMessages = {
	'smaller-step': `${steeringPrefix} smaller step. The last turn moved too fast or assumed more footing than I have. Slow down to one smaller step, and check a missing assumption before continuing.`,
	'try-unaided': `${steeringPrefix} try unaided. I have enough footing. Withhold the next reveal and let me attempt the target.`,
} as const;

export function learnerMessageLengthError(text: string): string | undefined {
	if (text.length <= maxLearnerMessageLength) return undefined;
	const formatted = text.length.toLocaleString('en-US');
	const limit = maxLearnerMessageLength.toLocaleString('en-US');
	return `That message is ${formatted} characters. Keep it under ${limit} characters.`;
}

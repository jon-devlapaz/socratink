export const maxLearnerMessageLength = 16_000;

export function learnerMessageLengthError(text: string): string | undefined {
	if (text.length <= maxLearnerMessageLength) return undefined;
	const formatted = text.length.toLocaleString('en-US');
	const limit = maxLearnerMessageLength.toLocaleString('en-US');
	return `That message is ${formatted} characters. Keep it under ${limit} characters.`;
}

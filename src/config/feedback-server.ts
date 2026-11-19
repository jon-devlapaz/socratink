export function readFeedbackToken(): string | undefined {
	return process.env.VITE_MODEM_FEEDBACK_TOKEN?.trim() || undefined;
}

export function feedbackEnvironment(): string {
	return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
}

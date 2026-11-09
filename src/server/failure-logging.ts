export function reportFailure(category: 'submission_failed' | 'submission_recovery' | 'request_failed'): void {
	// Runtime events and provider errors can contain learner text and credentials.
	console.error(JSON.stringify({ event: 'socratink_failure', category }));
}

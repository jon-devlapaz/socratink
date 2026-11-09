import { observe } from '@flue/runtime';

export function reportFailure(category: 'submission_failed' | 'submission_recovery' | 'request_failed'): void {
	console.error(JSON.stringify({ event: 'socratink_failure', category }));
}

observe((event) => {
	// Terminated recovery also emits the failed settlement handled below.
	const category = event.type === 'submission_recovery' && event.outcome !== 'terminated'
		? 'submission_recovery'
		: event.type === 'submission_settled' && event.outcome === 'failed'
			? 'submission_failed'
			: undefined;
	if (!category) return;
	// Runtime events and provider errors can contain learner text and credentials.
	console.error(JSON.stringify({ event: 'socratink_failure', category }));
});

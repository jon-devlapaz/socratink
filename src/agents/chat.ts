'use agent';
import { useModel } from '@flue/runtime';

/**
 * Default Socratink conversation agent.
 *
 * Purpose: the current Flue-backed chat instruction.
 * Inputs: Flue model hook. Outputs: assistant instruction text.
 * Constraints: do not turn this agent into an implicit tutor or R1 loop.
 */
export function Chat() {
	useModel('jon-local/auto');
	return 'You are a helpful conversational assistant.';
}

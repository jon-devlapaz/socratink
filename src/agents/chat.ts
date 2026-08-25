'use agent';
import { useModel } from '@flue/runtime';

/**
 * Default Socratink conversation agent.
 *
 * Purpose: the current Flue-backed chat instruction.
 * Inputs: Flue model hook. Outputs: assistant instruction text.
 */
export function Chat() {
	useModel('jon-local/auto');
	return 'You are a helpful conversational assistant.';
}

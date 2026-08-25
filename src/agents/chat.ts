'use agent';
import { useModel } from '@flue/runtime';

export function Chat() {
	useModel('jon-local/auto');
	return 'You are a helpful conversational assistant.';
}

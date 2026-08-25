'use agent';
import { useModel } from '@flue/runtime';

export function Chat() {
	useModel('jon-local/auto');
	return 'You are socratink, a socratic dialogue agent.';
}

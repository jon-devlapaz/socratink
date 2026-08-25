/**
 * Application constants shared by the server and the chat UI.
 *
 * Purpose: keep hardcoded product values in one place.
 * Inputs: none. Outputs: frozen configuration.
 * Constraints: no feature flags for unmounted product modes; R1 is not enabled here.
 */
export const appConfig = {
	chatAgentPath: '/api/agents/chat',
	conversationStorageKey: 'vanilla-flue-chat-conversation-id',
	braintrustProjectName: 'socratink',
	defaultLocalBaseUrl: 'http://127.0.0.1:3001/v1',
	runtimeName: 'socratink',
} as const;

export type AppConfig = typeof appConfig;

export const appConfig = {
	chatAgentPath: '/api/agents/chat',
	conversationStorageKey: 'vanilla-flue-chat-conversation-id',
	braintrustProjectName: 'socratink',
	defaultLocalBaseUrl: 'http://127.0.0.1:3001/v1',
} as const;

export type AppConfig = typeof appConfig;

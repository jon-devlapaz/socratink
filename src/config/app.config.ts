export const appConfig = {
	chatAgentPath: '/api/agents/chat',
	chatConversationStorageKey: 'socratink-chat-conversation-id',
	braintrustProjectName: 'socratink',
	defaultLocalBaseUrl: 'http://127.0.0.1:3001/v1',
	defaultLocalModelId: 'auto',
	vercelAiGatewayBaseUrl: 'https://ai-gateway.vercel.sh/v1',
	vercelAiGatewayModelId: 'minimax/minimax-m2.7',
} as const;

export type AppConfig = typeof appConfig;

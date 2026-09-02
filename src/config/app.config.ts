export const appConfig = {
	chatAgentPath: '/api/agents/chat',
	chatConversationStorageKey: 'socratink-chat-conversation-id',
	chatAutoModelStorageKey: 'socratink-chat-auto-model',
	themeStorageKey: 'socratink-theme', // keep in sync with the boot script in src/ui/index.html
	typeSizeStorageKey: 'socratink-type-size', // keep in sync with the boot script in src/ui/index.html
	braintrustProjectName: 'socratink',
	defaultLocalBaseUrl: 'http://127.0.0.1:3001/v1',
	defaultLocalModelId: 'auto',
	vercelAiGatewayBaseUrl: 'https://ai-gateway.vercel.sh/v1',
	vercelAiGatewayModelId: 'minimax/minimax-m2.7',
} as const;

export type AppConfig = typeof appConfig;

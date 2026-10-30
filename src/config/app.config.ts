export const appConfig = {
	chatAgentPath: '/api/agents/chat',
	sessionPath: '/api/session',
	openaiKeyPath: '/api/openai-key',
	chatRoutePath: '/api/chat-route',
	authProvidersPath: '/api/auth/providers',
	chatConversationStorageKey: 'socratink-chat-conversation-id',
	chatConversationResetKey: 'socratink-chat-conversation-reset',
	chatModelStorageKey: 'socratink-chat-model',
	themeStorageKey: 'socratink-theme', // keep in sync with the boot script in src/ui/index.html
	typeSizeStorageKey: 'socratink-type-size', // keep in sync with the boot script in src/ui/index.html
	defaultLocalBaseUrl: 'http://127.0.0.1:3001/v1',
	defaultLocalModelId: 'auto',
	vercelAiGatewayBaseUrl: 'https://ai-gateway.vercel.sh/v1',
	vercelAiGatewayModelId: 'minimax/minimax-m2.7',
} as const;

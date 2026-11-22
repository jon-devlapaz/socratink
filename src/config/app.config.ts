export const appConfig = {
	chatAgentPath: '/api/agents/chat',
	soundStorageKey: 'socratink-sound',
	sessionPath: '/api/session',
	conversationsPath: '/api/conversations',
	authProvidersPath: '/api/auth/providers',
	chatConversationStorageKey: 'socratink-chat-conversation-id',
	chatConversationResetKey: 'socratink-chat-conversation-reset',
	chatHistoryStorageKey: 'socratink-chat-history',
	themeStorageKey: 'socratink-theme', // keep in sync with the boot script in src/ui/index.html
	typeSizeStorageKey: 'socratink-type-size', // keep in sync with the boot script in src/ui/index.html
	defaultLocalBaseUrl: 'http://127.0.0.1:3001/v1',
	defaultLocalModelId: 'auto',
	vercelAiGatewayBaseUrl: 'https://ai-gateway.vercel.sh/v1',
	vercelAiGatewayModelId: 'xiaomi/mimo-v2.6-flash',
	// The gateway tries these in order when the primary model fails.
	vercelAiGatewayFallbackModelIds: ['minimax/minimax-m3.1-flash'],
} as const;

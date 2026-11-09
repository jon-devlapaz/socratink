import { createAgentRouter } from '@flue/runtime/routing';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { createApp } from './app-factory.ts';
import { rememberLegacySelection } from './server/legacy-selection.ts';

const chat = new Hono();
chat.use('*', async (context, next) => { await rememberLegacySelection(context); return next(); });
chat.route('/', createAgentRouter(Chat));
export default createApp(chat, 'flue');

import { hydrateRoot } from 'react-dom/client';
import { ChatPage } from './chat-page.tsx';
import { readOrCreateSession } from './session.ts';
import { mountChatSurface, type TranscriptContent } from './chat-surface.tsx';
import { forgetLegacyHistory } from './history.tsx';
import { watchSystemAppearance } from './theme.ts';
import { requireElement } from './dom.ts';
import './styles.css';
import './menu.css';
import './history.css';
import './feedback.css';
import './transcript.css';
import './reveal-mark.css';
import './chat-markdown.css';
import './questionnaire.css';
import './tool-card.css';
import './dictation.css';
import './steering.css';
import './buttons.css';

async function startChat(
	onStartOverDisabledChange: (disabled: boolean) => void,
	onTranscriptChange: (content: TranscriptContent) => void,
) {
	const user = await readOrCreateSession();
	if (!user) {
		location.replace('/login.html');
		return;
	}
	forgetLegacyHistory();
	const controls = mountChatSurface({
		userId: user.userId,
		aliases: user.aliases,
		onStartOverDisabledChange,
		onTranscriptChange,
	});
	return { user, ...controls };
}

watchSystemAppearance();
hydrateRoot(requireElement('#root'), <ChatPage startChat={startChat} />);

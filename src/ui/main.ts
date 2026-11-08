import { readOrCreateSession } from './session.ts';
import { mountChatSurface } from './chat-surface.ts';
import { mountSmoothCursor } from './effects/smooth-cursor.ts';
import './styles.css';
import './cursor.css';
import './dock.css';
import './menu.css';
import './transcript.css';
import './reveal-mark.css';
import './chat-markdown.css';
import './questionnaire.css';
import './tool-card.css';
import './dictation.css';
import './steering.css';

void (async () => {
	const session = await readOrCreateSession();
	if (!session) {
		location.replace('/login.html');
		return;
	}
	const authLink = document.querySelector<HTMLAnchorElement>('#auth-link');
	const authLinkLabel = document.querySelector<HTMLElement>('#auth-link-label');
	if (authLink && authLinkLabel && session.kind === 'registered') {
		authLink.href = '/api/session/logout';
		authLinkLabel.textContent = 'Sign out';
	}
	mountSmoothCursor();
	mountChatSurface({
		userId: session.userId,
		aliases: session.aliases,
	});
})();

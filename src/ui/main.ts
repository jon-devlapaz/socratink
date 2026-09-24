import { readOrCreateSession } from './session.ts';
import { mountChatSurface } from './chat-surface.ts';
import inkPoster from './effects/living-ink/poster.png';
import type { InkExpression } from '../ink-cue.ts';
import type { mountLivingInk } from './effects/living-ink.ts';
import { mountSmoothCursor } from './effects/smooth-cursor.ts';
import { createVoiceLevelMeter, type VoiceLevelMeter } from './voice-level-meter.ts';
import './styles.css';
import './cursor.css';
import './dock.css';
import './menu.css';
import './transcript.css';
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

	const core = document.querySelector<HTMLElement>('.alive-core');
	if (!core) throw new Error('Socratink chat markup is missing the alive-core node.');

	let ink: ReturnType<typeof mountLivingInk> | undefined;
	let expression: InkExpression = 'rest';
	const poster = document.createElement('img');
	poster.className = 'living-ink-poster';
	poster.src = inkPoster;
	poster.alt = '';
	core.append(poster);
	const voiceActivity: VoiceLevelMeter = createVoiceLevelMeter((level) =>
		ink?.setVoiceLevel(level),
	);
	void import('./effects/living-ink.ts')
		.then(({ mountLivingInk }) => {
			ink = mountLivingInk(core, expression);
		})
		.catch(() => {
			core.dataset.inkUnavailable = 'true';
		});
	mountSmoothCursor();
	mountChatSurface({
		voiceActivity,
		userId: session.userId,
		aliases: session.aliases,
		onInkExpression(next) {
			expression = next;
			ink?.setExpression(next);
		},
	});
})();

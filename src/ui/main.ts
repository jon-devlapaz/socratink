import { mountChatSurface } from './chat-surface.ts';
import { mountOrganicSphere } from './effects/organic-sphere.ts';
import { mountSmoothCursor } from './effects/smooth-cursor.ts';
import { createVoiceLevelMeter, type VoiceLevelMeter } from './voice-level-meter.ts';
import './styles.css';
import './cursor.css';
import './dock.css';
import './transcript.css';
import './chat-markdown.css';
import './questionnaire.css';
import './tool-card.css';
import './chat-auto.css';
import './dictation.css';

const core = document.querySelector<HTMLElement>('.alive-core');
if (!core) throw new Error('Socratink chat markup is missing the alive-core node.');

let voiceActivity: VoiceLevelMeter | undefined;
try {
	const sphere = mountOrganicSphere(core);
	voiceActivity = createVoiceLevelMeter(sphere.setVoiceLevel);
} catch {
	core.replaceChildren();
}
mountSmoothCursor();
mountChatSurface({ voiceActivity });

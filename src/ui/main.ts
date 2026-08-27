import { mountChatSurface } from './chat-surface.ts';
import { mountOrganicSphere } from './effects/organic-sphere.ts';
import './styles.css';
import './transcript.css';
import './questionnaire.css';

const core = document.querySelector<HTMLElement>('.alive-core');
if (!core) throw new Error('Socratink chat markup is missing the alive-core node.');

try {
	mountOrganicSphere(core);
} catch {
	core.replaceChildren();
}
mountChatSurface();

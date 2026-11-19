import { appConfig } from '../config/app.config.ts';
import type { WireReply } from '../config/chat-wire.ts';
import { revealFromReply } from '../reveal.ts';

export function mountSoundCues(button: HTMLButtonElement) {
	let enabled = localStorage.getItem(appConfig.soundStorageKey) === 'on';
	let context: AudioContext | undefined;
	let pending = false;

	function paint() {
		button.setAttribute('aria-pressed', String(enabled));
		button.textContent = `Sound ${enabled ? 'on' : 'off'}`;
	}

	function unlock(event: Event) {
		if (!event.isTrusted || !enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (!window.AudioContext) return;
		try {
			context ??= new AudioContext();
			if (context.state === 'suspended') void context.resume().catch(() => {});
		} catch {
			context = undefined;
		}
	}

	document.addEventListener('click', unlock);
	document.addEventListener('keydown', unlock);
	button.addEventListener('click', (event) => {
		enabled = !enabled;
		localStorage.setItem(appConfig.soundStorageKey, enabled ? 'on' : 'off');
		paint();
		unlock(event);
	});
	paint();

	return {
		beginReply() { pending = true; },
		complete(reply: WireReply) {
			if (!pending) return;
			pending = false;
			if (!enabled || !context || context.state !== 'running'
				|| window.matchMedia('(prefers-reduced-motion: reduce)').matches
				|| revealFromReply(reply.data)) return;
			try {
				const now = context.currentTime;
				const oscillator = context.createOscillator();
				const gain = context.createGain();
				oscillator.frequency.setValueAtTime(880, now);
				gain.gain.setValueAtTime(0, now);
				gain.gain.linearRampToValueAtTime(0.02, now + 0.004);
				gain.gain.linearRampToValueAtTime(0, now + 0.04);
				oscillator.connect(gain);
				gain.connect(context.destination);
				oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
				oscillator.start(now);
				oscillator.stop(now + 0.045);
			} catch {
				context = undefined;
			}
		},
	};
}

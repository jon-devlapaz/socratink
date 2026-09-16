import { INK_EXPRESSIONS } from './living-ink/expressions.ts';
import { mountInk } from './living-ink/renderer.ts';
import type { InkExpression } from '../../ink-cue.ts';
import { resolvedAppearance } from '../theme.ts';
import { sphereVisualRadiusFraction } from './organic-sphere.ts';

export function mountLivingInk(core: HTMLElement, initial: InkExpression) {
	const surface = document.createElement('div');
	surface.className = 'living-ink-render';
	core.append(surface);
	const renderer = mountInk(surface, INK_EXPRESSIONS[initial].scene, () => {
		if (surface.dataset.inkReady !== 'true') surface.dataset.inkReady = 'true';
	});
	const host = core.closest<HTMLElement>('.alive-anchor') ?? core;
	const fraction = sphereVisualRadiusFraction();
	host.style.setProperty('--orb-visual-radius', `${fraction * 100}%`);
	host.style.setProperty('--orb-below', String(0.5 - fraction));
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const scheme = matchMedia('(prefers-color-scheme: dark)');
	const theme = () => renderer.setTheme(resolvedAppearance());
	const motion = () => renderer.setReduced(reduced.matches);
	let expression = initial;
	let voice = 0;
	let paused: boolean | undefined;
	core.dataset.inkExpression = initial;
	const syncPause = () => {
		const next =
			core.classList.contains('is-still') ||
			(voice === 0 &&
				(document.body.classList.contains('conversation-empty') ||
					core.getAttribute('aria-expanded') === 'true'));
		if (next !== paused) {
			paused = next;
			renderer.setPaused(next);
		}
	};
	const appearanceObserver = new MutationObserver(theme);
	appearanceObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme'],
	});
	const stateObserver = new MutationObserver(syncPause);
	stateObserver.observe(core, {
		attributes: true,
		attributeFilter: ['class', 'aria-expanded'],
	});
	stateObserver.observe(document.body, {
		attributes: true,
		attributeFilter: ['class'],
	});
	scheme.addEventListener('change', theme);
	reduced.addEventListener('change', motion);
	theme();
	motion();
	syncPause();
	return {
		setExpression(next: InkExpression) {
			if (next === expression) return;
			expression = next;
			core.dataset.inkExpression = next;
			renderer.setScene(INK_EXPRESSIONS[next].scene);
		},
		setVoiceLevel(value: number) {
			voice = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
			renderer.setVoiceLevel(voice);
			syncPause();
		},
		destroy() {
			appearanceObserver.disconnect();
			stateObserver.disconnect();
			scheme.removeEventListener('change', theme);
			reduced.removeEventListener('change', motion);
			renderer.destroy();
			surface.remove();
		},
	};
}

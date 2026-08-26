import { appConfig } from '../config/app.config.ts';

export type Appearance = 'light' | 'dark';

const paperLight = '#fffcf0';
const paperDark = '#100f0f';

function storedAppearance(): Appearance | null {
	const value = localStorage.getItem(appConfig.themeStorageKey);
	if (value === 'light' || value === 'dark') return value;
	return null;
}

export function resolvedAppearance(): Appearance {
	return (
		storedAppearance() ??
		(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
	);
}

function withoutColorTransitions(apply: () => void) {
	const style = document.createElement('style');
	style.textContent =
		'*:not(.theme-icon),*::before,*::after{transition:none !important}';
	document.head.append(style);
	apply();
	void document.body.offsetHeight;
	requestAnimationFrame(() => {
		requestAnimationFrame(() => style.remove());
	});
}

function setThemeColor(appearance: Appearance) {
	document
		.querySelector('#theme-color')
		?.setAttribute('content', appearance === 'dark' ? paperDark : paperLight);
}

function paintAppearance(button: HTMLButtonElement, appearance: Appearance) {
	const night = appearance === 'dark';
	button.classList.toggle('is-night', night);
	button.setAttribute('aria-pressed', String(night));
	button.setAttribute(
		'aria-label',
		night ? 'Switch to light appearance' : 'Switch to dark appearance',
	);
	setThemeColor(appearance);
}

export function initAppearance(button: HTMLButtonElement) {
	paintAppearance(button, resolvedAppearance());
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (storedAppearance()) return;
		withoutColorTransitions(() => paintAppearance(button, resolvedAppearance()));
	});
}

export function toggleAppearance(button: HTMLButtonElement) {
	const next: Appearance = resolvedAppearance() === 'dark' ? 'light' : 'dark';
	withoutColorTransitions(() => {
		document.documentElement.dataset.theme = next;
		localStorage.setItem(appConfig.themeStorageKey, next);
		paintAppearance(button, next);
	});
}

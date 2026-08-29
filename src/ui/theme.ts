import { appConfig } from '../config/app.config.ts';

export type Appearance = 'light' | 'dark';

const paperLight = '#fffcf0';
const paperDark = '#100f0f';
const revealMs = 400;

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

function applyAppearance(button: HTMLButtonElement, appearance: Appearance) {
	document.documentElement.dataset.theme = appearance;
	localStorage.setItem(appConfig.themeStorageKey, appearance);
	paintAppearance(button, appearance);
}

function revealFrom(button: HTMLButtonElement) {
	const { top, left, width, height } = button.getBoundingClientRect();
	const x = left + width / 2;
	const y = top + height / 2;
	const maxRadius = Math.hypot(
		Math.max(x, window.innerWidth - x),
		Math.max(y, window.innerHeight - y),
	);
	document.documentElement.animate(
		{
			clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
		},
		{
			duration: revealMs,
			easing: 'ease-in-out',
			pseudoElement: '::view-transition-new(root)',
		},
	);
}

export function initAppearance(button: HTMLButtonElement) {
	paintAppearance(button, resolvedAppearance());
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (storedAppearance()) return;
		withoutColorTransitions(() => paintAppearance(button, resolvedAppearance()));
	});
}

export async function toggleAppearance(button: HTMLButtonElement) {
	const next: Appearance = resolvedAppearance() === 'dark' ? 'light' : 'dark';
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const startViewTransition = document.startViewTransition?.bind(document);

	if (reduceMotion || !startViewTransition) {
		withoutColorTransitions(() => applyAppearance(button, next));
		return;
	}

	const transition = startViewTransition(() => {
		withoutColorTransitions(() => applyAppearance(button, next));
	});
	await transition.ready;
	revealFrom(button);
}

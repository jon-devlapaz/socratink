import { appConfig } from '../config/app.config.ts';
import {
	freeLlmAutoModelIds,
	parseFreeLlmAutoModelId,
	type FreeLlmAutoModelId,
} from '../config/chat-auto.ts';

const routingCopy: Record<FreeLlmAutoModelId, { label: string; meta: string }> = {
	auto: { label: 'Default', meta: 'Chain' },
	'auto:smart': { label: 'Smart', meta: 'Intelligence' },
	'auto:reliable': { label: 'Reliable', meta: 'Uptime' },
	'auto:fast': { label: 'Fast', meta: 'Speed' },
};

const iconMarkup: Record<FreeLlmAutoModelId, string> = {
	auto: iconSvg(
		'<path d="M12 4 4 8l8 4 8-4-8-4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
	),
	'auto:smart': iconSvg(
		'<path d="M12 3.2 13.45 8.1 18.5 9.5 13.45 10.9 12 15.8 10.55 10.9 5.5 9.5 10.55 8.1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M18.5 3.5v3M20 5h-3M6.2 16.2l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
	),
	'auto:reliable': iconSvg(
		'<path d="M12 3 20 7v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V7l8-4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 12.2 11 14.7 16 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
	),
	'auto:fast': iconSvg(
		'<path d="M13 2 4 13h7l-1 9 10-12h-7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
	),
};

export function initChatAutoModel(trigger: HTMLButtonElement): void {
	const picker = trigger.closest<HTMLElement>('.auto-model-picker');
	const menu = picker?.querySelector<HTMLElement>('.auto-model-menu');
	const name = trigger.querySelector<HTMLElement>('.auto-model-name');
	const icons = trigger.querySelector<HTMLElement>('.auto-model-icons');
	if (!picker || !menu || !name || !icons) {
		throw new Error('Socratink chat markup is missing the routing picker.');
	}

	if (icons.childElementCount === 0) {
		for (const id of freeLlmAutoModelIds) {
			const wrap = document.createElement('span');
			wrap.dataset.icon = id;
			wrap.innerHTML = iconMarkup[id];
			icons.append(wrap);
		}
	}

	if (menu.childElementCount === 0) {
		for (const id of freeLlmAutoModelIds) {
			const option = document.createElement('button');
			option.type = 'button';
			option.role = 'option';
			option.className = 'auto-model-option';
			option.dataset.model = id;
			option.id = `auto-model-option-${id.replace(':', '-')}`;
			option.innerHTML = `${iconMarkup[id]}<span class="auto-model-option-name">${routingCopy[id].label}</span><span class="auto-model-option-meta">${routingCopy[id].meta}</span><span class="auto-model-check" aria-hidden="true">${checkSvg()}</span>`;
			option.addEventListener('click', () => {
				paintChatAutoModel(trigger, menu, name, icons, id);
				setPickerOpen(trigger, menu, false);
				trigger.focus();
			});
			menu.append(option);
		}
	}

	paintChatAutoModel(trigger, menu, name, icons, resolvedChatAutoModel());

	trigger.addEventListener('click', () => {
		setPickerOpen(trigger, menu, trigger.getAttribute('aria-expanded') !== 'true');
	});
	trigger.addEventListener('keydown', (event) => {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		setPickerOpen(trigger, menu, true);
	});
	menu.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			setPickerOpen(trigger, menu, false);
			trigger.focus();
			return;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			focusOption(menu, event.key === 'ArrowDown' ? 1 : -1);
		}
	});
	picker.addEventListener('focusout', (event) => {
		if (picker.contains(event.relatedTarget as Node | null)) return;
		setPickerOpen(trigger, menu, false);
	});
	document.addEventListener('pointerdown', (event) => {
		if (picker.contains(event.target as Node | null)) return;
		setPickerOpen(trigger, menu, false);
	});
}

function resolvedChatAutoModel(): FreeLlmAutoModelId {
	return parseFreeLlmAutoModelId(localStorage.getItem(appConfig.chatAutoModelStorageKey)) ?? 'auto';
}

function paintChatAutoModel(
	trigger: HTMLButtonElement,
	menu: HTMLElement,
	name: HTMLElement,
	icons: HTMLElement,
	modelId: FreeLlmAutoModelId,
): void {
	trigger.value = modelId;
	name.textContent = routingCopy[modelId].label;
	trigger.setAttribute('aria-label', `Routing, ${routingCopy[modelId].label}`);
	for (const icon of icons.children) {
		icon.classList.toggle('is-active', icon instanceof HTMLElement && icon.dataset.icon === modelId);
	}
	for (const option of menu.querySelectorAll<HTMLButtonElement>('.auto-model-option')) {
		const active = option.dataset.model === modelId;
		option.classList.toggle('is-selected', active);
		option.setAttribute('aria-selected', String(active));
	}
	localStorage.setItem(appConfig.chatAutoModelStorageKey, modelId);
}

function setPickerOpen(trigger: HTMLButtonElement, menu: HTMLElement, open: boolean): void {
	trigger.setAttribute('aria-expanded', String(open));
	menu.dataset.open = String(open);
	menu.inert = !open;
	if (open) {
		const selected =
			menu.querySelector<HTMLButtonElement>('.auto-model-option.is-selected') ??
			menu.querySelector<HTMLButtonElement>('.auto-model-option');
		selected?.focus();
	}
}

function focusOption(menu: HTMLElement, delta: number): void {
	const options = [...menu.querySelectorAll<HTMLButtonElement>('.auto-model-option')];
	if (options.length === 0) return;
	const current = options.findIndex((option) => option === document.activeElement);
	const start = current === -1 ? (delta < 0 ? 0 : -1) : current;
	const next = options[(start + delta + options.length) % options.length];
	next?.focus();
}

function iconSvg(paths: string): string {
	return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${paths}</svg>`;
}

function checkSvg(): string {
	return iconSvg(
		'<path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
	);
}

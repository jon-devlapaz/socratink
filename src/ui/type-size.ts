import { appConfig } from '../config/app.config.ts';

export type TypeSize = 'big' | 'medium' | 'small';

function isTypeSize(value: string | null): value is TypeSize {
	return value === 'big' || value === 'medium' || value === 'small';
}

function storedTypeSize(): TypeSize | null {
	const value = localStorage.getItem(appConfig.typeSizeStorageKey);
	return isTypeSize(value) ? value : null;
}

export function resolvedTypeSize(): TypeSize {
	return storedTypeSize() ?? 'medium';
}

function nextTypeSize(size: TypeSize): TypeSize {
	switch (size) {
		case 'big':
			return 'medium';
		case 'medium':
			return 'small';
		case 'small':
			return 'big';
		default: {
			const exhaustive: never = size;
			return exhaustive;
		}
	}
}

function caption(size: TypeSize): string {
	switch (size) {
		case 'big':
			return 'Big';
		case 'medium':
			return 'Medium';
		case 'small':
			return 'Small';
		default: {
			const exhaustive: never = size;
			return exhaustive;
		}
	}
}

function paintTypeSize(button: HTMLButtonElement, size: TypeSize) {
	const next = nextTypeSize(size);
	const label = button.querySelector('#type-size-label');
	if (label) label.textContent = caption(size);
	button.dataset.size = size;
	button.setAttribute(
		'aria-label',
		`Text size ${caption(size).toLowerCase()}. Switch to ${caption(next).toLowerCase()}.`,
	);
}

function applyTypeSize(button: HTMLButtonElement, size: TypeSize) {
	document.documentElement.dataset.typeSize = size;
	localStorage.setItem(appConfig.typeSizeStorageKey, size);
	paintTypeSize(button, size);
}

export function initTypeSize(button: HTMLButtonElement) {
	const size = resolvedTypeSize();
	document.documentElement.dataset.typeSize = size;
	paintTypeSize(button, size);
}

export function cycleTypeSize(button: HTMLButtonElement) {
	applyTypeSize(button, nextTypeSize(resolvedTypeSize()));
}

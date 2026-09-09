import { appConfig } from '../config/app.config.ts';

export function hasDemoAuthSession(): boolean {
	return localStorage.getItem(appConfig.demoAuthStorageKey) === '1';
}

export function setDemoAuthSession(): void {
	localStorage.setItem(appConfig.demoAuthStorageKey, '1');
}

export function clearDemoAuthSession(): void {
	localStorage.removeItem(appConfig.demoAuthStorageKey);
}

export function isPlausibleEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

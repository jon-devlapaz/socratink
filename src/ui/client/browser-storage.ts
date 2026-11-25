export function readBrowserStorage(key: string): { value: string | null; available: boolean } {
	try {
		return { value: localStorage.getItem(key), available: true };
	} catch {
		return { value: null, available: false };
	}
}

export function writeBrowserStorage(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

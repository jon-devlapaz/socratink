import { randomId } from './random-id.ts';

export function mountUnsentWork(userId: string, hasWork: () => boolean) {
	const prefix = `socratink-unsent-work:${userId}:`;
	const key = prefix + randomId();
	let available = true;
	function sync() {
		try {
			localStorage.setItem(key, hasWork() ? '1' : '0');
			available = true;
		} catch {
			available = false;
		}
	}
	function changed() {
		queueMicrotask(sync);
	}
	document.addEventListener('input', changed);
	document.addEventListener('change', changed);
	document.addEventListener('click', changed);
	window.addEventListener('pageshow', sync);
	window.addEventListener('pagehide', (event) => {
		if (event.persisted) return sync();
		try {
			localStorage.removeItem(key);
		} catch {
			available = false;
		}
	});
	sync();
	return {
		sync,
		elsewhere(): 'present' | 'empty' | 'unknown' {
			sync();
			if (!available) return 'unknown';
			try {
				for (let index = 0; index < localStorage.length; index++) {
					const other = localStorage.key(index);
					if (other && other !== key && other.startsWith(prefix) && localStorage.getItem(other) === '1') return 'present';
				}
				return 'empty';
			} catch {
				return 'unknown';
			}
		},
	};
}

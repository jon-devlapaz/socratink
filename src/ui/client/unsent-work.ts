import { randomId } from './random-id.ts';

export function mountUnsentWork(userId: string, hasWork: () => boolean) {
	const prefix = `socratink-unsent-work:${userId}:`;
	const key = prefix + randomId();
	let available = true;
	let disposed = false;
	function sync() {
		if (disposed) return;
		try {
			localStorage.setItem(key, JSON.stringify({ hasWork: hasWork(), updatedAt: Date.now() }));
			available = true;
		} catch {
			available = false;
		}
	}
	function changed() {
		queueMicrotask(sync);
	}
	function remove() {
		try {
			localStorage.removeItem(key);
		} catch {
			available = false;
		}
	}
	function hide(event: PageTransitionEvent) {
		if (event.persisted) sync();
		else remove();
	}
	// A flag past expiry may be a crashed tab or a frozen one that still holds a draft,
	// so it reads as unknown, never as empty. Only a confirmed Start over removes it.
	function otherWork(removeExpired: boolean): 'present' | 'empty' | 'unknown' {
		let result: 'present' | 'empty' | 'unknown' = 'empty';
		for (const other of Object.keys(localStorage)) {
			if (other === key || !other.startsWith(prefix)) continue;
			let flag;
			try {
				flag = JSON.parse(localStorage.getItem(other) ?? 'null');
			} catch {
				flag = null;
			}
			if (typeof flag?.hasWork !== 'boolean' || typeof flag?.updatedAt !== 'number' || !Number.isFinite(flag.updatedAt)) {
				localStorage.removeItem(other);
				continue;
			}
			if (Date.now() - flag.updatedAt > 120_000) {
				if (removeExpired || !flag.hasWork) localStorage.removeItem(other);
				else if (result === 'empty') result = 'unknown';
				continue;
			}
			if (flag.hasWork) result = 'present';
		}
		return result;
	}
	document.addEventListener('input', changed);
	document.addEventListener('change', changed);
	document.addEventListener('click', changed);
	window.addEventListener('pageshow', sync);
	window.addEventListener('pagehide', hide);
	const heartbeat = window.setInterval(sync, 15_000);
	sync();
	return {
		sync,
		elsewhere(): 'present' | 'empty' | 'unknown' {
			sync();
			if (!available) return 'unknown';
			try {
				return otherWork(false);
			} catch {
				return 'unknown';
			}
		},
		clearStale() {
			try {
				otherWork(true);
			} catch {
				available = false;
			}
		},
		dispose() {
			disposed = true;
			window.clearInterval(heartbeat);
			document.removeEventListener('input', changed);
			document.removeEventListener('change', changed);
			document.removeEventListener('click', changed);
			window.removeEventListener('pageshow', sync);
			window.removeEventListener('pagehide', hide);
			remove();
		},
	};
}

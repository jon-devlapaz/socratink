import { loadAuthProviders, loginErrorCopy } from './session.ts';
import './login.css';

const url = new URL(location.href);
if (url.searchParams.has('error')) {
	const copy = loginErrorCopy(url.searchParams.get('error'));
	const message = document.querySelector<HTMLElement>('#login-error');
	if (copy && message) {
		message.textContent = copy;
		message.hidden = false;
	}
	url.searchParams.delete('error');
	history.replaceState(history.state, '', url);
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-provider]')) {
	button.addEventListener('click', () => {
		const provider = button.dataset.provider;
		if (provider) location.assign(`/api/auth/${provider}/login`);
	});
}

void loadAuthProviders().then((providers) => {
	for (const button of document.querySelectorAll<HTMLButtonElement>('[data-provider]')) {
		const provider = button.dataset.provider;
		if (provider !== 'google' && provider !== 'github') continue;
		if (!providers[provider]) button.remove();
	}
});

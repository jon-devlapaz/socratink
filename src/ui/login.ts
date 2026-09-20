import { loadAuthProviders } from './session.ts';
import './login.css';

// Durable sign-in is OAuth only until magic-link ships. No email field.
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

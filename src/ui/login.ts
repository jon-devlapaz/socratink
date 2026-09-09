import {
	clearDemoAuthSession,
	hasDemoAuthSession,
	isPlausibleEmail,
	setDemoAuthSession,
} from './demo-auth.ts';
import './login.css';

function requireElement<T extends Element>(selector: string): T {
	const node = document.querySelector<T>(selector);
	if (!node) throw new Error(`Login markup is missing ${selector}.`);
	return node;
}

const form = requireElement<HTMLFormElement>('#login-form');
const emailInput = requireElement<HTMLInputElement>('#auth-email');
const emailShell = requireElement<HTMLElement>('#email-shell');
const emailError = requireElement<HTMLElement>('#email-error');
const emailSubmit = requireElement<HTMLButtonElement>('#email-submit');
const sentPanel = requireElement<HTMLElement>('#login-sent');
const sentEmail = requireElement<HTMLElement>('#sent-email');
const enterDemo = requireElement<HTMLButtonElement>('#enter-demo');
const useOtherEmail = requireElement<HTMLButtonElement>('#use-other-email');

function enterNotebook(): void {
	setDemoAuthSession();
	location.assign('/');
}

function showError(message: string | null): void {
	const invalid = Boolean(message);
	emailError.hidden = !invalid;
	emailError.textContent = message ?? '';
	emailShell.classList.toggle('is-invalid', invalid);
	emailInput.setAttribute('aria-invalid', String(invalid));
	if (invalid) emailInput.setAttribute('aria-describedby', 'email-error');
	else emailInput.removeAttribute('aria-describedby');
}

function showSent(email: string): void {
	form.hidden = true;
	sentPanel.hidden = false;
	sentEmail.textContent = email;
	showError(null);
}

function showForm(): void {
	sentPanel.hidden = true;
	form.hidden = false;
	emailInput.value = '';
	emailInput.focus();
}

if (hasDemoAuthSession() && new URLSearchParams(location.search).has('signout')) {
	clearDemoAuthSession();
}

form.addEventListener('submit', (event) => {
	event.preventDefault();
	const email = emailInput.value.trim();
	if (!email) {
		showError('Please enter your email address.');
		emailInput.focus();
		return;
	}
	if (!isPlausibleEmail(email)) {
		showError('Please enter a valid email address.');
		emailInput.focus();
		return;
	}

	emailSubmit.disabled = true;
	emailSubmit.textContent = 'Sending link…';
	window.setTimeout(() => {
		emailSubmit.disabled = false;
		emailSubmit.textContent = 'Continue with email';
		showSent(email);
	}, 380);
});

emailInput.addEventListener('input', () => {
	if (!emailError.hidden) showError(null);
});

enterDemo.addEventListener('click', () => enterNotebook());
useOtherEmail.addEventListener('click', () => showForm());

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-provider]')) {
	button.addEventListener('click', () => enterNotebook());
}

emailInput.focus();

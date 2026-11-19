import { feedback, validFeedbackMessage } from '../config/feedback.ts';
import { feedbackToken } from '../config/feedback-client.ts';
import { feedbackSubmissionId } from './client/random-id.ts';
import { requireElement } from './dom.ts';
import type { SessionUser } from './session.ts';
import './feedback.css';

type Payload = { submission_id: string; message: string; url: string; name?: string; email?: string };
type Delivery = { kind: 'accepted' } | { kind: 'rejected' } | { kind: 'retry'; afterMs: number };

export function mountFeedback(kind: SessionUser['kind'], closeMenu: () => void) {
	if (!feedbackToken) return;
	const token = feedbackToken;
	const registered = kind === 'registered';
	const trigger = requireElement<HTMLButtonElement>('#feedback-trigger');
	const dialog = requireElement<HTMLDialogElement>('#feedback-dialog');
	const form = requireElement<HTMLFormElement>('#feedback-form');
	const notice = requireElement<HTMLElement>('#feedback-notice');
	const emailLabel = requireElement<HTMLElement>('#feedback-email-label');
	const status = requireElement<HTMLElement>('#feedback-status');
	const send = requireElement<HTMLButtonElement>('#feedback-send');
	const close = requireElement<HTMLButtonElement>('#feedback-close');
	const messageField = requireElement<HTMLTextAreaElement>('textarea', form);
	let payload: Payload | undefined;
	let sending = false;
	let retryTimer: number | undefined;

	emailLabel.hidden = registered;
	if (registered) notice.append(' Your account email goes with your message.');
	trigger.hidden = false;
	trigger.addEventListener('click', () => {
		closeMenu();
		dialog.showModal();
	});
	close.addEventListener('click', () => dialog.close());
	dialog.addEventListener('close', () => requireElement<HTMLButtonElement>('#menu-trigger').focus());
	form.addEventListener('input', () => {
		payload = undefined;
		clearTimeout(retryTimer);
		send.disabled = false;
		send.textContent = 'Send feedback';
		status.textContent = '';
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (sending || send.disabled) return;
		const fields = new FormData(form);
		const message = messageField.value.trim();
		if (!validFeedbackMessage(message)) {
			status.textContent = `Enter a message from 1 to ${feedback.maxMessage} characters.`;
			messageField.focus();
			return;
		}
		const name = String(fields.get('name') ?? '').trim();
		const email = registered ? '' : String(fields.get('email') ?? '').trim();
		payload ??= {
			submission_id: feedbackSubmissionId(), message, url: location.origin,
			...(name ? { name } : {}), ...(email ? { email } : {}),
		};
		sending = true;
		send.disabled = true;
		form.querySelectorAll('input, textarea').forEach((field) => field.setAttribute('readonly', ''));
		status.textContent = 'Sending feedback…';
		let result = await deliver(payload, registered, token);
		if (result.kind === 'retry' && result.afterMs <= 3_000) {
			const delay = result.afterMs;
			await new Promise((resolve) => setTimeout(resolve, delay));
			result = await deliver(payload, registered, token);
		}
		sending = false;
		form.querySelectorAll('input, textarea').forEach((field) => field.removeAttribute('readonly'));
		switch (result.kind) {
			case 'accepted':
				payload = undefined;
				form.reset();
				send.disabled = false;
				send.textContent = 'Send feedback';
				status.textContent = 'Modem accepted your feedback.';
				break;
			case 'rejected':
				status.textContent = 'Modem could not accept this feedback.';
				break;
			case 'retry':
				send.textContent = 'Retry';
				status.textContent = 'Feedback could not be sent. You can retry when the button is available.';
				retryTimer = window.setTimeout(() => { send.disabled = false; }, Math.min(result.afterMs, 2_147_483_647));
				break;
		}
	});
}

async function deliver(payload: Payload, registered: boolean, token: string): Promise<Delivery> {
	try {
		const response = await fetch(registered ? feedback.route : feedback.ingest, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...(!registered ? { Authorization: `Bearer ${token}` } : {}) },
			body: JSON.stringify(payload),
			redirect: 'error',
			signal: AbortSignal.timeout(feedback.timeoutMs),
		});
		if (response.status === 202) {
			const result = await response.json().catch(() => undefined);
			if (typeof result?.id === 'string' && result.id) return { kind: 'accepted' };
			return { kind: 'retry', afterMs: 700 };
		}
		if (response.status === 409 || response.status === 429 || response.status >= 500) {
			return { kind: 'retry', afterMs: retryDelay(response.headers.get('Retry-After')) };
		}
		return { kind: 'rejected' };
	} catch {
		return { kind: 'retry', afterMs: 700 };
	}
}

function retryDelay(value: string | null): number {
	if (!value) return 700;
	if (/^\d+$/.test(value)) return Number(value) * 1000;
	const date = Date.parse(value);
	return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 700;
}

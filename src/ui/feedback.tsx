import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { feedback, validFeedbackMessage } from '../config/feedback.ts';
import { feedbackSubmissionId } from './client/random-id.ts';

type Payload = { submission_id: string; message: string; url: string; name?: string; email?: string };
type Delivery = { kind: 'accepted' } | { kind: 'rejected' } | { kind: 'retry'; afterMs: number };
type Status = 'idle' | 'invalid' | 'sending' | 'accepted' | 'rejected' | 'waiting' | 'retry';
const statusCopy: Record<Status, string> = {
	idle: '',
	invalid: `Enter a message from 1 to ${feedback.maxMessage} characters.`,
	sending: 'Sending feedback…',
	accepted: 'Modem accepted your feedback.',
	rejected: 'Modem could not accept this feedback.',
	waiting: 'Feedback could not be sent. You can retry when the button is available.',
	retry: 'Feedback could not be sent. You can retry now.',
};
const blank = { message: '', name: '', email: '' };

export function FeedbackDialog({
	open,
	token,
	registered,
	onClose,
	onCloseFocus,
}: {
	open: boolean;
	token: string;
	registered: boolean;
	onClose: () => void;
	onCloseFocus: () => void;
}) {
	const [fields, setFields] = useState(blank);
	const [status, setStatus] = useState<Status>('idle');
	const title = useRef<HTMLHeadingElement>(null);
	const messageField = useRef<HTMLTextAreaElement>(null);
	const submission = useRef<Payload | undefined>(undefined);
	const retryTimer = useRef<number | undefined>(undefined);
	const sending = useRef(false);
	useEffect(() => () => clearTimeout(retryTimer.current), []);

	function edit(field: keyof typeof blank, value: string) {
		setFields({ ...fields, [field]: value });
		submission.current = undefined;
		clearTimeout(retryTimer.current);
		setStatus('idle');
	}

	async function send(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (sending.current || status === 'waiting' || status === 'rejected') return;
		const message = fields.message.trim();
		if (!validFeedbackMessage(message)) {
			setStatus('invalid');
			messageField.current?.focus();
			return;
		}
		const name = fields.name.trim();
		const email = registered ? '' : fields.email.trim();
		const payload = (submission.current ??= {
			submission_id: feedbackSubmissionId(),
			message,
			url: location.origin,
			...(name ? { name } : {}),
			...(email ? { email } : {}),
		});
		sending.current = true;
		setStatus('sending');
		let result = await deliver(payload, registered, token);
		if (result.kind === 'retry' && result.afterMs <= 3_000) {
			const delay = result.afterMs;
			await new Promise((resolve) => setTimeout(resolve, delay));
			result = await deliver(payload, registered, token);
		}
		sending.current = false;
		if (result.kind === 'retry') {
			setStatus('waiting');
			retryTimer.current = window.setTimeout(
				() => setStatus('retry'),
				Math.min(result.afterMs, 2_147_483_647),
			);
		} else {
			setStatus(result.kind);
			if (result.kind === 'accepted') {
				submission.current = undefined;
				setFields(blank);
			}
		}
	}
	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<DialogContent
				id="feedback-dialog"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					title.current?.focus();
				}}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					onCloseFocus();
				}}
			>
				<form id="feedback-form" onSubmit={send}>
					<DialogTitle ref={title} tabIndex={-1}>
						Send feedback
					</DialogTitle>
					<DialogDescription>
						Your feedback goes to the Socratink team through Modem.
						{registered && ' Your account email goes with your message.'}
					</DialogDescription>
					<Label>
						Message
						<Textarea
							ref={messageField}
							name="message"
							rows={5}
							required
							value={fields.message}
							readOnly={status === 'sending'}
							onChange={(event) => edit('message', event.target.value)}
						/>
					</Label>
					<Label>
						Name (optional)
						<Input
							name="name"
							autoComplete="name"
							maxLength={256}
							value={fields.name}
							readOnly={status === 'sending'}
							onChange={(event) => edit('name', event.target.value)}
						/>
					</Label>
					{!registered && (
						<Label>
							Email (optional)
							<Input
								name="email"
								type="email"
								autoComplete="email"
								maxLength={320}
								value={fields.email}
								readOnly={status === 'sending'}
								onChange={(event) => edit('email', event.target.value)}
							/>
						</Label>
					)}
					<p id="feedback-status" role="status">
						{statusCopy[status]}
					</p>
					<div className="feedback-actions">
						<Button id="feedback-close" type="button" variant="outline" onClick={onClose}>
							Close
						</Button>
						<Button
							id="feedback-send"
							type="submit"
							disabled={status === 'sending' || status === 'waiting' || status === 'rejected'}
						>
							{status === 'waiting' || status === 'retry' ? 'Retry' : 'Send feedback'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

async function deliver(payload: Payload, registered: boolean, token: string): Promise<Delivery> {
	try {
		const response = await fetch(registered ? feedback.route : feedback.ingest, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(!registered ? { Authorization: `Bearer ${token}` } : {}),
			},
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

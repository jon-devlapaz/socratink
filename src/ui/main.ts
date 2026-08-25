import { mountOrganicSphere } from './organic-sphere.ts';
import './styles.css';

type EncounterState =
	| 'baseline_open'
	| 'baseline_submitted'
	| 'stopped_invalid_or_ambiguous'
	| 'baseline_complete_no_intervention'
	| 'intervention_eligible'
	| 'post_open'
	| 'post_submitted'
	| 'stopped_invalid'
	| 'verification_pending';

interface LearnerView {
	readonly encounterId: string;
	readonly state: EncounterState;
	readonly revision: number;
	readonly retentionExpiresAt: string;
	readonly currentPrompt: null | {
		readonly scenarioId: string;
		readonly prompt: string;
		readonly policy: readonly string[];
		readonly facts: readonly string[];
		readonly openedAt: string;
	};
	readonly feedback: string | null;
	readonly receipt: {
		readonly demonstrated: readonly string[];
		readonly helpUsed: readonly string[];
		readonly uncertain: readonly string[];
		readonly checkLater: readonly string[];
	};
}

interface StoredCapability {
	readonly encounterId: string;
	readonly capabilityToken: string;
}

interface ExpiredPurgeMetadata {
	readonly encounterId: string;
	readonly revision: number;
	readonly retentionExpiresAt: string;
}

class R1HttpError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly purge?: ExpiredPurgeMetadata,
	) {
		super(message);
	}
}

const R1_STORAGE_KEY = 'socratink-r1-local-capability';
const isR1Mode = new URLSearchParams(window.location.search).get('r1') === '1';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

function appendList(parent: HTMLElement, values: readonly string[], emptyText?: string): void {
	const list = element('ul');
	const displayed = values.length > 0 ? values : emptyText ? [emptyText] : [];
	for (const value of displayed) list.append(element('li', undefined, value));
	parent.append(list);
}

async function startChat(): Promise<void> {
	const { createFlueClient } = await import('@flue/sdk');
	const form = document.querySelector<HTMLFormElement>('#chat')!;
	const input = document.querySelector<HTMLTextAreaElement>('#message')!;
	const messages = document.querySelector<HTMLOListElement>('#messages')!;
	const button = form.querySelector<HTMLButtonElement>('button')!;
	const core = document.querySelector<HTMLElement>('.alive-core')!;
	const card = document.querySelector<HTMLElement>('.thought-card')!;
	mountOrganicSphere(core);
	const storageKey = 'vanilla-flue-chat-conversation-id';
	const conversationId = localStorage.getItem(storageKey) ?? crypto.randomUUID();
	localStorage.setItem(storageKey, conversationId);
	const conversation = createFlueClient({ url: `/api/agents/chat/${encodeURIComponent(conversationId)}` });

	function addMessage(role: string, text: string): void {
		const item = element('li', role.toLowerCase());
		item.append(element('span', undefined, role), element('p', undefined, text));
		messages.append(item);
		card.classList.add('has-messages');
		messages.scrollTop = messages.scrollHeight;
	}

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			form.requestSubmit();
		}
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const text = input.value.trim();
		if (!text) return;
		document.body.classList.add('encounter-active');
		addMessage('You', text);
		input.value = '';
		button.disabled = true;
		core.classList.add('is-working');
		try {
			const admission = await conversation.send({ message: { kind: 'user', body: text } });
			const reply = await conversation.read(admission);
			addMessage('Assistant', reply.text);
		} catch (error) {
			addMessage('Error', error instanceof Error ? error.message : 'Unable to get a reply.');
		} finally {
			button.disabled = false;
			core.classList.remove('is-working');
			input.focus();
		}
	});
}

function readStoredCapability(): StoredCapability | null {
	try {
		const parsed = JSON.parse(localStorage.getItem(R1_STORAGE_KEY) ?? 'null') as Partial<StoredCapability> | null;
		return parsed && typeof parsed.encounterId === 'string' && typeof parsed.capabilityToken === 'string'
			? { encounterId: parsed.encounterId, capabilityToken: parsed.capabilityToken }
			: null;
	} catch {
		localStorage.removeItem(R1_STORAGE_KEY);
		return null;
	}
}

function startR1(): void {
	document.body.classList.add('r1-mode');
	document.querySelector<HTMLElement>('#chat-surface')!.hidden = true;
	document.querySelector<HTMLElement>('#r1-surface')!.hidden = false;
	const root = document.querySelector<HTMLElement>('#r1-app')!;
	const status = document.querySelector<HTMLElement>('#r1-status')!;
	const core = document.querySelector<HTMLElement>('.r1-core')!;
	mountOrganicSphere(core);

	let capability = readStoredCapability();
	let view: LearnerView | null = null;
	let expiredPurge: ExpiredPurgeMetadata | null = null;
	let busy = false;
	const requestIds: Partial<Record<'baseline' | 'post' | 'intervention' | 'purge', string>> = {};
	let pasteEventCount = 0;
	let pastedCharacterCount = 0;

	function setStatus(message: string, kind: 'plain' | 'error' = 'plain'): void {
		status.textContent = message;
		status.classList.toggle('is-error', kind === 'error');
	}

	function clearCapability(): void {
		capability = null;
		view = null;
		expiredPurge = null;
		localStorage.removeItem(R1_STORAGE_KEY);
	}

	function renderReady(): void {
		busy = false;
		render();
	}

	async function request(path: string, init: RequestInit = {}): Promise<unknown> {
		const headers = new Headers(init.headers);
		headers.set('content-type', 'application/json');
		if (capability) headers.set('authorization', `Bearer ${capability.capabilityToken}`);
		const response = await fetch(`/api/r1${path}`, { ...init, headers, cache: 'no-store' });
		let body: unknown = null;
		try { body = await response.json(); } catch { /* A bounded fallback is shown below. */ }
		if (!response.ok) {
			const message = typeof body === 'object' && body && 'error' in body
				? (body as { error?: { message?: string } }).error?.message
				: undefined;
			const purge = typeof body === 'object' && body && 'purge' in body ? (body as { purge?: ExpiredPurgeMetadata }).purge : undefined;
			throw new R1HttpError(message ?? 'The local R1 request could not be completed.', response.status, purge);
		}
		return body;
	}

	function button(label: string, action: () => Promise<void>, className = 'r1-button'): HTMLButtonElement {
		const control = element('button', className, label);
		control.type = 'button';
		control.disabled = busy;
		control.addEventListener('click', () => {
			control.disabled = true;
			void action().finally(() => {
				if (control.isConnected) control.disabled = busy;
			});
		});
		return control;
	}

	function conditionsFieldset(kind: 'baseline' | 'post'): HTMLFieldSetElement {
		const fieldset = element('fieldset', 'conditions');
		fieldset.append(element('legend', undefined, 'Conditions you declare'));
		const sourceLabel = element('label', 'check-row');
		const sourceClosed = element('input');
		sourceClosed.type = 'checkbox';
		sourceClosed.name = 'sourceClosed';
		sourceLabel.append(sourceClosed, document.createTextNode(' I did not open course material, source material, or a prior response.'));

		const assistanceLabel = element('label');
		assistanceLabel.append(document.createTextNode('Assistance used'));
		const assistance = element('select');
		assistance.name = 'assistance';
		assistance.required = true;
		const options: readonly (readonly [string, string])[] = kind === 'baseline'
			? [['none', 'None'], ['substantive_ai_help', 'Substantive AI help'], ['other', 'Other help']]
			: [['fixed_feedback_only', 'Only the fixed feedback above'], ['substantive_ai_help', 'Fixed feedback plus substantive AI help'], ['other', 'Fixed feedback plus other help'], ['none', 'No assistance declared']];
		const blankOption = element('option', undefined, 'Choose…');
		blankOption.value = '';
		blankOption.disabled = true;
		blankOption.selected = true;
		assistance.append(blankOption);
		for (const [value, label] of options) {
			const option = element('option', undefined, label);
			option.value = value;
			assistance.append(option);
		}
		assistanceLabel.append(assistance);

		const assistanceDeclaration = element('label');
		assistanceDeclaration.append(document.createTextNode('Assistance declaration'));
		const assistanceText = element('input');
		assistanceText.name = 'assistanceDeclaration';
		assistanceText.required = true;
		assistanceText.placeholder = kind === 'baseline' ? 'State what help you used or that you used none' : 'State whether the fixed feedback was your only help';
		assistanceDeclaration.append(assistanceText);

		const sourceDeclaration = element('label');
		sourceDeclaration.append(document.createTextNode('Source-access declaration'));
		const sourceText = element('input');
		sourceText.name = 'sourceAccessDeclaration';
		sourceText.required = true;
		sourceText.placeholder = 'State what source material you accessed or that you accessed none';
		sourceDeclaration.append(sourceText);
		fieldset.append(sourceLabel, assistanceLabel, assistanceDeclaration, sourceDeclaration);
		return fieldset;
	}

	function receiptSection(receipt: LearnerView['receipt']): HTMLElement {
		const section = element('section', 'receipt');
		section.setAttribute('aria-labelledby', 'receipt-title');
		const title = element('h2', undefined, 'Evidence receipt');
		title.id = 'receipt-title';
		section.append(title);
		const entries: [string, readonly string[], string][] = [
			['What you demonstrated', receipt.demonstrated, 'No supported demonstration is recorded.'],
			['Help you used', receipt.helpUsed, 'No help record is available.'],
			['What remains uncertain', receipt.uncertain, 'No uncertainty statement is available.'],
			['What to check later', receipt.checkLater, 'No delayed check is currently scheduled.'],
		];
		for (const [heading, values, empty] of entries) {
			const block = element('section', 'receipt-part');
			block.append(element('h3', undefined, heading));
			appendList(block, values, empty);
			section.append(block);
		}
		return section;
	}

	function scenarioSection(current: NonNullable<LearnerView['currentPrompt']>): HTMLElement {
		const section = element('section', 'scenario');
		section.append(element('p', 'eyebrow', `Scenario: ${current.scenarioId}`), element('h2', undefined, 'Policy'));
		appendList(section, current.policy);
		section.append(element('h2', undefined, 'Request and resource facts'));
		appendList(section, current.facts);
		section.append(element('h2', undefined, 'Prompt'), element('p', 'prompt-copy', current.prompt));
		return section;
	}

	function waiting(message: string): HTMLElement {
		const section = element('section', 'waiting-panel');
		section.append(element('h2', undefined, 'Waiting for separate human review'), element('p', undefined, message));
		section.append(button('Refresh review state', refresh));
		return section;
	}

	function submissionForm(kind: 'baseline' | 'post', current: NonNullable<LearnerView['currentPrompt']>): HTMLFormElement {
		const form = element('form', 'r1-form');
		form.append(scenarioSection(current));
		const responseLabel = element('label');
		responseLabel.htmlFor = `${kind}-response`;
		responseLabel.textContent = 'Your exact response';
		const response = element('textarea');
		response.id = `${kind}-response`;
		response.name = 'response';
		response.rows = 9;
		response.required = true;
		response.addEventListener('paste', (event) => {
			pasteEventCount += 1;
			pastedCharacterCount += event.clipboardData?.getData('text').length ?? 0;
		});
		const note = element('p', 'field-note', 'Your text is sent exactly as typed, including surrounding whitespace. Elapsed time is measured from the server-recorded prompt opening and capped at 24 hours. Paste counts cover only this browser page session. These observations are not proof of authorship.');
		const conditions = conditionsFieldset(kind);
		const submit = element('button', 'r1-button', kind === 'baseline' ? 'Submit baseline response' : 'Submit fresh response');
		submit.type = 'submit';
		submit.disabled = busy;
		form.append(responseLabel, response, note, conditions, submit);
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			const data = new FormData(form);
			const command = {
				type: kind === 'baseline' ? 'submit_baseline' : 'submit_post',
				requestId: requestIds[kind] ?? crypto.randomUUID(),
				expectedRevision: view!.revision,
				response: response.value,
				conditions: {
					sourceClosed: data.get('sourceClosed') === 'on',
					assistance: String(data.get('assistance')),
					assistanceDeclaration: String(data.get('assistanceDeclaration')),
					sourceAccessDeclaration: String(data.get('sourceAccessDeclaration')),
					observationScope: 'current_page_session',
					elapsedMs: Math.min(Math.max(Date.now() - Date.parse(current.openedAt), 0), 86_400_000),
					pasteEventCount,
					pastedCharacterCount,
				},
			};
			requestIds[kind] = command.requestId;
			busy = true;
			submit.disabled = true;
			core.classList.add('is-working');
			setStatus('Saving your exact response…');
			try {
				const body = await request(`/encounters/${encodeURIComponent(capability!.encounterId)}/commands`, { method: 'POST', body: JSON.stringify(command) }) as { encounter: LearnerView };
				view = body.encounter;
				delete requestIds[kind];
				pasteEventCount = 0;
				pastedCharacterCount = 0;
				setStatus('Response saved.');
				renderReady();
			} catch (error) {
				const missing = error instanceof R1HttpError && error.status === 404;
				setStatus(`${error instanceof Error ? error.message : 'Unable to save the response.'} Your exact text and declarations remain here; retry uses the same request ID.${missing ? ' The saved encounter was not found, so reload this page before deciding whether to start again.' : ''}`, 'error');
			} finally {
				busy = false;
				submit.disabled = false;
				core.classList.remove('is-working');
			}
		});
		return form;
	}

	async function refresh(): Promise<void> {
		if (!capability || busy) return;
		busy = true;
		setStatus('Refreshing the saved state…');
		try {
			const body = await request(`/encounters/${encodeURIComponent(capability.encounterId)}`) as { encounter: LearnerView };
			view = body.encounter;
			setStatus('Saved state refreshed.');
			renderReady();
		} catch (error) {
			setStatus(error instanceof Error ? error.message : 'Unable to refresh the saved state.', 'error');
			if (error instanceof R1HttpError && error.status === 404) {
				clearCapability();
				renderReady();
			} else if (error instanceof R1HttpError && error.status === 403) {
				clearCapability();
				setStatus('The saved local capability was denied and has been cleared. Start a new encounter only if you intend to.', 'error');
				renderReady();
			} else if (error instanceof R1HttpError && error.status === 410 && error.purge) {
				view = null;
				expiredPurge = error.purge;
				renderReady();
			}
		} finally {
			busy = false;
		}
	}

	async function createEncounter(): Promise<void> {
		if (busy) return;
		busy = true;
		core.classList.add('is-working');
		setStatus('Creating a local encounter…');
		render();
		try {
			const body = await request('/encounters', { method: 'POST', body: '{}' }) as { capabilityToken: string; encounter: LearnerView };
			capability = { encounterId: body.encounter.encounterId, capabilityToken: body.capabilityToken };
			localStorage.setItem(R1_STORAGE_KEY, JSON.stringify(capability));
			view = body.encounter;
			expiredPurge = null;
			setStatus('Local encounter created.');
		} catch (error) {
			setStatus(error instanceof Error ? error.message : 'Unable to create the local encounter.', 'error');
		} finally {
			busy = false;
			core.classList.remove('is-working');
			render();
		}
	}

	async function revealFeedback(): Promise<void> {
		if (!capability || !view || busy) return;
		busy = true;
		requestIds.intervention ??= crypto.randomUUID();
		setStatus('Persisting the fixed feedback before showing it…');
		try {
			const body = await request(`/encounters/${encodeURIComponent(capability.encounterId)}/commands`, {
				method: 'POST',
				body: JSON.stringify({ type: 'persist_intervention', requestId: requestIds.intervention, expectedRevision: view.revision }),
			}) as { encounter: LearnerView };
			view = body.encounter;
			delete requestIds.intervention;
			setStatus('Fixed feedback saved and shown.');
			renderReady();
		} catch (error) {
			setStatus(error instanceof Error ? error.message : 'Unable to show the fixed feedback.', 'error');
			if (error instanceof R1HttpError && error.status === 404) {
				clearCapability();
				renderReady();
			} else if (error instanceof R1HttpError && error.status === 410 && error.purge) {
				view = null;
				expiredPurge = error.purge;
				renderReady();
			}
		} finally {
			busy = false;
		}
	}

	async function purge(): Promise<void> {
		if (!capability || (!view && !expiredPurge) || busy || !window.confirm('Purge this local R1 record now? This cannot be undone.')) return;
		busy = true;
		requestIds.purge ??= crypto.randomUUID();
		setStatus('Purging the local record…');
		try {
			const revision = view?.revision ?? expiredPurge!.revision;
			await request(`/encounters/${encodeURIComponent(capability.encounterId)}`, {
				method: 'DELETE',
				body: JSON.stringify({ requestId: requestIds.purge, expectedRevision: revision }),
			});
			clearCapability();
			delete requestIds.purge;
			setStatus('Local record purged.');
			renderReady();
		} catch (error) {
			setStatus(error instanceof Error ? error.message : 'Unable to purge the local record.', 'error');
			if (error instanceof R1HttpError && error.status === 404) {
				clearCapability();
				renderReady();
			}
		} finally {
			busy = false;
		}
	}

	function renderStart(): void {
		const section = element('section', 'conditions-panel');
		section.append(element('h2', undefined, 'Before you start'));
		appendList(section, [
			'Use this page source-closed and without substantive assistance for the baseline.',
			'Your exact response, declarations, elapsed time, and paste counts remain usable in one local record for seven days. Expiry does not delete the file; use Purge local record to remove it.',
			'A separate human reviewer is required. The page does not ask a model to judge or write your answer.',
			'The browser keeps only the encounter ID and a bearer capability so this device can resume. Anyone with that capability can access this local record.',
			'The record stays on this local Socratink server and is not sent to Flue conversations or Braintrust by this R1 page.',
		]);
		section.append(element('p', 'privacy-warning', 'Privacy warning: do not include secrets, personal data, or anything you do not want stored locally in the response.'));
		section.append(button('Start local encounter', createEncounter));
		root.append(section);
	}

	function render(): void {
		root.replaceChildren();
		if (capability && expiredPurge) {
			const expired = element('section', 'waiting-panel');
			expired.append(
				element('h2', undefined, 'Local record expired'),
				element('p', undefined, `This record expired at ${new Date(expiredPurge.retentionExpiresAt).toLocaleString()}. Its response and review details are no longer readable. Expiry did not delete the file.`),
				button('Purge expired local record', purge, 'r1-button secondary danger'),
			);
			root.append(expired);
			return;
		}
		if (!capability || !view) {
			renderStart();
			return;
		}

		const meta = element('div', 'encounter-meta');
		meta.append(
			element('span', undefined, `Encounter ID: ${view.encounterId}`),
			element('span', undefined, `State: ${view.state.replaceAll('_', ' ')}`),
			element('span', undefined, `Local retention ends: ${new Date(view.retentionExpiresAt).toLocaleString()}`),
		);
		root.append(meta);

		if (view.state === 'baseline_open' && view.currentPrompt) root.append(submissionForm('baseline', view.currentPrompt));
		if (view.state === 'baseline_open' && !view.currentPrompt) {
			const integrity = element('section', 'waiting-panel');
			integrity.append(element('h2', undefined, 'Prompt record unavailable'), element('p', undefined, 'The baseline is blocked because its persisted prompt record could not be verified. Refresh the saved state or purge this local record.'));
			integrity.append(button('Refresh saved state', refresh));
			root.append(integrity);
		}
		if (view.state === 'baseline_submitted') root.append(waiting('Your baseline is saved verbatim. The fixed rubric must now be applied by a different human. This page will not evaluate it.'));
		if (view.state === 'intervention_eligible') {
			const section = element('section', 'feedback-offer');
			section.append(element('h2', undefined, 'Fixed feedback is available'), element('p', undefined, 'The separate human review found a clear rubric gap. You can persist and show the frozen feedback, then answer one fresh inverse scenario.'));
			section.append(button('Show fixed feedback', revealFeedback));
			root.append(section, receiptSection(view.receipt));
		}
		if (view.state === 'post_open' && view.currentPrompt && view.feedback?.trim()) {
			const feedback = element('section', 'fixed-feedback');
			feedback.append(element('p', 'eyebrow', 'Persisted fixed feedback'), element('h2', undefined, 'Read before the fresh scenario'), element('p', undefined, view.feedback));
			root.append(feedback, submissionForm('post', view.currentPrompt));
		}
		if (view.state === 'post_open' && (!view.currentPrompt || !view.feedback?.trim())) {
			const integrity = element('section', 'waiting-panel');
			integrity.append(element('h2', undefined, 'Feedback record unavailable'), element('p', undefined, 'The fresh scenario is blocked because the persisted fixed feedback could not be verified. Refresh the saved state or purge this local record.'));
			integrity.append(button('Refresh saved state', refresh));
			root.append(integrity);
		}
		if (view.state === 'post_submitted') root.append(waiting('Your fresh response is saved verbatim. The same separate human reviewer must now apply the fixed rubric.'));
		if (['stopped_invalid_or_ambiguous', 'baseline_complete_no_intervention', 'stopped_invalid', 'verification_pending'].includes(view.state)) root.append(receiptSection(view.receipt));

		const controls = element('div', 'record-controls');
		controls.append(button('Purge local record', purge, 'r1-button secondary danger'));
		root.append(controls);
	}

	if (capability) void refresh();
	else render();
}

if (isR1Mode) startR1();
else void startChat();

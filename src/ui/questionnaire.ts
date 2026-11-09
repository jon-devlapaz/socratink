import type { QuestionnaireAnswer, QuestionnaireDefinition, QuestionnaireItem } from '../questionnaire.ts';

function createButton(label: string, className: string): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.textContent = label;
	return button;
}

function collectAnswer(form: HTMLFormElement, item: QuestionnaireItem): QuestionnaireAnswer {
	const values = [...form.querySelectorAll<HTMLInputElement>(`input[data-choice-for="${item.name}"]:checked`)]
		.map((input) => input.value);
	const freeform = form.querySelector<HTMLInputElement>(`input[data-freeform-for="${item.name}"]`)
		?.value.trim();
	const section = form.querySelector<HTMLElement>(`[data-item="${item.name}"]`);
	return {
		name: item.name,
		values,
		...(freeform ? { freeform } : {}),
		...(section?.dataset.skipped === 'true' ? { skipped: true } : {}),
	};
}

function hasAnswer(answer: QuestionnaireAnswer): boolean {
	return answer.values.length > 0 || Boolean(answer.freeform);
}

export function createQuestionnaire(
	definition: QuestionnaireDefinition,
	onSubmit: (answers: QuestionnaireAnswer[]) => void,
): HTMLFormElement {
	const form = document.createElement('form');
	form.className = 'questionnaire';
	form.setAttribute('aria-label', definition.kind === 'quiz' ? 'Quiz' : 'Questions');
	// Validated live and restored definitions contain exactly one item.
	const item = definition.items[0]!;
	const section = createQuestionItem(item);

	const progressRow = document.createElement('div');
	progressRow.className = 'questionnaire-progress-row';
	const progressText = document.createElement('span');
	progressText.textContent = 'Question 1 of 1';
	const progress = document.createElement('progress');
	progress.max = 1;
	progress.value = 1;
	progress.setAttribute('aria-label', 'Question 1 of 1');
	progressRow.append(progressText, progress);
	form.append(progressRow, section);

	const actions = document.createElement('div');
	actions.className = 'questionnaire-actions';
	const skip = createButton('Skip', 'questionnaire-button questionnaire-button-ghost');
	skip.hidden = item.required !== false;
	const submit = createButton(definition.submitLabel, 'questionnaire-button questionnaire-button-primary');
	actions.append(skip, submit);
	form.append(actions);

	skip.addEventListener('click', () => {
		if (item.required) return;
		section.dataset.skipped = 'true';
		section.focus({ preventScroll: true });
	});
	const clearSkipped = () => { section.dataset.skipped = 'false'; };
	form.addEventListener('input', clearSkipped);
	form.addEventListener('change', clearSkipped);
	submit.addEventListener('click', () => form.requestSubmit());
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const answer = collectAnswer(form, item);
		const error = section.querySelector<HTMLElement>('.questionnaire-error');
		if (item.required && !hasAnswer(answer)) {
			section.setAttribute('aria-invalid', 'true');
			if (error) error.textContent = 'Choose or enter an answer to continue.';
			section.querySelector<HTMLElement>('input')?.focus();
			return;
		}
		section.removeAttribute('aria-invalid');
		if (error) error.textContent = '';
		onSubmit([answer]);
	});
	form.addEventListener('keydown', (event) => {
		if (event.target instanceof HTMLInputElement && event.target.type === 'text') return;
		const shortcutChoice = item.choices.find(
			(choice) => choice.shortcut?.toLowerCase() === event.key.toLowerCase(),
		);
		if (!shortcutChoice) return;
		const input = form.querySelector<HTMLInputElement>(
			`input[data-choice-for="${item.name}"][value="${CSS.escape(shortcutChoice.value)}"]`,
		);
		if (!input) return;
		event.preventDefault();
		input.click();
	});

	section.focus({ preventScroll: true });
	return form;
}

function createQuestionItem(item: QuestionnaireItem): HTMLFieldSetElement {
	const fieldset = document.createElement('fieldset');
	fieldset.className = 'questionnaire-item';
	fieldset.dataset.item = item.name;
	fieldset.tabIndex = -1;
	const descriptionId = `questionnaire-${item.name}-description`;
	const errorId = `questionnaire-${item.name}-error`;
	fieldset.setAttribute('aria-describedby', `${descriptionId} ${errorId}`);

	const legend = document.createElement('legend');
	legend.textContent = item.prompt;
	fieldset.append(legend);
	if (item.description) {
		const description = document.createElement('p');
		description.id = descriptionId;
		description.className = 'questionnaire-description';
		description.textContent = item.description;
		fieldset.append(description);
	} else {
		fieldset.setAttribute('aria-describedby', errorId);
	}

	const choices = document.createElement('div');
	choices.className = 'questionnaire-choices';
	for (const choice of item.choices) {
		const label = document.createElement('label');
		label.className = 'questionnaire-choice';
		const input = document.createElement('input');
		input.type = item.multiple ? 'checkbox' : 'radio';
		input.name = item.name;
		input.value = choice.value;
		input.dataset.choiceFor = item.name;
		const copy = document.createElement('span');
		copy.className = 'questionnaire-choice-copy';
		const title = document.createElement('span');
		title.className = 'questionnaire-choice-label';
		title.textContent = choice.label;
		copy.append(title);
		if (choice.description) {
			const description = document.createElement('span');
			description.className = 'questionnaire-choice-description';
			description.textContent = choice.description;
			copy.append(description);
		}
		label.append(input, copy);
		if (choice.shortcut) {
			const shortcut = document.createElement('kbd');
			shortcut.textContent = choice.shortcut.toUpperCase();
			label.append(shortcut);
		}
		choices.append(label);
	}

	if (item.input) {
		const inputLabel = document.createElement('label');
		inputLabel.className = 'questionnaire-freeform-label';
		const labelText = document.createElement('span');
		labelText.textContent = item.input.label;
		const input = document.createElement('input');
		input.type = 'text';
		input.name = `${item.name}__freeform`;
		input.dataset.freeformFor = item.name;
		if (item.input.placeholder) input.placeholder = item.input.placeholder;
		inputLabel.append(labelText, input);
		choices.append(inputLabel);
	}
	fieldset.append(choices);

	const error = document.createElement('p');
	error.id = errorId;
	error.className = 'questionnaire-error';
	error.setAttribute('aria-live', 'polite');
	fieldset.append(error);
	return fieldset;
}

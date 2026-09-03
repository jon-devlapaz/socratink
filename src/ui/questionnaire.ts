import {
	parseQuestionnaireDefinition,
	type QuestionnaireDefinition,
	type QuestionnaireItem,
} from '../questionnaire.ts';

export type QuestionnaireAnswer = {
	name: string;
	values: string[];
	freeform?: string;
	skipped?: boolean;
};

export function questionnaireFromReplyData(
	data: Record<string, unknown[]> | undefined,
): QuestionnaireDefinition | undefined {
	const writes = data?.questionnaire;
	return writes?.length ? parseQuestionnaireDefinition(writes.at(-1)) : undefined;
}

export function questionnaireFromParts(
	parts: readonly { type: string; data?: unknown }[],
): QuestionnaireDefinition | undefined {
	const part = parts.findLast((candidate) => candidate.type === 'data-questionnaire');
	return part ? parseQuestionnaireDefinition(part.data) : undefined;
}

export const questionnaireAnswerPrefix = 'Questionnaire answers:';
export const questionnaireToolName = 'present_question';

export function isQuestionnaireTool(name: string): boolean {
	return name === questionnaireToolName;
}

export function formatQuestionnaireAnswers(
	definition: QuestionnaireDefinition,
	answers: QuestionnaireAnswer[],
): string {
	const byName = new Map(answers.map((answer) => [answer.name, answer]));
	const lines = definition.items.map((item) => {
		const answer = byName.get(item.name);
		if (!answer || answer.skipped) return `- ${item.prompt}: Skipped.`;
		const labels = answer.values.map(
			(value) => item.choices.find((choice) => choice.value === value)?.label ?? value,
		);
		if (answer.freeform) labels.push(answer.freeform);
		return `- ${item.prompt}: ${labels.join(', ')}`;
	});
	return `${questionnaireAnswerPrefix}\n${lines.join('\n')}`;
}

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

	const progressRow = document.createElement('div');
	progressRow.className = 'questionnaire-progress-row';
	const progressText = document.createElement('span');
	const progress = document.createElement('progress');
	progress.max = definition.items.length;
	progressRow.append(progressText, progress);
	form.append(progressRow);

	const sections = definition.items.map((item, itemIndex) => {
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
		fieldset.hidden = itemIndex !== 0;
		form.append(fieldset);
		return fieldset;
	});

	const actions = document.createElement('div');
	actions.className = 'questionnaire-actions';
	const previous = createButton('Previous', 'questionnaire-button questionnaire-button-secondary');
	const skip = createButton('Skip', 'questionnaire-button questionnaire-button-ghost');
	const next = createButton('Next', 'questionnaire-button questionnaire-button-primary');
	const submit = createButton(definition.submitLabel, 'questionnaire-button questionnaire-button-primary');
	actions.append(previous, skip, next, submit);
	form.append(actions);

	let activeIndex = 0;
	function show(index: number) {
		activeIndex = index;
		sections.forEach((section, sectionIndex) => {
			section.hidden = sectionIndex !== activeIndex;
		});
		progress.value = activeIndex + 1;
		progress.setAttribute('aria-label', `Question ${activeIndex + 1} of ${definition.items.length}`);
		progressText.textContent = `Question ${activeIndex + 1} of ${definition.items.length}`;
		previous.hidden = activeIndex === 0;
		skip.hidden = definition.items[activeIndex]?.required !== false;
		next.hidden = activeIndex === definition.items.length - 1;
		submit.hidden = activeIndex !== definition.items.length - 1;
		sections[activeIndex]?.focus({ preventScroll: true });
	}

	function validateCurrent(): boolean {
		const item = definition.items[activeIndex];
		const section = sections[activeIndex];
		if (!item || !section) return false;
		const answer = collectAnswer(form, item);
		const error = section.querySelector<HTMLElement>('.questionnaire-error');
		if (item.required && !hasAnswer(answer)) {
			section.setAttribute('aria-invalid', 'true');
			if (error) error.textContent = 'Choose or enter an answer to continue.';
			section.querySelector<HTMLElement>('input')?.focus();
			return false;
		}
		section.removeAttribute('aria-invalid');
		if (error) error.textContent = '';
		return true;
	}

	previous.addEventListener('click', () => show(Math.max(0, activeIndex - 1)));
	next.addEventListener('click', () => {
		if (validateCurrent()) show(Math.min(definition.items.length - 1, activeIndex + 1));
	});
	skip.addEventListener('click', () => {
		const item = definition.items[activeIndex];
		const section = sections[activeIndex];
		if (!item || item.required) return;
		if (section) section.dataset.skipped = 'true';
		show(Math.min(definition.items.length - 1, activeIndex + 1));
	});
	form.addEventListener('input', () => {
		const section = sections[activeIndex];
		if (section) section.dataset.skipped = 'false';
	});
	form.addEventListener('change', () => {
		const section = sections[activeIndex];
		if (section) section.dataset.skipped = 'false';
	});
	submit.addEventListener('click', () => form.requestSubmit());
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		if (!validateCurrent()) return;
		onSubmit(definition.items.map((item) => collectAnswer(form, item)));
	});
	form.addEventListener('keydown', (event) => {
		if (event.target instanceof HTMLInputElement && event.target.type === 'text') return;
		const item = definition.items[activeIndex];
		const shortcutChoice = item?.choices.find(
			(choice) => choice.shortcut?.toLowerCase() === event.key.toLowerCase(),
		);
		if (!item || !shortcutChoice) return;
		const input = form.querySelector<HTMLInputElement>(
			`input[data-choice-for="${item.name}"][value="${CSS.escape(shortcutChoice.value)}"]`,
		);
		if (!input) return;
		event.preventDefault();
		input.click();
	});

	show(0);
	return form;
}

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { QuestionnaireAnswer, QuestionnaireDefinition } from '../questionnaire.ts';

type QuestionnaireProps = {
	definition: QuestionnaireDefinition;
	onSubmit: (answers: QuestionnaireAnswer[]) => void;
};

export function Questionnaire({ definition, onSubmit }: QuestionnaireProps) {
	const id = useId();
	const section = useRef<HTMLFieldSetElement>(null);
	const [invalid, setInvalid] = useState(false);
	const [skipped, setSkipped] = useState(false);
	const item = definition.items[0]!;
	const consent = definition.kind === 'reveal-consent';
	useEffect(() => { section.current?.focus({ preventScroll: true }); }, []);

	function markEdited() {
		setInvalid(false);
		setSkipped(false);
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (consent) return;
		const data = new FormData(event.currentTarget);
		const values = data.getAll(item.name).filter((value): value is string => typeof value === 'string');
		const reason = data.get(`${item.name}__freeform`);
		const freeform = typeof reason === 'string' ? reason.trim() : '';
		if (item.required && values.length === 0 && !freeform) {
			setInvalid(true);
			section.current?.querySelector<HTMLElement>('[data-choice-for], input[type="text"]')?.focus();
			return;
		}
		onSubmit([{ name: item.name, values, ...(freeform && { freeform }), ...(skipped && { skipped }) }]);
	}

	function shortcut(event: KeyboardEvent<HTMLFormElement>) {
		if (consent || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
		if (event.target instanceof HTMLInputElement && event.target.type === 'text') return;
		const index = item.choices.findIndex(choice => choice.shortcut?.toLowerCase() === event.key.toLowerCase());
		if (index < 0) return;
		event.preventDefault();
		document.getElementById(`${id}-choice-${index}`)?.click();
	}

	const choices = item.choices.map((choice, index) => {
		if (consent) return (
			<Button key={choice.value} type="button" className="questionnaire-button"
				variant={index === item.choices.length - 1 ? 'default' : 'secondary'}
				onClick={() => onSubmit([{ name: item.name, values: [choice.value] }])}>
				{choice.label}
			</Button>
		);
		const choiceId = `${id}-choice-${index}`;
		const choiceProps = { id: choiceId, value: choice.value, 'data-choice-for': item.name };
		return (
			<Label className="questionnaire-choice" key={choice.value} htmlFor={choiceId}>
				{item.multiple
					? <Checkbox {...choiceProps} name={item.name} onCheckedChange={markEdited} />
					: <RadioGroupItem {...choiceProps} />}
				<span className="questionnaire-choice-copy">
					<span className="questionnaire-choice-label">{choice.label}</span>
					{choice.description && <span className="questionnaire-choice-description">{choice.description}</span>}
				</span>
				{choice.shortcut && <Kbd>{choice.shortcut.toUpperCase()}</Kbd>}
			</Label>
		);
	});

	return (
		<form className="questionnaire" aria-label={definition.kind === 'quiz' ? 'Quiz' : 'Questions'}
			onSubmit={submit} onKeyDown={shortcut}>
			<fieldset ref={section} className="questionnaire-item" data-item={item.name} data-skipped={skipped}
				tabIndex={-1} aria-invalid={invalid || undefined}
				aria-describedby={[item.description && `${id}-description`, `${id}-error`].filter(Boolean).join(' ')}>
				<legend id={`${id}-prompt`}>{item.prompt}</legend>
				{item.description && <p id={`${id}-description`} className="questionnaire-description">{item.description}</p>}
				{choices.length > 0 && (consent || item.multiple
					? <div className="questionnaire-choices">{choices}</div>
					: <RadioGroup name={item.name} className="questionnaire-choices" aria-labelledby={`${id}-prompt`}
						onValueChange={markEdited}>{choices}</RadioGroup>)}
				{item.input && (
					<div className="questionnaire-freeform-label">
						<Label htmlFor={`${id}-freeform`}>{item.input.label}</Label>
						<Input id={`${id}-freeform`} type="text" name={`${item.name}__freeform`} data-freeform-for={item.name}
							placeholder={item.input.placeholder} onChange={markEdited} />
					</div>
				)}
				<p id={`${id}-error`} className="questionnaire-error" aria-live="polite">
					{invalid && 'Choose or enter an answer to continue.'}
				</p>
			</fieldset>
			{!consent && <div className="questionnaire-actions">
				{!item.required && <Button className="questionnaire-button questionnaire-button-ghost" variant="ghost" type="button" onClick={() => {
					setSkipped(true);
					section.current?.focus({ preventScroll: true });
				}}>Skip</Button>}
				<Button className="questionnaire-button questionnaire-button-ghost" variant="ghost" type="button" onClick={() => onSubmit([{ name: item.name, values: [], help: 'hint' }])}>Hint</Button>
				<Button className="questionnaire-button questionnaire-button-ghost" variant="ghost" type="button" onClick={() => onSubmit([{ name: item.name, values: [], help: 'unknown' }])}>I don't know</Button>
				<Button className="questionnaire-button questionnaire-button-primary" type="submit">{definition.submitLabel}</Button>
			</div>}
		</form>
	);
}

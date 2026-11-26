import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { QuestionnaireAnswer, QuestionnaireDefinition } from '../questionnaire.ts';
import type { AnswerFields, QuestionDraft } from './client/chat-draft.ts';

type QuestionnaireProps = {
	draft?: QuestionDraft;
	definition: QuestionnaireDefinition;
	canAskForHelp: boolean;
	moreOptions?: ReactNode;
	onSubmit: (answers: QuestionnaireAnswer[]) => void;
};

export function Questionnaire({ definition, canAskForHelp, draft, onSubmit, moreOptions }: QuestionnaireProps) {
	const id = useId();
	const section = useRef<HTMLFieldSetElement>(null);
	const [answer, setAnswer] = useState<AnswerFields>(() => draft?.initial ?? { values: [], freeform: '' });
	const [invalid, setInvalid] = useState(false);
	const [skipped, setSkipped] = useState(false);
	const item = definition.items[0]!;
	const consent = definition.kind === 'reveal-consent';
	useEffect(() => { section.current?.focus({ preventScroll: true }); }, []);

	function edit(next: AnswerFields) {
		setAnswer(next);
		draft?.save(next);
		setInvalid(false);
		setSkipped(false);
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (consent) return;
		const values = item.choices.map(choice => choice.value).filter(value => answer.values.includes(value));
		const freeform = answer.freeform.trim();
		if (item.required && values.length === 0 && !freeform) {
			setInvalid(true);
			section.current?.querySelector<HTMLElement>('[data-choice-for], input[type="text"]')?.focus();
			return;
		}
		onSubmit([{ name: item.name, values, ...(freeform && { freeform }), ...(skipped && { skipped }) }]);
	}

	function shortcut(event: KeyboardEvent<HTMLFormElement>) {
		if (consent || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
		if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return;
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
					? <Checkbox {...choiceProps} name={item.name} checked={answer.values.includes(choice.value)}
						onCheckedChange={checked => edit({ ...answer, values: checked === true
							? [...answer.values, choice.value] : answer.values.filter(value => value !== choice.value) })} />
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
				{consent ? <div className="questionnaire-consent-actions">
					<div className="questionnaire-choices">{choices}</div>{moreOptions}
				</div> : choices.length > 0 && (item.multiple
					? <div className="questionnaire-choices">{choices}</div>
					: <RadioGroup name={item.name} className="questionnaire-choices" aria-labelledby={`${id}-prompt`}
						value={answer.values[0] ?? ''} onValueChange={value => edit({ ...answer, values: [value] })}>{choices}</RadioGroup>)}
				{item.input && (
					<div className="questionnaire-freeform-label">
						<Label htmlFor={`${id}-freeform`}>{item.input.label}</Label>
						<Input id={`${id}-freeform`} type="text" name={`${item.name}__freeform`} data-freeform-for={item.name}
							placeholder={item.input.placeholder} value={answer.freeform}
							onChange={event => edit({ ...answer, freeform: event.target.value })} />
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
				<Button className="questionnaire-button questionnaire-button-ghost" variant="ghost" type="button" disabled={!canAskForHelp} onClick={() => onSubmit([{ name: item.name, values: [], help: 'hint' }])}>Hint</Button>
				<Button className="questionnaire-button questionnaire-button-ghost" variant="ghost" type="button" disabled={!canAskForHelp} onClick={() => onSubmit([{ name: item.name, values: [], help: 'unknown' }])}>I don't know</Button>
				{moreOptions}
				<Button className="questionnaire-button questionnaire-button-primary" type="submit">{definition.submitLabel}</Button>
			</div>}
		</form>
	);
}

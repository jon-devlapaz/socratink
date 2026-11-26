import { useEffect, useRef, useState, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { steeringCopy, steeringKinds, turnSnippetToCopy, type SteeringKind } from './steering.ts';

type SteeringBarProps = {
	inMenu?: boolean;
	sourceText: string;
	onSteer: (kind: SteeringKind) => void;
	selectionRoot: RefObject<Node | null>;
};

export function SteeringBar({ sourceText, onSteer, selectionRoot, inMenu = false }: SteeringBarProps) {
	const [submitted, setSubmitted] = useState(false);
	const [copied, setCopied] = useState(false);
	const resetTimer = useRef<number | undefined>(undefined);
	const menuSelection = useRef('');
	useEffect(() => () => window.clearTimeout(resetTimer.current), []);

	function selectedText() {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !selectionRoot.current?.contains(selection.anchorNode)) return '';
		return selection.toString();
	}

	function steer(kind: SteeringKind) {
		setSubmitted(true);
		onSteer(kind);
	}

	async function copy(selection: string) {
		try {
			await navigator.clipboard.writeText(turnSnippetToCopy(sourceText, selection));
		} catch {
			return;
		}
		setCopied(true);
		window.clearTimeout(resetTimer.current);
		resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
	}

	if (inMenu) return (
		<DropdownMenu onOpenChange={open => { if (open) menuSelection.current = selectedText(); }}>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="ghost" className="questionnaire-button questionnaire-button-ghost"
					aria-label="More options" disabled={submitted}>
					More {copied ? <Check aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="steering-menu" align="start" collisionPadding={8} aria-label="More options">
				{steeringKinds.map(kind => (
					<DropdownMenuItem key={kind} onSelect={() => steer(kind)}>{steeringCopy[kind].label}</DropdownMenuItem>
				))}
				<DropdownMenuItem className="steering-menu-copy" onSelect={() => void copy(menuSelection.current)}>
					Copy this turn <Copy aria-hidden="true" />
				</DropdownMenuItem>
			</DropdownMenuContent>
			<span className="sr-only" role="status">{copied && 'Copied this turn'}</span>
		</DropdownMenu>
	);

	return (
		<div className="steering-bar" role="group" aria-label="Steer this turn">
			{steeringKinds.map(kind => (
				<Button key={kind} variant="ghost" type="button" className="steering-action steering-action--text"
					disabled={submitted} onClick={() => steer(kind)}>
					{steeringCopy[kind].label}
				</Button>
			))}
			<TooltipProvider delayDuration={200}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" type="button" size="icon" className="steering-action"
							aria-label={copied ? 'Copied this turn' : 'Copy this turn'} disabled={submitted}
							onMouseDown={event => { if (selectedText()) event.preventDefault(); }} onClick={() => void copy(selectedText())}>
							<svg className="steering-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor"
								strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="M6.25 6.25h6.5v6.5h-6.5V6.25Z M3.75 3.75h6.25v1.1H4.85v5.15H3.75V3.75Z" />
							</svg>
						</Button>
					</TooltipTrigger>
					<TooltipContent>{copied ? 'Copied' : 'Copy'}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

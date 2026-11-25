import { useEffect, useRef, useState, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { steeringCopy, steeringKinds, turnSnippetToCopy, type SteeringKind } from './steering.ts';

type SteeringBarProps = {
	sourceText: string;
	onSteer: (kind: SteeringKind) => void;
	selectionRoot: RefObject<Node | null>;
};

export function SteeringBar({ sourceText, onSteer, selectionRoot }: SteeringBarProps) {
	const [submitted, setSubmitted] = useState(false);
	const [copied, setCopied] = useState(false);
	const resetTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(resetTimer.current), []);

	function selectedText() {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !selectionRoot.current?.contains(selection.anchorNode)) return '';
		return selection.toString();
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(turnSnippetToCopy(sourceText, selectedText()));
		} catch {
			return;
		}
		setCopied(true);
		window.clearTimeout(resetTimer.current);
		resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
	}

	return (
		<div className="steering-bar" role="group" aria-label="Steer this turn">
			{steeringKinds.map(kind => (
				<Button key={kind} variant="ghost" type="button" className="steering-action steering-action--text"
					disabled={submitted} onClick={() => { setSubmitted(true); onSteer(kind); }}>
					{steeringCopy[kind].label}
				</Button>
			))}
			<TooltipProvider delayDuration={200}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" type="button" size="icon" className="steering-action"
							aria-label={copied ? 'Copied this turn' : 'Copy this turn'} disabled={submitted}
							onMouseDown={event => { if (selectedText()) event.preventDefault(); }} onClick={copy}>
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

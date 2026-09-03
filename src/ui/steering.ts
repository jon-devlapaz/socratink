export const steeringPrefix = 'Steering:';

export type SteeringKind = 'smaller-step' | 'try-unaided';

const steeringCopy: Record<SteeringKind, { label: string; ariaLabel: string; body: string; icon: string[] }> = {
	'smaller-step': {
		label: 'Smaller step',
		ariaLabel: 'Too fast: need a smaller step',
		body: 'smaller step. The last turn moved too fast or assumed more footing than I have. Slow down to one smaller step, and check a missing assumption before continuing.',
		icon: ['M3 13h3.5v3.5H3V13Zm5-4.5H11.5V12H8V8.5Zm5-4.5H16.5V7.5H13V4Z'],
	},
	'try-unaided': {
		label: 'Try unaided',
		ariaLabel: 'I want to try unaided',
		body: 'try unaided. I have enough footing. Withhold the next reveal and let me attempt the target.',
		icon: ['M8 5.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Z', 'M3.75 14.25c0-1.4 1.9-2.5 4.25-2.5s4.25 1.1 4.25 2.5'],
	},
};

export function formatSteeringMessage(kind: SteeringKind): string {
	switch (kind) {
		case 'smaller-step':
		case 'try-unaided':
			return `${steeringPrefix} ${steeringCopy[kind].body}`;
		default: {
			const exhaustive: never = kind;
			return exhaustive;
		}
	}
}

export function turnSnippetToCopy(sourceText: string, selectedText = ''): string {
	const selected = selectedText.trim();
	return selected || sourceText;
}

export function selectedTextIn(root: Node): string {
	const selection = globalThis.getSelection?.();
	if (!selection || selection.isCollapsed) return '';
	const anchor = selection.anchorNode;
	if (!anchor || !root.contains(anchor)) return '';
	return selection.toString();
}

export type SteeringBarOptions = {
	sourceText: string;
	onSteer: (kind: SteeringKind) => void;
	selectionRoot?: Node;
	writeClipboard?: (text: string) => Promise<boolean>;
};

export function createSteeringBar({
	sourceText,
	onSteer,
	selectionRoot,
	writeClipboard = writeClipboardText,
}: SteeringBarOptions): HTMLElement {
	const bar = document.createElement('div');
	bar.className = 'steering-bar';
	bar.setAttribute('role', 'group');
	bar.setAttribute('aria-label', 'Steer this turn');
	for (const kind of steeringKinds) {
		bar.append(
			createSteeringAction({
				label: steeringCopy[kind].label,
				ariaLabel: steeringCopy[kind].ariaLabel,
				icon: steeringCopy[kind].icon,
				onClick: () => {
					for (const action of bar.querySelectorAll('button')) action.disabled = true;
					onSteer(kind);
				},
			}),
		);
	}
	const copy = createSteeringAction({
		label: 'Copy',
		ariaLabel: 'Copy this turn',
		icon: [
			'M6.25 6.25h6.5v6.5h-6.5v-6.5Z',
			'M3.75 3.75h6.25v1.1H4.85v5.15H3.75V3.75Z',
		],
		onClick: () => {
			void copyTurnSnippet(selectionRoot ?? bar, sourceText, copy, writeClipboard);
		},
	});
	bar.append(copy);
	return bar;
}

const steeringKinds = ['smaller-step', 'try-unaided'] as const satisfies readonly SteeringKind[];

function createSteeringAction({
	label,
	ariaLabel,
	icon,
	onClick,
}: {
	label: string;
	ariaLabel: string;
	icon: readonly string[];
	onClick: () => void;
}): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'steering-action';
	button.setAttribute('aria-label', ariaLabel);
	const tipId = `steering-tip-${Math.random().toString(36).slice(2, 9)}`;
	button.setAttribute('aria-describedby', tipId);
	button.append(createSteeringIcon(icon), createSteeringTip(tipId, label));
	button.addEventListener('click', onClick);
	return button;
}

function createSteeringIcon(paths: readonly string[]): SVGSVGElement {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', '0 0 16 16');
	svg.setAttribute('aria-hidden', 'true');
	svg.setAttribute('class', 'steering-icon');
	for (const d of paths) {
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', d);
		path.setAttribute('fill', 'none');
		path.setAttribute('stroke', 'currentColor');
		path.setAttribute('stroke-width', '1.5');
		path.setAttribute('stroke-linecap', 'round');
		path.setAttribute('stroke-linejoin', 'round');
		svg.append(path);
	}
	return svg;
}

function createSteeringTip(id: string, label: string): HTMLElement {
	const tip = document.createElement('span');
	tip.id = id;
	tip.className = 'steering-tip';
	tip.setAttribute('role', 'tooltip');
	tip.textContent = label;
	return tip;
}

async function copyTurnSnippet(
	root: Node,
	sourceText: string,
	copy: HTMLButtonElement,
	writeClipboard: (text: string) => Promise<boolean>,
) {
	const snippet = turnSnippetToCopy(sourceText, selectedTextIn(root));
	if (!snippet || !(await writeClipboard(snippet))) return;
	const tip = copy.querySelector('.steering-tip');
	if (tip) tip.textContent = 'Copied';
	copy.setAttribute('aria-label', 'Copied this turn');
	globalThis.setTimeout(() => {
		if (!copy.isConnected) return;
		if (tip) tip.textContent = 'Copy';
		copy.setAttribute('aria-label', 'Copy this turn');
	}, 1500);
}

async function writeClipboardText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

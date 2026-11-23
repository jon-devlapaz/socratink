import { steeringPrefix } from '../config/chat-message.ts';

export type SteeringKind = 'smaller-step' | 'try-unaided';

const steeringCopy: Record<SteeringKind, { label: string; body: string; said: string }> = {
	'smaller-step': {
		label: 'Smaller step',
		body: 'smaller step. The last turn moved too fast or assumed more footing than I have. Slow down to one smaller step, and check a missing assumption before continuing.',
		said: 'Smaller step, please.',
	},
	'try-unaided': {
		label: 'Try on my own',
		body: 'try unaided. I have enough footing. Withhold the next reveal and let me attempt the target.',
		said: 'Let me try this unaided.',
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

/** The short line a sent steering message shows as, or undefined when the
 * text is not one of these controls' messages. */
export function steeringSaidText(text: string): string | undefined {
	const kind = steeringKinds.find((candidate) => formatSteeringMessage(candidate) === text);
	return kind && steeringCopy[kind].said;
}

export function turnSnippetToCopy(sourceText: string, selectedText = ''): string {
	const selected = selectedText.trim();
	return selected || sourceText;
}

function selectedTextIn(root: Node): string {
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
		const action = document.createElement('button');
		action.type = 'button';
		action.className = 'steering-action steering-action--text';
		action.textContent = steeringCopy[kind].label;
		action.addEventListener('click', () => {
			for (const button of bar.querySelectorAll('button')) button.disabled = true;
			onSteer(kind);
		});
		bar.append(action);
	}
	const copy = document.createElement('button');
	copy.type = 'button';
	copy.className = 'steering-action';
	copy.setAttribute('aria-label', 'Copy this turn');
	const tipId = `steering-tip-${Math.random().toString(36).slice(2, 9)}`;
	copy.setAttribute('aria-describedby', tipId);
	copy.append(
		createSteeringIcon([
			'M6.25 6.25h6.5v6.5h-6.5V6.25Z',
			'M3.75 3.75h6.25v1.1H4.85v5.15H3.75V3.75Z',
		]),
		createSteeringTip(tipId, 'Copy'),
	);
	copy.addEventListener('click', () => {
		void copyTurnSnippet(selectionRoot ?? bar, sourceText, copy, writeClipboard);
	});
	bar.append(copy);
	return bar;
}

const steeringKinds = ['smaller-step', 'try-unaided'] as const satisfies readonly SteeringKind[];

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

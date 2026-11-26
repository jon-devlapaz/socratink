import assert from 'node:assert/strict';

export async function assertHelpLayout(locator) {
	const geometry = await locator.evaluate((copy) => {
		const mark = copy.querySelector('.reveal-mark');
		const words = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				return node.textContent.trim() && !node.parentElement.closest('.reveal-mark, .sr-only')
					? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			},
		});
		const first = words.nextNode();
		const range = document.createRange();
		range.selectNodeContents(first);
		const body = range.getClientRects()[0];
		range.selectNodeContents(mark);
		const labelText = range.getClientRects()[0];
		const label = mark.getBoundingClientRect();
		const turn = copy.closest('.turn');
		const anchor = turn?.querySelector('.questionnaire legend') ?? turn ?? copy.closest('.history-step-body');

		const painter = document.createElement('canvas').getContext('2d');
		function luminance(color) {
			painter.fillStyle = color;
			painter.fillRect(0, 0, 1, 1);
			const [r, g, b] = [...painter.getImageData(0, 0, 1, 1).data].map(byte => {
				const channel = byte / 255;
				return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
			});
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		}
		const labelColor = getComputedStyle(mark).color;
		const textColor = getComputedStyle(first.parentElement).color;
		const theme = getComputedStyle(document.documentElement);
		const paper = luminance(theme.backgroundColor);
		painter.fillStyle = theme.getPropertyValue('--accent').trim();
		const actionPaint = painter.fillStyle;
		painter.fillStyle = labelColor;
		const labelPaint = painter.fillStyle;
		function contrast(color) {
			const ink = luminance(color);
			return (Math.max(ink, paper) + 0.05) / (Math.min(ink, paper) + 0.05);
		}
		return {
			labelLeft: labelText.left, bodyLeft: body.left, anchorLeft: anchor.getBoundingClientRect().left,
			labelBottom: label.bottom, bodyTop: body.top, labelColor, textColor, actionPaint, labelPaint,
			labelContrast: contrast(labelColor), textContrast: contrast(textColor),
			overflow: document.documentElement.scrollWidth > innerWidth,
		};
	});
	assert.ok(Math.abs(geometry.labelLeft - geometry.bodyLeft) <= 1, 'the clue begins on its attribution line');
	assert.ok(Math.abs(geometry.anchorLeft - geometry.bodyLeft) <= 1, 'the clue shares its reading edge with the question or turn');
	assert.ok(geometry.labelBottom <= geometry.bodyTop + 1, 'attribution sits above the clue');
	assert.notEqual(geometry.labelColor, geometry.textColor, 'supplied help has a distinct label color');
	assert.notEqual(geometry.labelPaint, geometry.actionPaint, 'the help label differs from selection ink');
	assert.ok(geometry.labelContrast >= 4.5 && geometry.textContrast >= 4.5, 'the attribution and clue contrast against the paper');
	assert.equal(geometry.overflow, false);
	return geometry;
}

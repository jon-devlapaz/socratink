import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';

export async function assertAccessible(page, state) {
	const { violations } = await new AxeBuilder({ page }).analyze();
	assert.deepEqual(violations.map(({ id, nodes }) => ({
		rule: id, elements: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
	})), [], state);
	console.log(`Accessibility passed: ${state}`);
}

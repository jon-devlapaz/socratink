import assert from 'node:assert/strict';

// Shared assertions for the repository browser gate; all sessions and model
// responses are synthetic. Run with pnpm test:browser.
export async function verifyCancellation(page) {
	await page.locator('#message').fill('QA slow: cancellation regression.');
	const admission = page.waitForResponse((response) =>
		response.request().method() === 'POST' && response.url().includes('/api/agents/chat/')
		&& !response.url().endsWith('/abort'));
	await page.getByRole('button', { name: 'Send message', exact: true }).click();
	assert.equal((await admission).ok(), true);
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();
	await page.waitForFunction(() => document.querySelector('#active-turn .request-state.aborted'));
	// Both the original send and cancel settle asynchronously. Observe beyond
	// the first card so this also catches the second paint/150ms exit transition.
	await page.waitForTimeout(250);
	assert.equal(await page.locator('#active-turn .request-state').count(), 1);
	assert.equal(await page.getByRole('button', { name: 'Retry', exact: true }).count(), 1);
	assert.equal(await page.locator('#message').isDisabled(), false);
}

export async function verifyRejectedRetry(page) {
	const sent = [];
	const capture = (request) => {
		if (request.method() === 'POST' && request.url().includes('/api/agents/chat/')
			&& !request.url().endsWith('/abort')) sent.push(request.postDataJSON().body);
	};
	page.on('request', capture);
	const prompt = 'QA retry: keep this original learner message.';
	const retry = page.getByRole('button', { name: 'Retry', exact: true });
	const input = page.locator('#message');
	const learnerBodies = page.locator('#messages .history-turn.you > p, #active-turn .turn.you > p');
	const earlier = await learnerBodies.allTextContents();
	async function assertTranscript(text) {
		assert.deepEqual(await learnerBodies.allTextContents(), [...earlier, text],
			'a rejected Retry must replace only its unsent learner turn, not append another');
	}
	async function rejected(action) {
		const response = page.waitForResponse((value) => value.status() === 503
			&& value.request().method() === 'POST' && value.url().includes('/api/agents/chat/'));
		await action();
		assert.equal((await (await response).json()).error.type, 'beta_paused');
		await page.waitForFunction(() => document.querySelector('#active-turn .request-state.not-admitted')
			&& !document.querySelector('#message').disabled);
		await page.waitForTimeout(200);
	}
	try {
		await input.fill(prompt);
		await rejected(() => page.getByRole('button', { name: 'Send message', exact: true }).click());
		await assertTranscript(prompt);
		await rejected(() => retry.click());
		assert.deepEqual(sent, [prompt, prompt], 'Retry must resend the exact rejected text');
		await assertTranscript(prompt);
		assert.equal(await input.inputValue(), prompt);
		const edited = 'QA retry: use the learner’s revised message instead.';
		await input.fill(edited);
		await rejected(() => retry.click());
		assert.deepEqual(sent, [prompt, prompt, edited]);
		assert.equal(await input.inputValue(), edited);
		await assertTranscript(edited);
		for (const blank of ['', '   ']) {
			await input.fill(blank);
			await retry.click();
			await page.waitForTimeout(200);
			assert.equal(sent.length, 3, 'a deliberately cleared draft must not dispatch');
			assert.equal(await input.inputValue(), blank);
			await assertTranscript(edited);
		}
		const composed = 'QA retry: send the revised draft from the composer.';
		await input.fill(composed);
		await rejected(() => page.getByRole('button', { name: 'Send message', exact: true }).click());
		assert.deepEqual(sent, [prompt, prompt, edited, composed]);
		await assertTranscript(composed);
		assert.equal(await page.locator('#active-turn .request-state').count(), 1);
	} finally {
		page.off('request', capture);
	}
}

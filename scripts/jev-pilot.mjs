// Offline pilot: how accurately does TypeSafe's Jev read Socratink turns?
// Sends each hand-labeled synthetic turn in scripts/jev-pilot/turns.json to Jev,
// compares the answers with the labels, and writes .cache/jev-pilot/report.json.
// Paid calls, so it is not part of `pnpm check`. Refuses to run without --budget
// and never sends more requests than the budget. Reads TYPESAFE_API_KEY; never logs it.
// Usage: node scripts/jev-pilot.mjs --budget 200 [--model jev-latest]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';

const learnerQuestions = {
	learner_move: {
		type: 'choice',
		instructions:
			'What is `learner_reply` doing in response to `tutor_question` from a tutor who wants the learner to work it out?',
		criteria: {
			attempt: 'Offers their own answer, guess, or reasoning about the question, even if tentative or wrong',
			asks_for_answer: 'Asks the tutor to give the answer, definition, or explanation instead of trying',
			dont_know: 'Says they do not know or cannot start, without asking for the answer and without a guess',
			other: 'Off topic, logistics, a request about the app, small talk, or changing the subject',
		},
	},
};

const tutorQuestions = {
	reveal: {
		type: 'choice',
		instructions:
			'How much of the answer to the learning problem does `tutor_turn` supply? Feedback on what the learner already said does not count as supplying it.',
		criteria: {
			none: 'Supplies no new answer content: only questions, feedback on the learner’s own work, or logistics',
			hint: 'A nudge or analogy that points toward the answer without stating any part of it',
			worked_example: 'Fully works a different but similar problem, step by step',
			partial: 'States some part of the answer, such as a missing step or distinction, but leaves the rest',
			full_answer: 'States the whole answer to the problem',
		},
	},
	// Compound judgments ("supplied content AND no attempt") read poorly in a first run,
	// so each question stays atomic and `premature` is derived in code below.
	supplies_content: {
		type: 'noul',
		instructions:
			'Does `tutor_turn` state any part of the answer the learner had not already said: a fact, step, distinction, worked example, or nudge toward the answer? Questions, feedback on the learner’s own words, and logistics do not count.',
	},
	learner_attempted: {
		type: 'noul',
		instructions: 'Does `learner_last` contain the learner’s own answer, guess, or reasoning about the problem, even a tentative or wrong one?',
	},
};

const items = (data) => [
	...data.learner.map((turn) => ({
		side: 'learner',
		state: { tutor_question: turn.tutor, learner_reply: turn.learner },
		questions: learnerQuestions,
		labels: { learner_move: turn.label },
	})),
	...data.tutor.map((turn) => ({
		side: 'tutor',
		state: { learner_last: turn.learner, tutor_turn: turn.tutor },
		questions: tutorQuestions,
		labels: {
			reveal: turn.reveal,
			supplies_content: turn.reveal !== 'none',
			learner_attempted: turn.attempted,
		},
		derived: { premature: turn.premature },
	})),
];

async function ask(key, model, item) {
	const started = performance.now();
	const response = await fetch(ENDPOINT, {
		method: 'POST',
		headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
		body: JSON.stringify({ model, state: item.state, questions: item.questions }),
	});
	const ms = Math.round(performance.now() - started);
	if (!response.ok) return { ok: false, status: response.status, body: (await response.text()).slice(0, 500), ms };
	return { ok: true, ms, ...(await response.json()) };
}

// One scored row per question: the predicted value, its probability, and whether it matches the label.
function score(item, answers) {
	return Object.entries(item.labels).map(([id, label]) => {
		const answer = answers[id];
		if (answer.type === 'noul') {
			const predicted = answer.noul >= 0.5;
			return { id, label, predicted, probability: predicted ? answer.noul : 1 - answer.noul, correct: predicted === label };
		}
		return { id, label, predicted: answer.choice, probability: answer.probabilities[answer.choice], confidence: answer.confidence, correct: answer.choice === label };
	});
}

// The premature-reveal flag the app would act on: content supplied with no learner attempt.
function derive(item, answers) {
	if (!item.derived) return [];
	const yes = answers.supplies_content.noul * (1 - answers.learner_attempted.noul);
	const predicted = yes >= 0.5;
	const label = item.derived.premature;
	return [{ id: 'premature (derived)', label, predicted, probability: predicted ? yes : 1 - yes, correct: predicted === label }];
}

function summarize(rows) {
	const byQuestion = {};
	for (const row of rows) (byQuestion[row.id] ??= []).push(row);
	const mean = (xs) => (xs.length ? Number((xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(3)) : null);
	return Object.fromEntries(
		Object.entries(byQuestion).map(([id, list]) => {
			const confusions = {};
			for (const row of list) if (!row.correct) confusions[`${row.label} → ${row.predicted}`] = (confusions[`${row.label} → ${row.predicted}`] ?? 0) + 1;
			const sure = list.filter((row) => row.probability >= 0.8);
			return [id, {
				n: list.length,
				accuracy: mean(list.map((row) => Number(row.correct))),
				meanProbabilityWhenRight: mean(list.filter((row) => row.correct).map((row) => row.probability)),
				meanProbabilityWhenWrong: mean(list.filter((row) => !row.correct).map((row) => row.probability)),
				atProbability80: { coverage: mean(list.map((row) => Number(row.probability >= 0.8))), accuracy: mean(sure.map((row) => Number(row.correct))) },
				confusions,
			}];
		}),
	);
}

const { values } = parseArgs({ options: { budget: { type: 'string' }, model: { type: 'string', default: 'jev-latest' } } });
const budget = Number(values.budget);
if (!Number.isInteger(budget) || budget < 1) {
	console.error('Refusing to run: pass --budget N, the most Jev requests this run may send.');
	process.exit(2);
}
const key = process.env.TYPESAFE_API_KEY;
if (!key) {
	console.error('Refusing to run: TYPESAFE_API_KEY is not set.');
	process.exit(2);
}

const all = items(JSON.parse(readFileSync(new URL('./jev-pilot/turns.json', import.meta.url), 'utf8')));
if (all.length > budget) {
	console.error(`Refusing to run: ${all.length} turns need ${all.length} requests, over the budget of ${budget}.`);
	process.exit(2);
}

const rows = [];
const failures = [];
const latencies = [];
const models = new Set();
for (const item of all) {
	const result = await ask(key, values.model, item);
	latencies.push(result.ms);
	if (!result.ok) {
		failures.push({ side: item.side, state: item.state, status: result.status, body: result.body });
		continue;
	}
	models.add(result.model);
	for (const row of [...score(item, result.answers), ...derive(item, result.answers)]) rows.push({ side: item.side, state: item.state, ...row });
}

latencies.sort((a, b) => a - b);
const report = {
	requests: all.length,
	budget,
	models: [...models],
	latencyMs: { p50: latencies[Math.floor(latencies.length / 2)], p95: latencies[Math.floor(latencies.length * 0.95)] },
	failures,
	summary: summarize(rows),
	misses: rows.filter((row) => !row.correct),
};
mkdirSync('.cache/jev-pilot', { recursive: true });
writeFileSync('.cache/jev-pilot/report.json', `${JSON.stringify(report, null, '\t')}\n`);
console.log(JSON.stringify({ requests: report.requests, models: report.models, latencyMs: report.latencyMs, failures: failures.length, summary: report.summary }, null, '\t'));
console.log('Full report: .cache/jev-pilot/report.json');

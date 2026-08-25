export const R1_FIXTURE_ID = 'r1.tool-boundary.v1' as const;
export const R1_TARGET_ID = 'tool-boundary.validity-authz.v1' as const;
export const R1_RUBRIC_ID = 'tool-boundary-rubric.v1' as const;
export const R1_EVIDENCE_CONTRACT_ID = 'tool-boundary-evidence-contract.v1' as const;
export const R1_INTERVENTION_ID = 'tool-boundary-contrastive-repair.v1' as const;

export const SOURCE_PROVENANCE = {
	repository: 'https://github.com/bryanyzhu/agentic-ai-system-course',
	author: 'Yi Zhu / bryanyzhu',
	commit: 'b886cb05df2153785ad0f4f461ea4bfc9de1f45b',
	path: 'course/03-tools-validation.md',
	sha256: '95e82bb9824896b8d303218805beabc1a23e353d089bc067158f79253c6d7dcd',
	license: 'MIT, Copyright (c) 2026 Yi Zhu',
	licenseSha256: 'e5279037ef03c9f9ad972c5ea20f4c5c13a57ed3800ac7a73b28c93e7a7dd94c',
} as const;

export const DOMAIN_SUPPORT_PROVENANCE = {
	repository: 'https://github.com/OWASP/CheatSheetSeries',
	commit: 'ef539da38a09a1ff05bb895c94580cdd5b8da340',
	files: {
		'cheatsheets/Input_Validation_Cheat_Sheet.md': '474509f8bc6d06dab110bad0d0d5055cc9c6f2a63d2f464ce2966be634246772',
		'cheatsheets/Authorization_Cheat_Sheet.md': 'e78a10eb9759a1fc7593ba1fc89a05b017e7e795ac16ad5496bdba86138d891f',
		'cheatsheets/AI_Agent_Security_Cheat_Sheet.md': 'cdab974f422c3cc3568d3c3e7364a98ab34fe965ce85aed3f4488c428eccfc6d',
	},
} as const;

export const LEARNING_TARGET =
	'Given a syntactically valid agent-tool request and an explicit actor/resource policy, the learner distinguishes request validity from execution authorization, identifies which check fails, and explains why neither check substitutes for the other before a side effect occurs.';

export const BASELINE_PROMPT =
	"Should this request execute? Explain your reasoning from the request, resource facts, actor, and policy. Name one concrete failure the system's checks must prevent.";

export const POST_PROMPT =
	'Should this request execute? Apply the same two separate checks, state which passes or fails from these facts, explain why the passing check cannot rescue the failing one, and name one concrete failure that could follow if the system executes anyway.';

export const DELAYED_PROMPT = BASELINE_PROMPT;

export const INTERVENTION_TEXT =
	"Two gates answer different questions. First ask whether the request is well formed and consistent with the resource's domain constraints. Separately ask whether this actor may perform this action on this resource under the current policy. Passing either gate does not make the other pass. Both must pass before the side effect executes. When you explain the boundary, name the concrete side effect or harm a mistaken execution could cause.";

export const SCENARIOS = {
	baseline: {
		id: 'refund-region',
		prompt: BASELINE_PROMPT,
		policy: [
			'EU support operators may refund invoices assigned to the EU region up to EUR 500.',
			"Refunds outside the operator's region are not permitted.",
		],
		facts: [
			'Actor: support-eu-17, an EU support operator.',
			'Tool request: refund_invoice({ invoice_id: "inv-us-204", amount_eur: 150 }).',
			'The tool schema accepts a string invoice ID and a positive numeric amount.',
			'inv-us-204 exists, belongs to the US region, has EUR 220 refundable balance, and the requested amount is within that balance.',
		],
		expected: 'Request validity passes; execution authorization fails; do not execute.',
	},
	post: {
		id: 'release-version',
		prompt: POST_PROMPT,
		policy: ['release-manager-4 is authorized to deploy payments to production.'],
		facts: [
			'Tool request: deploy_service({ service: "payments", version: "v2..4", environment: "production" }).',
			'The schema accepts string service/version fields and the production enum.',
			'payments exists, but v2..4 is not a valid or registered release version.',
		],
		expected: 'Execution authorization passes; domain validity fails; do not execute.',
	},
	delayed: {
		id: 'campaign-consent',
		prompt: DELAYED_PROMPT,
		policy: ['EMEA marketing associates may send campaigns only to segments assigned to EMEA.'],
		facts: [
			'Actor: marketing-emea-12, an EMEA marketing associate.',
			'Tool request: send_campaign({ campaign: "summer-offer", segment: "us-adults" }).',
			'Both identifiers are valid and exist; summer-offer is approved and us-adults is assigned to the US region.',
		],
		expected: 'Request validity passes; execution authorization fails; do not execute.',
		dueAfterHours: 48,
		dueBeforeHours: 72,
	},
} as const;

export const RUBRIC = [
	{ id: 'R1', label: 'decision', requirement: 'Correctly states whether the request should execute.' },
	{ id: 'R2', label: 'separation', requirement: 'Treats request form/domain validity and actor/action/resource authorization as two distinct questions, in any equivalent language.' },
	{ id: 'R3', label: 'application', requirement: 'Correctly identifies which gate passes and which fails from the stated scenario facts.' },
	{ id: 'R4', label: 'non-substitution', requirement: 'Explains that passing one gate does not establish the other.' },
	{ id: 'R5', label: 'consequence', requirement: 'Places both gates before execution and names a concrete consequence of conflation relevant to the scenario.' },
] as const;

export const CLAIM_TEXT = {
	baselinePass:
		"In this one scenario, the learner's submitted response distinguished request validity from execution authorization and correctly withheld execution under declared source-closed, no-assistance conditions.",
	baselineFail:
		'In this one source-closed scenario, the response did not yet demonstrate the required validity/authorization distinction.',
	postPass:
		'After targeted feedback, the learner produced the validity/authorization distinction on one fresh inverse scenario under assisted immediate conditions.',
	postFail:
		'After targeted feedback, the response did not demonstrate the distinction on the fresh inverse scenario under these conditions.',
} as const;

export const EXPLICIT_NON_INFERENCES = [
	'mastery',
	'durable retention',
	'transfer',
	'general security competence',
	'implementation skill',
	'a stable misconception',
	'learning style',
	'intelligence',
	'causal benefit from the intervention',
	'superiority over another learning method',
] as const;

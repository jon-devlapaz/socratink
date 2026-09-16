# FM-AGENTENG-01 — PR Jev scores (lifecycle attribution)

- **As-of:** 2026-09-15 ~20:45 CT
- **Repo:** jon-devlapaz/socratink PRs #1–#15
- **Method:** TypeSafe System One (`@typesafe-ai/sdk`) one call per PR; redacted narrative state
- **Gold chain (corrected):** `#8→#9→#10→#11→#12→#13→#14` (+ `#6` hotfix). **Anti:** `#7`, EVT-0001 only.
- **Correction:** PR #11–#14 are **merged:true** happy follow-ups — not closed-fail / phase-skip.
- **Scored:** 15/15 · errors 0

## Distribution

- lifecycle_stage: `{'impl': 7, 'ship': 4, 'verify': 4}`
- primary_failure_cause: `{'scope_sub': 1, 'missing_verify': 4, 'none': 9, 'ci_gap': 1}`

## Per-PR table

| PR | Merged | Stage | stage_success | happy_path_fit | verify_ok | primary_failure | would_retry | Fingerprint |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #1 | True | impl | p=0.62 | p=0.27 | p=0.33 | scope_sub | p=0.34 | human-ish/cursor feat/ |
| #2 | True | ship | p=0.68 | p=0.51 | p=0.43 | missing_verify | p=0.49 | feat/ cursor-ish |
| #3 | True | verify | p=0.76 | p=0.70 | p=0.31 | none | p=0.44 | chore/ |
| #4 | True | impl | p=0.88 | p=0.73 | p=0.84 | none | p=0.61 | feat/ |
| #5 | True | ship | p=0.61 | p=0.27 | p=0.29 | ci_gap | p=0.27 | codex/ |
| #6 | True | verify | p=0.71 | p=0.48 | p=0.31 | missing_verify | p=0.56 | fix/ |
| #7 | True | impl | p=0.60 | p=0.20 | p=0.23 | missing_verify | p=0.36 | feat/ |
| #8 | True | ship | p=0.87 | p=0.87 | p=0.74 | none | p=0.62 | cursor/cloud |
| #9 | True | impl | p=0.85 | p=0.81 | p=0.71 | none | p=0.63 | cursor/cloud |
| #10 | True | verify | p=0.85 | p=0.79 | p=0.63 | none | p=0.56 | cursor/cloud |
| #11 | True | impl | p=0.83 | p=0.77 | p=0.63 | none | p=0.60 | cursor/cloud |
| #12 | True | ship | p=0.83 | p=0.75 | p=0.46 | none | p=0.59 | cursor/cloud |
| #13 | True | impl | p=0.82 | p=0.73 | p=0.53 | none | p=0.60 | cursor/cloud |
| #14 | True | verify | p=0.78 | p=0.67 | p=0.42 | none | p=0.50 | cursor/cloud |
| #15 | False | impl | p=0.55 | p=0.51 | p=0.39 | missing_verify | p=0.57 | cursor/cloud |

## Short narratives (redacted)

### PR #1 — Keep only the current exchange on the chat stage
- Branch `feat/current-turn-canvas` · human-ish/cursor feat/ · +90343/−1061 · merged=True
- Jev: stage=impl success=p=0.62 happy=p=0.27 verify=p=0.33 fail=scope_sub retry=p=0.34
- Body: Live user/assistant pair on stage; Earlier dropdown. Also catch-up: skill corpus dominates line count. Test plan mostly unchecked UI checklist + pnpm check/smoke hoped.
- CI/review: No independent review Scout. Made with Cursor footer. Giant +90k skill corpus vs UI change.

### PR #2 — Use Vercel AI Gateway when the local model is unreachable
- Branch `feat/vercel-ai-gateway` · feat/ cursor-ish · +53/−5 · merged=True
- Jev: stage=ship success=p=0.68 happy=p=0.51 verify=p=0.43 fail=missing_verify retry=p=0.49
- Body: On Vercel skip loopback; forward x-vercel-oidc-token. Local jon-local unchanged. Proof: pnpm check+smoke checked; production Chat after merge unchecked.
- CI/review: Narrow hosting fix. Fast merge.

### PR #3 — Prove Git production auto-deploy
- Branch `chore/git-auto-prod-probe` · chore/ · +1/−0 · merged=True
- Jev: stage=verify success=p=0.76 happy=p=0.70 verify=p=0.31 fail=none retry=p=0.44
- Body: Tiny HTML comment probe for Vercel Git production auto-deploy. Test plan: Vercel target=production + HTML contains probe string (unchecked in body).
- CI/review: Intentional verify/ship probe. 1 line.

### PR #4 — feat(chat): tag questionnaire tool spans for Braintrust filtering
- Branch `feat/questionnaire-span-metadata` · feat/ · +102/−18 · merged=True
- Jev: stage=impl success=p=0.88 happy=p=0.73 verify=p=0.84 fail=none retry=p=0.61
- Body: Stamp questionnaire metadata on present_question spans. Extend live smoke to two-turn questionnaire. Proof: braintrust/questionnaire/types/build/smoke all checked.
- CI/review: Strong named proofs. Observability slice.

### PR #5 — Add durable Northflank staging (private Node + Postgres)
- Branch `codex/northflank-staging` · codex/ · +598/−104 · merged=True
- Jev: stage=ship success=p=0.61 happy=p=0.27 verify=p=0.29 fail=ci_gap retry=p=0.27
- Body: Docker+Postgres staging; Gateway key on Northflank. MERGE GATE warned: DATABASE_URL fail-closed on Vercel production. Still merged; Northflank already running on branch.
- CI/review: Codex fingerprint. Merge despite known Vercel landmine → production break → #6.

### PR #6 — fix(chat): boot Vercel Chat before the OIDC token exists
- Branch `fix/vercel-chat-oidc-boot` · fix/ · +19/−8 · merged=True
- Jev: stage=verify success=p=0.71 happy=p=0.48 verify=p=0.31 fail=missing_verify retry=p=0.56
- Body: Production 500 after #5: resolveChatModel threw at module load before OIDC copy. Narrow: Gateway key required at boot on Northflank only. pnpm check; live Chat turn unchecked post-merge.
- CI/review: Gold hotfix exemplar. Session soft-join b06e3da7.

### PR #7 — feat(ui): learner motion, dummy dock, and type size
- Branch `feat/ui-learner-motion` · feat/ · +1506/−88 · merged=True
- Jev: stage=impl success=p=0.60 happy=p=0.20 verify=p=0.23 fail=missing_verify retry=p=0.36
- Body: Cursor fuse, dummy dock, type size, CSS split. Test plan: long unchecked browser checklist; pnpm check hoped. Overlaps UI thrash sessions 357a2e9e/b23609bb.
- CI/review: Anti-happy: size without proof discipline.

### PR #8 — Phase 1: signed HttpOnly session cookie, not BYOK
- Branch `cursor/phase-1-session-cookie-41fb` · cursor/cloud · +613/−98 · merged=True
- Jev: stage=ship success=p=0.87 happy=p=0.87 verify=p=0.74 fail=none retry=p=0.62
- Body: Phase 1 session only — not BYOK/store/OAuth. HttpOnly cookie gate before agent router. Proof: pnpm check + smoke with fixture cookie. Out of scope fences explicit. bc-REDACTED.
- CI/review: FM-PRREV PASS. Gold plate→proof.

### PR #9 — Phase 2: encrypted credential store, not BYOK
- Branch `cursor/phase-2-secret-store-dbaf` · cursor/cloud · +688/−7 · merged=True
- Jev: stage=impl success=p=0.85 happy=p=0.81 verify=p=0.71 fail=none retry=p=0.63
- Body: Library-first encrypted credential store; Chat stays jon-local. Not BYOK paste. Proof: test:credentials + check + smoke. Not-in-PR: wire resolve, PKCE, live Postgres.
- CI/review: FM-PRREV PASS. Library before wire.

### PR #10 — Phase 3: prove overlapping Chat streams cannot mix learner keys
- Branch `cursor/phase-3-hotel-safety-a4b2` · cursor/cloud · +302/−2 · merged=True
- Jev: stage=verify success=p=0.85 happy=p=0.79 verify=p=0.63 fail=none retry=p=0.56
- Body: Hotel-safety overlap contract via test:learner-key. Not paste UI. Live store wiring deferred. Proof suite green. FM-PRREV CONCERN: unit path ≠ instrument path.
- CI/review: CONCERN recorded but phase slice honest; merged.

### PR #11 — Phase 3: wire stored OpenAI keys into Chat
- Branch `cursor/phase-3-byok-a4b2` · cursor/cloud · +661/−22 · merged=True
- Jev: stage=impl success=p=0.83 happy=p=0.77 verify=p=0.63 fail=none retry=p=0.60
- Body: Happy follow-up to #10: wire Phase 2 store into Chat; fail-closed missing key; smallest paste UI. Proof: learner-key + openai-key + check + smoke. Live vendor turn unverified.
- CI/review: MERGED happy follow-up (not phase-skip). Completes store wire after isolation proof.

### PR #12 — Use gpt-5-nano for connected OpenAI BYOK Chat
- Branch `cursor/cheapest-openai-b412` · cursor/cloud · +21/−8 · merged=True
- Jev: stage=ship success=p=0.83 happy=p=0.75 verify=p=0.46 fail=none retry=p=0.59
- Body: Switch connected specifier gpt-4o→gpt-5-nano (cheapest registered). Proof: chat-model + learner-key + check + smoke. Live throwaway turn unverified.
- CI/review: MERGED happy cost tweak; tiny diff.

### PR #13 — Use Flue instanceId so connected Chat selects OpenAI
- Branch `cursor/byok-instance-id-a4a1` · cursor/cloud · +67/−4 · merged=True
- Jev: stage=impl success=p=0.82 happy=p=0.73 verify=p=0.53 fail=none retry=p=0.60
- Body: Live miss: stored OpenAI but latched Gemini — read conversationId not instanceId. Fix: instanceId first. Proof: learner-key + check + smoke; live OpenAI turn unchecked.
- CI/review: MERGED happy remediation after live observation.

### PR #14 — Fail closed when Chat lacks a namespaced instance id
- Branch `cursor/identity-judo-0721` · cursor/cloud · +51/−68 · merged=True
- Jev: stage=verify success=p=0.78 happy=p=0.67 verify=p=0.42 fail=none retry=p=0.50
- Body: Delete instanceId??conversationId sniff; missing/unparseable instance id errors. Author: live BYOK already verified before harden. Proof: learner-key + check; smoke/live skipped this PR.
- CI/review: MERGED happy governance fail-closed. Gold chain end (pre-#15).

### PR #15 — Phase 4: OpenRouter PKCE for learner BYOK
- Branch `cursor/phase-4-openrouter-pkce-d6bf` · cursor/cloud · +1173/−141 · merged=False
- Jev: stage=impl success=p=0.55 happy=p=0.51 verify=p=0.39 fail=missing_verify retry=p=0.57
- Body: OpenRouter S256 PKCE + exclusive LearnerChatRoute. Proof: openrouter/learner-key/chat-model/openai-key/check/smoke. Live OpenRouter auth/Chat unverified. Out of scope: vendor OAuth apps.
- CI/review: OPEN in-flight. Continue only with plate+proof; don't widen mid-flight.

## Attribution notes

- **Happy gold:** #8–#14 all `primary_failure_cause=none` in this run (incl. #10 CONCERN treated as residual-ok). #6 verify Noul may flag unchecked live turn — still gold hotfix shape.
- **Anti:** #1 scope_sub (skill corpus dump); #7 missing_verify (UI checklist); #5 ci_gap (DATABASE_URL landmine). EVT-0001 is postmortem-not-PR.
- **Open:** #15 missing_verify (live OpenRouter unverified) — in-flight, not anti-happy.
- **Artifacts:** `pr-jev-scores.json`, `pr-jev-pack.json`

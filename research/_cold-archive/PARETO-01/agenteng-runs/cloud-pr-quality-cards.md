# cloud-pr-quality-cards — FM-AGENTENG-01 T3.2

**As-of:** 2026-09-15 21:10 CT  
**Mode:** research-only · Brain untouched · no factory done · no SendToUser · no PR · skip Mac sync  
**Scope:** PRs **#8–#15** · 7 unique bcId dumps · deeper mine than transcript-mine  
**Counts:** cards=**8** · CD-H=**10** · CD-S=**12** · CD total=**22**  
**Mean dims (0–3):** plate=2.88 · proof=2.5 · stop=3.0 · partnership=2.25 · thrash_risk=1.38 (higher thrash worse)  
**Policy:** Densest `happy-nuggets.*` / `smell-catalog-dense.*` **untouched** — CD-* live here + transcript-mine append cross-ref.

## Rubric

| Dim | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| plate / proof / stop / partnership | absent | weak/partial | solid | exemplar |
| thrash_risk | clean | minor | notable | severe |

Evidence labels: **Verified** / **Assumption** / **Inference** / **Unknown**. Cite dump `L#` + role.

## Summary table

| PR | plate | proof | stop | partner | thrash↓ | plate? | proof? | stop? | state |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| #8 | 3 | 3 | 3 | 3 | 1 | Y | Y | Y | merged |
| #9 | 3 | 3 | 3 | 3 | 2 | Y | Y | Y | merged |
| #10 | 3 | 3 | 3 | 1 | 2 | Y | Y | Y | merged |
| #11 | 3 | 2 | 3 | 2 | 1 | Y | Y | Y | merged |
| #12 | 2 | 2 | 3 | 1 | 0 | Y | Y | Y | merged |
| #13 | 3 | 3 | 3 | 3 | 2 | Y | Y | Y | merged |
| #14 | 3 | 2 | 3 | 2 | 1 | Y | Y | Y | merged |
| #15 | 3 | 2 | 3 | 3 | 2 | Y | Y | Y | open |

---

## Per-PR quality cards

### QC-08 · PR #8 — Phase 1: signed HttpOnly session cookie, not BYOK

- **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` · **state:** merged · **dump:** `/workspace/cloud-agent-transcripts/bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb.jsonl` · 570 lines
- **User turns:** L1, L371, L497
- **Scores:** plate=3 · proof=3 · stop=3 · partnership=3 · thrash_risk=1
- **Loops tags:** N010, N011, N040, N050, S011, S050
- **Cross-ref:** TM-H01, TM-H02, TM-S01, CD-H01, CD-H09, CD-S01

#### Plate present? **YES** · score 3/3 · Verified
- L1 user: Phase 1 only + Required outcome bullets (cookie, namespaced ids, gate, rate-limit, smoke fixture) + canonical plan paths; L371 thermo-nuclear fix plate; L497 validation plate

#### Proof / verify? **YES** · score 3/3 · Verified
- L1 user: 'Proof: targeted tests… then pnpm check and pnpm smoke' + browser-verify clause; L370/L496 assistant Passed; L570 validation table

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L1: Do not implement BYOK/secret store/OAuth/Clerk/Flue schema; L371 Do not expand scope; L497 Do not extract isHostedEnvironment / Redis / auth vendors

#### Partnership signals · score 3/3 · Verified
- L371 user: Jonathan asked address thermo-nuclear review — fix only listed items
- L497 user: validate third-party review; Return validation table (confirmed/rejected)
- L570 assistant: confirmed/rejected table with evidence per item

#### Thrash moments · risk 1/3 · Verified
- L302 assistant thinking: StrReplace ops on app.ts conflicted; file reverted — reapplied both changes
- L289 rate-limiter zero-boundary edge case considered then dismissed

**Notes:** Gold plate exemplar. Partnership review→validation→warranted push is the pattern.

### QC-09 · PR #9 — Phase 2: encrypted credential store, not BYOK

- **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` · **state:** merged · **dump:** `/workspace/cloud-agent-transcripts/bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf.jsonl` · 431 lines
- **User turns:** L1, L288, L388
- **Scores:** plate=3 · proof=3 · stop=3 · partnership=3 · thrash_risk=2
- **Loops tags:** N011, N012, N020, N042, S011, S020
- **Cross-ref:** TM-H03, TM-S02, TM-S03, CD-H02, CD-H10, CD-S02, CD-S09

#### Plate present? **YES** · score 3/3 · Verified
- L1 user: Phase 2 only, AES-GCM Postgres, fail-closed CREDENTIALS_SECRET, credentialRef, public contract tests; L288 thermo fix plate; L388 third-party validation

#### Proof / verify? **YES** · score 3/3 · Verified
- L1 Proof: targeted tests + pnpm check/smoke; L287 Unverified: live Postgres/hosted boot/CI listed; L387 fake-client Postgres $1 contract

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L1: Do not implement BYOK UI/OpenRouter PKCE/Clerk/Flue schema/LLM client; L288 keep Phase 2 behavior; L388 Do not add query builder / change missing→undefined / BYOK

#### Partnership signals · score 3/3 · Verified
- L288 thermo-nuclear review → four explicit fixes
- L388 third-party review validation table pattern (mirrors #8)
- L431 confirmed/rejected table

#### Thrash moments · risk 2/3 · Verified
- L48/L60: Local main stale vs merged Phase 1 — fetch origin/main (sync thrash)
- L183 UPSERT/ON CONFLICT dialect friction; L216 tab/space StrReplace retry
- L125→L288: homemade dual-dialect SQL client later deleted by review

**Notes:** Library-first + explicit Unverified axes. Sync-fetch smell recurs on phase chains.

### QC-10 · PR #10 — Phase 3: prove overlapping Chat streams cannot mix learner keys

- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · **state:** merged · **dump:** `/workspace/cloud-agent-transcripts/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2.jsonl` · 965 lines
- **User turns:** L1
- **Scores:** plate=3 · proof=3 · stop=3 · partnership=1 · thrash_risk=2
- **Loops tags:** N012, N021, N022, N042, S012, S022
- **Cross-ref:** TM-H04, TM-S04, CD-H03, CD-S03, CD-S04, CD-S10

#### Plate present? **YES** · score 3/3 · Verified
- L1 user: Prove hotel-safety — two overlapping streams + recovery must never put Alice's key on Bob's wire; smallest contract; If isolation FAILS, stop

#### Proof / verify? **YES** · score 3/3 · Verified
- L1: run new test + nearest contracts; write PASS/FAIL verdict to phase-3-overlap-proof.md; L336 assistant PASS + pnpm test:learner-key + check/smoke; remaining unknowns listed

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L1: Do not build paste UI/OAuth/settings/Flue wrap; If isolation FAILS, stop — do not add complexity; no real API keys

#### Partnership signals · score 1/3 · Inference
- Single prove-first plate; no mid-run captain review turns for #10 slice
- Shared bc with #11 (multi-PR lineage) — partnership deferred to wire turn L337

#### Thrash moments · risk 2/3 · Verified
- L100: design conflict — production resolve vs smoke jon-local
- L254 potential hang if applyAuth throws; L266 unhandled-rejection fix
- L284 test failed unknown (TS loader); L271/L487 missing path retries

**Notes:** Prove-first gold. FM-PRREV CONCERN residual noted in prior packs; dump still shows honest unknowns.

### QC-11 · PR #11 — Phase 3: wire stored OpenAI keys into Chat

- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · **state:** merged · **dump:** `/workspace/cloud-agent-transcripts/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2.jsonl` · 965 lines
- **Shared bc with:** [10] (**Verified**)
- **User turns:** L337, L956
- **Scores:** plate=3 · proof=2 · stop=3 · partnership=2 · thrash_risk=1
- **Loops tags:** N012, N023, N044, S012, S022
- **Cross-ref:** TM-H05, TM-S04, CD-H04, CD-S04

#### Plate present? **YES** · score 3/3 · Verified
- L337 user: wire Phase 2 store into Chat + smallest paste UI; Prefer follow-up PR to keep proof PR reviewable; Must bullets + hotel-safety constraints

#### Proof / verify? **YES** · score 2/3 · Verified
- L337: closest contract + pnpm check/smoke; return what remains unverified (hosted CREDENTIALS_SECRET, live vendor key); L955 Passed check/smoke; L956 CI success notification

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L337: No OAuth/ChatGPT/Claude/settings/Flue wrap; no process.env keys / setProvider / Models.login; keep overlap contract

#### Partnership signals · score 2/3 · Verified
- L337 prefer follow-up PR so #10 stays reviewable — captain multi-PR hygiene
- L955 'Proof PR #10 is unchanged'
- L956 github CI system_notification success (automation partnership)

#### Thrash moments · risk 1/3 · Verified
- L455 still notes default OpenAI gpt-4o at wire time (pre-#12)
- L487 missing path parameter retries during wire

**Notes:** Proof score 2: unit/check/smoke green but live vendor key explicitly Unverified in dump (later closed by dogfood→#13/#14).

### QC-12 · PR #12 — Use gpt-5-nano for connected OpenAI BYOK Chat

- **bcId:** `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` · **state:** merged · **dump:** `/workspace/cloud-agent-transcripts/bc-423e80fe-fdab-5dce-b9a1-2514ac54b412.jsonl` · 262 lines
- **User turns:** L1
- **Scores:** plate=2 · proof=2 · stop=3 · partnership=1 · thrash_risk=0
- **Loops tags:** N020, N040, S020, S022
- **Cross-ref:** TM-H06, TM-S05, CD-H05, CD-S05

#### Plate present? **YES** · score 2/3 · Verified
- L1 user: cost outcome + cheapest model Flue/pi-ai actually registers; prefer nano; disconnected stay jon-local — outcome clear but less 'Phase N only' framing (score 2)

#### Proof / verify? **YES** · score 2/3 · Verified
- L1: pnpm check/smoke + catalog evidence; Return what still unverified (live throwaway turn); L262 catalog costs + check/smoke; live turn unverified

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L1: Do not invent model ids; do not wrap Flue; no process.env keys; no setProvider with captured key

#### Partnership signals · score 1/3 · Assumption
- L1 'Jonathan wants…' captain intent relayed
- Single-turn plate; no review loop in dump

#### Thrash moments · risk 0/3 · Verified
- Clean single-turn ship; catalog verify then constant swap (L195–L262)

**Notes:** Catalog proof strong; live routing proof absent — catch surfaced in #13 dogfood (Inference link).

### QC-13 · PR #13 — Use Flue instanceId so connected Chat selects OpenAI

- **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` · **state:** merged · **dump:** `/workspace/cloud-agent-transcripts/bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1.jsonl` · 360 lines
- **User turns:** L1, L70
- **Scores:** plate=3 · proof=3 · stop=3 · partnership=3 · thrash_risk=2
- **Loops tags:** N021, N030, N033, S030, S033
- **Cross-ref:** TM-H07, TM-H08, TM-S06, CD-H06, CD-S06, CD-S09

#### Plate present? **YES** · score 3/3 · Verified
- L1: live symptom plate (Gemini label vs gpt-5-nano); Find why; Do not implement unless one-line miss you can prove; Prefer diagnosis + smallest fix

#### Proof / verify? **YES** · score 3/3 · Verified
- L70 Jonathan empty OpenAI logs = negative proof; L360 cause + Inferred/Unknown labels + check/smoke; contract for instanceId vs conv_*

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L1: Do not wrap Flue; Do not log secrets; Do not implement unless proven one-line miss; L360 chat-auto conv_* miss left out of scope

#### Partnership signals · score 3/3 · Verified
- L1 captain live dogfood symptom packet
- L70 captain negative evidence (platform.openai.com/logs empty) → continue diagnosis

#### Thrash moments · risk 2/3 · Verified
- L40/L56: local checkout still gpt-4o / HEAD before PR12 — fetch origin/main (sync smell)
- Multiple ALS/miss hypotheses before instanceId root cause (L71–L249)

**Notes:** Diagnosis-first gold. Partnership negative-proof is transferable.

### QC-14 · PR #14 — Fail closed when Chat lacks a namespaced instance id

- **bcId:** `bc-b64a9488-2d46-5979-95e6-49c567df0721` · **state:** merged · **dump:** `/workspace/cloud-agent-transcripts/bc-b64a9488-2d46-5979-95e6-49c567df0721.jsonl` · 212 lines
- **User turns:** L1
- **Scores:** plate=3 · proof=2 · stop=3 · partnership=2 · thrash_risk=1
- **Loops tags:** N033, N064, S033, S064
- **Cross-ref:** TM-H09, TM-S07, CD-H07, CD-S07

#### Plate present? **YES** · score 3/3 · Verified
- L1: live BYOK user-verified → implement thermo-nuclear judo; numbered delete learnerIdFromExecution + fail-closed missing instanceId; Do not start Phase 4

#### Proof / verify? **YES** · score 2/3 · Verified
- L1: pnpm check + learner-key tests; live already user-verified upstream; L212 test:learner-key(4)+check passed; smoke skipped (not requested); Live Chat/Phase4 unverified in report

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L1: Do not start Phase 4; Do not paste vendor keys; Do not live Chat; hotel-safety constraints

#### Partnership signals · score 2/3 · Verified
- L1 captain: live Usage proof already done — do not hold for more dogfood
- Thermo-nuclear doc as shared plate artifact

#### Thrash moments · risk 1/3 · Verified
- L37 stale local vs origin/main fetch
- L62 flue wiki missing on VM — search siblings / FLUE_WIKI_PATH (env gap, not code thrash)

**Notes:** Proof 2: intentional smoke skip + honesty on unverified axes (good stop culture, verify gap).

### QC-15 · PR #15 — Phase 4: OpenRouter PKCE for learner BYOK

- **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` · **state:** open · **dump:** `/workspace/cloud-agent-transcripts/bc-28d7d9fb-7425-5efa-9900-afe78984d6bf.jsonl` · 736 lines
- **User turns:** L1, L410
- **Scores:** plate=3 · proof=2 · stop=3 · partnership=3 · thrash_risk=2
- **Loops tags:** N011, N033, N061, S011, S034, S061
- **Cross-ref:** TM-H10, TM-H11, TM-S08, CD-H08, CD-S08, CD-S11, CD-S12

#### Plate present? **YES** · score 3/3 · Verified
- L1: Phase 4 OpenRouter PKCE; constraints + stop on unproven load-bearing assumption; L410 thermo-nuclear judo plate (LearnerChatRoute only driver) — Do not merge

#### Proof / verify? **YES** · score 2/3 · Verified
- L1: pnpm check; L409 check+smoke + fake token endpoint; L410 openrouter/learner-key tests; live OpenRouter OAuth still Unverified

#### Stop / scope boundary? **YES** · score 3/3 · Verified
- L1: stop if load-bearing assumption unproven; no ChatGPT/Claude OAuth; keep hotel-safety + OpenAI paste; L410 Do not merge

#### Partnership signals · score 3/3 · Verified
- L1 'User said lets begin' after identity judo
- L410 'User said fix' + Do not merge — open-PR judo without merge pressure

#### Thrash moments · risk 2/3 · Verified
- L125 Node path conflicts exec-daemon/nvm
- L221 both-rows priority policy deliberation
- L374 rate-limiter double-consume + wildcard/connect route conflict risk (Hono 4)
- L381 test loader miss vs openai-key.test.mjs

**Notes:** Open in-flight. Stop-on-unproven + do-not-merge are gold partnership/stop signals.

---

## CD-* companion extracts (append-only; densest catalogs untouched)

Net-new relative to TM-* where noted. Counts: **10** happy · **12** smell.

### Nuggets (CD-H*)

#### CD-H01 — HAPPY · partnership/review · Verified
- **PRs:** [8] · **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb`
- **Socratink-relevance:** high · **Loops:** N050, N053
- **Title:** Confirmed/rejected validation table as review return shape
- **Evidence:** L497 user: Return validation table (confirmed/rejected per item) and the diff you shipped. L570 assistant: markdown table Item/Verdict/Evidence with Confirmed+Rejected rows (e.g. reject isHostedEnvironment extract).
- **Transfer:** Third-party review loops should demand a verdict table, not narrative agreement.
- **vs TM:** Deeper than TM-H02 — focuses on return-shape contract

#### CD-H02 — HAPPY · verify/honesty · Verified
- **PRs:** [9] · **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf`
- **Socratink-relevance:** high · **Loops:** N022, N044
- **Title:** Handoff lists Unverified axes next to Passed
- **Evidence:** L287 assistant: Passed test:credentials/check/smoke; Unverified: live Postgres, hosted missing-secret boot, GitHub CI; Brain/Flue wiki not on VM.
- **Transfer:** Every Ship close must pair Passed with explicit Unverified — prevents overclaim.
- **vs TM:** Net-new vs TM-H03 (which focused on plate/security)

#### CD-H03 — HAPPY · plate/stop · Verified
- **PRs:** [10] · **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2`
- **Socratink-relevance:** high · **Loops:** N012, N021
- **Title:** Isolation FAIL→stop / PASS→draft PR branch gate
- **Evidence:** L1 user: If isolation FAILS, stop — do not add complexity. If it PASSES, leave the test in the tree on a branch and open a draft PR. L336: PASS + draft #10.
- **Transfer:** Safety proofs need a binary gate that forbids complexity-on-failure.
- **vs TM:** Net-new emphasis on FAIL-stop branch vs TM-H04 prove statement

#### CD-H04 — HAPPY · partnership/pr-hygiene · Verified
- **PRs:** [11, 10] · **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2`
- **Socratink-relevance:** high · **Loops:** N012, N023
- **Title:** Prefer follow-up PR so proof PR stays reviewable
- **Evidence:** L337 user: Prefer a follow-up PR if that keeps the proof PR reviewable; otherwise extend the draft and retitle. L955: Proof PR #10 is unchanged.
- **Transfer:** Shared-agent multi-PR: freeze proof PR; wire in a sibling PR.
- **vs TM:** Sharpens TM-H05 with explicit reviewability motive

#### CD-H05 — HAPPY · verify/catalog · Verified
- **PRs:** [12] · **bcId:** `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412`
- **Socratink-relevance:** high · **Loops:** N020, N042
- **Title:** Model id chosen from live Flue/pi-ai catalog costs
- **Evidence:** L122–L195: contract that openaiChatModelId exists in OPENAI_MODELS; L262: gpt-5-nano via openaiProvider().getModels() $0.05/$0.40 — cheapest promo nano.
- **Transfer:** Specifier swaps need installed-catalog evidence, not marketing model lists.
- **vs TM:** Evidence depth on catalog contract beyond TM-H06

#### CD-H06 — HAPPY · verify/epistemics · Verified
- **PRs:** [13] · **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1`
- **Socratink-relevance:** high · **Loops:** N021, N022
- **Title:** Close labels Inferred vs Unknown in diagnosis handoff
- **Evidence:** L360 assistant: Inferred: gateway routed operator model to gemini-3-flash-preview. Unknown: live OpenAI turn after deploy; same conv_* miss in chat-auto (out of scope).
- **Transfer:** Hotfix reports must separate confirmed cause / inferred side-effect / unknown residual.
- **vs TM:** Net-new vs TM-H07/H08 (diagnosis + negative proof)

#### CD-H07 — HAPPY · partnership/stop · Verified
- **PRs:** [14] · **bcId:** `bc-b64a9488-2d46-5979-95e6-49c567df0721`
- **Socratink-relevance:** high · **Loops:** N033, N064
- **Title:** Live-verified then judo — do not hold for more dogfood
- **Evidence:** L1 user: Live OpenAI BYOK user-verified (Usage: 2 requests, 3512 tokens)… implement thermo-nuclear judo — do not hold for more dogfood. Do not start Phase 4 / live Chat.
- **Transfer:** After live proof, ship the fail-closed cleanup immediately; fence next phase.
- **vs TM:** Adds timing/stop-holding nuance beyond TM-H09

#### CD-H08 — HAPPY · stop/assumption · Verified
- **PRs:** [15] · **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf`
- **Socratink-relevance:** high · **Loops:** N011, S011
- **Title:** Stop-and-report on unproven load-bearing assumptions
- **Evidence:** L1 user: If a load-bearing Phase 4 assumption is unproven, stop and report it — do not code past it. L243/L409: assumptions held (PKCE, no client secret, first-slash specifier, openrouterProvider) so slice shipped.
- **Transfer:** OAuth/PKCE phases need an explicit assumption checklist with stop-on-miss.
- **vs TM:** Focuses assumption-gate mechanics vs TM-H10 safety framing

#### CD-H09 — HAPPY · proof/fixture · Verified
- **PRs:** [8] · **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb`
- **Socratink-relevance:** high · **Loops:** N040, N042
- **Title:** Smoke fixture cookie preserves Chat without Google/mail
- **Evidence:** L1 user: Smoke: test session fixture cookie so pnpm smoke still drives Chat. Do not require Google/mail. L370: Passed check/smoke including 401/403; browser local dist path noted.
- **Transfer:** Auth phases must keep unsigned/smoke path green via fixtures, not vendor login.
- **vs TM:** Net-new fixture-proof nugget

#### CD-H10 — HAPPY · review/debt-cut · Verified
- **PRs:** [9] · **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf`
- **Socratink-relevance:** high · **Loops:** N011, S011
- **Title:** Thermo review deletes dual-dialect soup into typed adapters
- **Evidence:** L288 user: Delete homemade dual-dialect SQL client… Typed CredentialDb with two adapters. L387: store only encrypts+lookup; fake-client Postgres $1 contract in tests.
- **Transfer:** Review can convert exploratory dual-dialect debt into typed adapter boundaries without widening phase.
- **vs TM:** Pairs with TM-S03 as the happy recovery path

### Smells (CD-S*)

#### CD-S01 — SMELL · thrash/edit · Verified
- **PRs:** [8] · **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb`
- **Socratink-relevance:** medium · **Loops:** S030, N030
- **Title:** Conflicting StrReplace leaves file reverted mid-impl
- **Evidence:** L302 assistant thinking: StrReplace operations on app.ts likely conflicted. Both replacements reported success, but the file reverted to its original state. Both changes will be applied…
- **Transfer:** Tripwire: if two edits 'succeed' but file unchanged, stop and re-read before more patches.
- **vs TM:** Net-new vs TM-S01 (scope re-ban)

#### CD-S02 — SMELL · debt/architecture · Verified
- **PRs:** [9] · **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf`
- **Socratink-relevance:** high · **Loops:** S011, S020
- **Title:** Homemade dual-dialect SQL client before typed CredentialDb
- **Evidence:** L288 thermo: Delete SqlClient.query / toPostgresSql / SELECT-RETURNING regex / untyped Record rows / copied second pg.Pool. First impl introduced this soup (L125–L183).
- **Transfer:** Library-first phases should ban regex SQL translators; demand typed adapters up front.
- **vs TM:** Root-cause depth on TM-S03 debt

#### CD-S03 — SMELL · design/conflict · Verified
- **PRs:** [10] · **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2`
- **Socratink-relevance:** high · **Loops:** S022, N022
- **Title:** Production resolve vs smoke jon-local design conflict
- **Evidence:** L100 assistant: critical design conflict — if production provider.ts resolves learner keys whenever ALS carries userId, smoke tests would fail…
- **Transfer:** Hotel-safety wiring must model smoke/unsigned as first-class paths, not afterthoughts.
- **vs TM:** Net-new design-conflict smell

#### CD-S04 — SMELL · missing_verify · Verified
- **PRs:** [10, 11] · **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2`
- **Socratink-relevance:** medium · **Loops:** S022, S044
- **Title:** Store not wired into live resolve — documented mid-run unknown
- **Evidence:** L305/L336: store not wired into live resolve so smoke stays jon-local; remaining unknowns include production fail-closed without stored key. L955 still lists live vendor key Unverified.
- **Transfer:** Do not market proof PR as full BYOK; keep unknown list in body/footer.
- **vs TM:** Aligns TM-S04 with explicit L-cites for both PRs

#### CD-S05 — SMELL · verify_gap · Inference
- **PRs:** [12] · **bcId:** `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412`
- **Socratink-relevance:** high · **Loops:** S022, S040
- **Title:** Catalog+check green without live routing dogfood
- **Evidence:** L262: Still unverified: a live throwaway OpenAI turn. Downstream #13 L1 live UI labeled Gemini — routing miss invisible to check/smoke.
- **Transfer:** Specifier/routing changes need live dogfood or explicit 'routing Unverified' stop in PR.
- **vs TM:** Same family as TM-S05 with cross-PR Inference labeled

#### CD-S06 — SMELL · identity/miss · Verified
- **PRs:** [13] · **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1`
- **Socratink-relevance:** high · **Loops:** S033, N033
- **Title:** Interceptor read conversationId (conv_*) not HTTP instanceId
- **Evidence:** L360: Flue latches useModel on first render; interceptor read ctx.conversationId (conv_*) so hasUserKey empty → latched jon-local → Gemini. Empty OpenAI logs match.
- **Transfer:** Flue intercepts must prefer namespaced instanceId; treat conv_* as non-learner.
- **vs TM:** Root-cause smell (TM covered diagnosis happy path)

#### CD-S07 — SMELL · missing_verify · Verified
- **PRs:** [14] · **bcId:** `bc-b64a9488-2d46-5979-95e6-49c567df0721`
- **Socratink-relevance:** medium · **Loops:** S040, S064
- **Title:** Smoke skipped; Phase 4 / live Chat left unverified
- **Evidence:** L212: pnpm test:learner-key + check passed; Did not live Chat, did not start Phase 4, did not run pnpm smoke. Flue wiki vault not on VM.
- **Transfer:** Narrow proof OK if Unverified axes listed — but smoke skip on identity change is a residual smell.
- **vs TM:** Same as TM-S07 — retained as CD for catalog companion completeness with loops tags

#### CD-S08 — SMELL · thrash/risk · Verified
- **PRs:** [15] · **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf`
- **Socratink-relevance:** medium · **Loops:** S011, S030
- **Title:** Rate-limit double-consume + Hono route conflict risk
- **Evidence:** L374 assistant: rate limiter could double-consume; wildcard and connect routes may conflict in Hono 4.
- **Transfer:** Auth route sprawl needs a conflict/rate-limit checklist before draft PR.
- **vs TM:** Same family TM-S08 — kept with loops cross-ref

#### CD-S09 — SMELL · thrash/sync · Verified
- **PRs:** [9, 13, 14] · **bcId:** `multi`
- **Socratink-relevance:** high · **Loops:** S013, N013
- **Title:** Phase-chain agents start on stale local main/checkout
- **Evidence:** #9 L48/L60 stale main vs Phase1; #13 L40/L56 local still gpt-4o before PR12; #14 L37 fetch origin/main because snapshot stale.
- **Transfer:** Mandatory fetch origin/main preflight on every phase-chain cloud agent.
- **vs TM:** Generalizes TM-S02 + TM-S06 across PRs

#### CD-S10 — SMELL · thrash/tooling · Verified
- **PRs:** [10] · **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2`
- **Socratink-relevance:** medium · **Loops:** S030
- **Title:** Test load failure attributed to missing TS loader
- **Evidence:** L284: The test failed due to an unknown issue… likely stems from a missing TypeScript loader. Retries with missing path params L271/L487.
- **Transfer:** New scripts/*.test.mjs need loader/import proof early; don't thrash path params first.
- **vs TM:** Net-new tooling thrash

#### CD-S11 — SMELL · thrash/env · Verified
- **PRs:** [15] · **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf`
- **Socratink-relevance:** low · **Loops:** S071
- **Title:** Node path conflicts between exec-daemon and nvm
- **Evidence:** L125: Node path conflicts between exec-daemon and nvm. Installing dependencies and inspecting pi-ai.
- **Transfer:** Cloud VM node toolchain conflicts burn tokens; pin PATH in agent packet.
- **vs TM:** Net-new env smell

#### CD-S12 — SMELL · scope/policy · Verified
- **PRs:** [15] · **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf`
- **Socratink-relevance:** high · **Loops:** S011, N011
- **Title:** Both-rows OpenAI+OpenRouter priority undecided mid-impl
- **Evidence:** L221: A priority policy is needed when both OpenAI paste and OpenRouter credentials exist. Later L410 judo forces LearnerChatRoute union + chrome copy rules.
- **Transfer:** Multi-provider BYOK needs driver-priority in the plate before coding chrome.
- **vs TM:** Net-new policy gap (judo later fixed)

---

## Paths

- `/workspace/socratink/research/chat-signal/agenteng-runs/cloud-pr-quality-cards.md`
- `/workspace/socratink/research/chat-signal/agenteng-runs/cloud-pr-quality-cards.json`
- Mirror: `/home/box/agent-data/grok-ship/reports/cloud-pr-quality-cards.md` + `.json`
- Companion cross-ref append: `cloud-pr-join-transcript-mine.md` § T3.2
- Densest catalogs: **not modified** (`happy-nuggets.*`, `smell-catalog-dense.*`)

---
*Researchy burn-tranche-3 executor · FM-AGENTENG-01 · T3.2 cloud-pr-quality-cards*

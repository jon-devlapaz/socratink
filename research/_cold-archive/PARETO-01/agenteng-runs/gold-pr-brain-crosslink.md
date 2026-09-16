# Gold PR ↔ Brain/pedagogy cross-link — FM-AGENTENG-01

- **As-of:** 2026-09-15 ~21:00 CT (America/Chicago)
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-2 T2.4 · research-only
- **Mode:** No PR · No SendToUser · No factory.db done · **Brain untouched**
- **Labels:** Verified / Assumption / Inference / Unknown
- **Companion JSON:** `gold-pr-brain-crosslink.json`

## Question

For gold PR chain **#8–#14** (merged happy follow-ups; **#15** open), what **shipped** vs what was **strategic** — and which Brain/pedagogy scorecard dimensions did each touch?

## Scorecard backdrop (from `brain-pedagogy-stratum`)

| Dimension | Score | Band |
| --- | ---: | --- |
| plate_quality | **1.1** | weak_population |
| partnership_gaps | **1.4** | thrash_dominant_when_present |
| pedagogy_faithfulness | **1.6** | doctrine_strong_runtime_thin |
| eval_rigor | **1.3** | package_gate_only |
| agenteng_transfer | **2.1** | strong_scout_transfer |

**Inference:** Gold chain is **partnership/auth (track A harness)**, not pedagogical-v0.01 product (track B). Highest relevance = plate + partnership + agenteng_transfer; pedagogy_faithfulness mostly untouched by these PRs.

## Summary — shipped vs strategic

| Bucket | PRs | Role |
| --- | --- | --- |
| **Strategic** | #8, #9, #10, #14 | Foundation / invariant / fail-closed governance |
| **Tactical** | #11, #12, #13 | Wire follow-up / cost / live-miss remediation |
| **Open (note)** | #15 | Phase 4 PKCE — in-flight; missing_verify |

**Headline (Verified + Inference):** Seven merged PRs shipped the auth/BYOK plate→proof→captain-merge recipe. Strategic value is the *phased authority + honest residual* pattern, not any single large diff. #15 tests whether habits hold on a bigger Phase 4 slice.

## Per-PR cross-link table

| PR | State | bcId (short) | Strategic? | Dim hits (P/R/G/E/T) | Shipped (compact) | Scorecard relevance |
| --- | --- | --- | --- | --- | --- | --- |
| **#8** | merged | `a4ea5a16…` | strategic | `PR·ET` | HttpOnly signed session cookie gate before agent router; Phase 1 sessi… | Primary transfer vehicle for Scout→Ship habits — Verifi |
| **#9** | merged | `4c71e723…` | strategic | `PR·ET` | Library-first encrypted credential store; Chat stays jon-local; Not-in… | Library-before-wire is core agenteng habit — Verified |
| **#10** | merged | `a6842fef…` | strategic | `PR·ET` | Hotel-safety overlap contract via test:learner-key; not paste UI; live… | Highest transfer lesson of chain for security-adjacent  |
| **#11** | merged | `a6842fef…` | tactical | `PR·ET` | Wire Phase 2 store into Chat; fail-closed missing key; smallest paste … | Follow-up-PR > widen pattern — Verified |
| **#12** | merged | `423e80fe…` | tactical | `PR··T` | Switch connected OpenAI specifier gpt-4o→gpt-5-nano (cheapest register… | Separable policy PR habit — Verified |
| **#13** | merged | `4e0ee7c0…` | tactical | `PR·ET` | Live miss fix: stored OpenAI but latched Gemini — read instanceId firs… | Phased recovery pattern — Verified |
| **#14** | merged | `b64a9488…` | strategic | `PR·ET` | Delete instanceId??conversationId sniff; error on missing/unparseable … | Gold chain terminal habit — Verified |
| **#15** | **open** | `28d7d9fb…` | strategic (open) | `PR·ET` | IN-FLIGHT: OpenRouter S256 PKCE + exclusive LearnerChatRoute; live Ope… | Live test of N062/N050 on Phase 4 — Inference |

Dim key: **P**=plate · **R**=partnership · **G**=pedagoGy · **E**=eval · **T**=transfer

## Detail (labels)

### #8 — Phase 1: signed HttpOnly session cookie, not BYOK

- **State:** `merged` · merged_at **2026-09-15 00:22 CT**
- **Branch:** `cursor/phase-1-session-cookie-41fb`
- **Merge commit:** `654e9bc27658…` · **Verified**
- **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` · **Verified** (PR footer)
- **Diff:** +613/−98 (24 files)
- **Shipped artifact:** HttpOnly signed session cookie gate before agent router; Phase 1 session only — not BYOK/store/OAuth · **Verified**
- **Proof:** pnpm check + smoke with fixture cookie
- **Jev:** stage=ship success=0.87 happy=0.87 verify=0.74 fail=none · **Verified**
- **FM-PRREV:** PASS (Verified)
- **Strategic vs tactical:** **strategic** — Foundation of auth/BYOK gold chain; establishes session identity before secrets/BYOK. Plate discipline exemplar for all follow-ups.
- **Dimensions:**
  - `plate` **HIT** — Gold /goal+proof+stop+Not-in-this-PR plate; phase fence explicit · **Verified**
  - `partnership` **HIT** — Cloud Ship + captain merge; no IDE thrash path · **Verified**
  - `pedagogy` **miss** — Auth/session infra — no pedagogical-v0.01 learner-state surface · **Verified**
  - `eval` **HIT** — Named contract proofs (check+smoke); not learner axiom evals · **Inference**
  - `transfer` **HIT** — Teaches plate→cloud→proof→captain-merge recipe for later phases · **Verified**
- **Scorecard relevance:**
  - `plate_quality`: Raises exemplar plate (contrast pop mean 1.1) — Verified
  - `partnership_gaps`: gap=none ship path; anti-thrash contrast — Verified
  - `pedagogy_faithfulness`: Untouched (lane A harness) — Verified
  - `eval_rigor`: Package/named-command gate only; shows partnership eval habit not learner E6–E8 — Inference
  - `agenteng_transfer`: Primary transfer vehicle for Scout→Ship habits — Verified
- **Brain notes:** Brain untouched this PR (Verified research posture). Jurisdiction fence held: code lane only.

### #9 — Phase 2: encrypted credential store, not BYOK

- **State:** `merged` · merged_at **2026-09-15 10:26 CT**
- **Branch:** `cursor/phase-2-secret-store-dbaf`
- **Merge commit:** `42d50f70344e…` · **Verified**
- **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` · **Verified** (PR footer)
- **Diff:** +688/−7 (7 files)
- **Shipped artifact:** Library-first encrypted credential store; Chat stays jon-local; Not-in-PR: wire resolve, PKCE, live Postgres · **Verified**
- **Proof:** test:credentials + check + smoke
- **Jev:** stage=impl success=0.85 happy=0.81 verify=0.71 fail=none · **Verified**
- **FM-PRREV:** PASS (Verified)
- **Strategic vs tactical:** **strategic** — Separates secret storage from Chat wire — prevents mid-flight BYOK sprawl. Strategic sequencing, not a polish tweak.
- **Dimensions:**
  - `plate` **HIT** — Library-first owner area named; Chat out of scope · **Verified**
  - `partnership` **HIT** — Phased authority: store before wire · **Verified**
  - `pedagogy` **miss** — Credential library ≠ learner pedagogy runtime · **Verified**
  - `eval` **HIT** — Named test:credentials contract before Chat wire · **Verified**
  - `transfer` **HIT** — N023 library-first pattern transferable to any secrets surface · **Verified**
- **Scorecard relevance:**
  - `plate_quality`: Strong Not-in-this-PR fences — Verified
  - `partnership_gaps`: Correct phase order (prove store before wire) — Verified
  - `pedagogy_faithfulness`: Untouched — Verified
  - `eval_rigor`: Contract-first habit (partnership eval) — Verified
  - `agenteng_transfer`: Library-before-wire is core agenteng habit — Verified
- **Brain notes:** No Brain mutation. Secrets stay code/host lane.

### #10 — Phase 3: prove overlapping Chat streams cannot mix learner keys

- **State:** `merged` · merged_at **2026-09-15 13:47 CT**
- **Branch:** `cursor/phase-3-hotel-safety-a4b2`
- **Merge commit:** `dd4cdab2b3a9…` · **Verified**
- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · **Verified** (PR footer)
- **Shared bcId with:** #11 · **Verified**
- **Diff:** +302/−2 (6 files)
- **Shipped artifact:** Hotel-safety overlap contract via test:learner-key; not paste UI; live store wiring deferred · **Verified**
- **Proof:** test:learner-key suite green; FM-PRREV CONCERN: unit path ≠ instrument path (residual recorded)
- **Jev:** stage=verify success=0.85 happy=0.79 verify=0.63 fail=none · **Verified**
- **FM-PRREV:** CONCERN recorded (Verified) — unit≠instrument residual
- **Strategic vs tactical:** **strategic** — Isolation proof is the security invariant gate of the chain. Strategic even with CONCERN — honesty about residual is the point.
- **Dimensions:**
  - `plate` **HIT** — Outcome = isolation invariant, not UI wish · **Verified**
  - `partnership` **HIT** — Proof PR before wire (#11); honest CONCERN · **Verified**
  - `pedagogy` **miss** — Learner-key isolation is safety infra, not pedagogical-v0.01 axiom eval · **Inference**
  - `eval` **HIT** — Closest gold-chain analog to falsifiable invariant gate; CONCERN = honest residual · **Verified**
  - `transfer` **HIT** — N021/N044: prove isolation before wire; record CONCERN · **Verified**
- **Scorecard relevance:**
  - `plate_quality`: Falsifiable Outcome exemplar — Verified
  - `partnership_gaps`: Anti proof-theater if CONCERN tracked (S044 antidote) — Verified
  - `pedagogy_faithfulness`: Indirect: models 'don't market green as closed' for later learner evals — Inference
  - `eval_rigor`: Shows package/contract gate + residual tracking; still not E6–E8 — Verified
  - `agenteng_transfer`: Highest transfer lesson of chain for security-adjacent Ships — Verified
- **Brain notes:** BP-S03/S044 adjacent: do not treat unit green as learner/prod closed. Brain untouched.

### #11 — Phase 3: wire stored OpenAI keys into Chat

- **State:** `merged` · merged_at **2026-09-15 13:50 CT**
- **Branch:** `cursor/phase-3-byok-a4b2`
- **Merge commit:** `102956529182…` · **Verified**
- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · **Verified** (PR footer)
- **Shared bcId with:** #10 · **Verified**
- **Diff:** +661/−22 (21 files)
- **Shipped artifact:** Wire Phase 2 store into Chat; fail-closed missing key; smallest paste UI; live vendor turn unverified · **Verified**
- **Proof:** learner-key + openai-key + check + smoke
- **Jev:** stage=impl success=0.83 happy=0.77 verify=0.63 fail=none · **Verified**
- **FM-PRREV:** n/a this PR (follow-up after #10 CONCERN context)
- **Strategic vs tactical:** **tactical** — Necessary wire after strategic isolation proof. Tactical execution of already-proven phase — still happy follow-up, not anti.
- **Dimensions:**
  - `plate` **HIT** — NEW plate after #10 — did not widen proof PR · **Verified**
  - `partnership` **HIT** — Happy follow-up; same bcId lineage as #10 · **Verified**
  - `pedagogy` **miss** — BYOK wire ≠ pedagogy product · **Verified**
  - `eval` **HIT** — Named proofs; honest live unverified · **Verified**
  - `transfer` **HIT** — N032: after proof, new plate for wire · **Verified**
- **Scorecard relevance:**
  - `plate_quality`: Demonstrates not-widen discipline — Verified
  - `partnership_gaps`: Shared-agent multi-PR lineage (#10+#11) — Verified
  - `pedagogy_faithfulness`: Untouched — Verified
  - `eval_rigor`: Honest Unverified live path — Verified
  - `agenteng_transfer`: Follow-up-PR > widen pattern — Verified
- **Brain notes:** Correction vs older loops mislabel: merged:true happy follow-up (Verified).

### #12 — Use gpt-5-nano for connected OpenAI BYOK Chat

- **State:** `merged` · merged_at **2026-09-15 17:05 CT**
- **Branch:** `cursor/cheapest-openai-b412`
- **Merge commit:** `74d3517ad2db…` · **Verified**
- **bcId:** `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` · **Verified** (PR footer)
- **Diff:** +21/−8 (3 files)
- **Shipped artifact:** Switch connected OpenAI specifier gpt-4o→gpt-5-nano (cheapest registered) · **Verified**
- **Proof:** chat-model + learner-key + check + smoke; live throwaway turn unverified
- **Jev:** stage=ship success=0.83 happy=0.75 verify=0.46 fail=none · **Verified**
- **FM-PRREV:** n/a (tiny cost policy)
- **Strategic vs tactical:** **tactical** — Cost/specifier tweak only. Strategic value is the *discipline* of keeping it tiny and separate — the change itself is tactical.
- **Dimensions:**
  - `plate` **HIT** — Tiny separable cost slice; own PR · **Verified**
  - `partnership` **HIT** — Cost policy not mixed into identity/store · **Verified**
  - `pedagogy` **miss** — Model cost ≠ pedagogy · **Verified**
  - `eval` **miss** — Thin verify_ok; not an eval lesson beyond named proofs · **Inference**
  - `transfer` **HIT** — H26: tiny cost/specifier as own PR · **Verified**
- **Scorecard relevance:**
  - `plate_quality`: Smallest-owner exemplar — Verified
  - `partnership_gaps`: Anti scope-creep into identity PRs — Verified
  - `pedagogy_faithfulness`: Untouched — Verified
  - `eval_rigor`: Weak live verify (unchecked) — Verified
  - `agenteng_transfer`: Separable policy PR habit — Verified
- **Brain notes:** None.

### #13 — Use Flue instanceId so connected Chat selects OpenAI

- **State:** `merged` · merged_at **2026-09-15 18:54 CT**
- **Branch:** `cursor/byok-instance-id-a4a1`
- **Merge commit:** `bd7c06cccca2…` · **Verified**
- **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` · **Verified** (PR footer)
- **Diff:** +67/−4 (2 files)
- **Shipped artifact:** Live miss fix: stored OpenAI but latched Gemini — read instanceId first (not conversationId) · **Verified**
- **Proof:** learner-key + check + smoke; live OpenAI turn unchecked
- **Jev:** stage=impl success=0.82 happy=0.73 verify=0.53 fail=none · **Verified**
- **FM-PRREV:** n/a (narrow identity remediation)
- **Strategic vs tactical:** **tactical** — Remediation from live miss. Sets up strategic #14 fail-closed; #13 itself is the corrective slice.
- **Dimensions:**
  - `plate` **HIT** — One causal fix; tiny diff · **Verified**
  - `partnership` **HIT** — Live observation → phased recovery PR · **Verified**
  - `pedagogy` **miss** — Flue identity selection ≠ learner pedagogy · **Verified**
  - `eval` **HIT** — Live miss drove fix; still honest unchecked live after · **Verified**
  - `transfer` **HIT** — H64: live obs → identity fix → fail-closed (#14) · **Verified**
- **Scorecard relevance:**
  - `plate_quality`: Smallest causal fix — Verified
  - `partnership_gaps`: Recovery without thrash widen — Verified
  - `pedagogy_faithfulness`: Untouched — Verified
  - `eval_rigor`: Observation-driven — Verified
  - `agenteng_transfer`: Phased recovery pattern — Verified
- **Brain notes:** None.

### #14 — Fail closed when Chat lacks a namespaced instance id

- **State:** `merged` · merged_at **2026-09-15 19:41 CT**
- **Branch:** `cursor/identity-judo-0721`
- **Merge commit:** `8289f0627afb…` · **Verified**
- **bcId:** `bc-b64a9488-2d46-5979-95e6-49c567df0721` · **Verified** (PR footer)
- **Diff:** +51/−68 (2 files)
- **Shipped artifact:** Delete instanceId??conversationId sniff; error on missing/unparseable instance id; fail-closed governance · **Verified**
- **Proof:** learner-key + check; smoke/live skipped this PR (author: live BYOK verified before harden)
- **Jev:** stage=verify success=0.78 happy=0.67 verify=0.42 fail=none · **Verified**
- **FM-PRREV:** n/a (governance harden after #13)
- **Strategic vs tactical:** **strategic** — Ends pre-#15 gold chain with fail-closed identity governance. Non-negotiable security posture — strategic harden, not polish.
- **Dimensions:**
  - `plate` **HIT** — Fail-closed when proof/identity thin · **Verified**
  - `partnership` **HIT** — Governance slice after remediation · **Verified**
  - `pedagogy` **miss** — Identity fail-closed ≠ pedagogical HELD/GAP · **Inference**
  - `eval` **HIT** — Removes fail-open path — analog to anti soft-HELD · **Inference**
  - `transfer` **HIT** — N033/S033: fail closed; parse instanceId only · **Verified**
- **Scorecard relevance:**
  - `plate_quality`: Stop-when-thin discipline — Verified
  - `partnership_gaps`: Anti fail-open to operator key — Verified
  - `pedagogy_faithfulness`: Transfer metaphor only (refuse soft success) — Inference
  - `eval_rigor`: Deletes sniff fallback = stronger gate — Verified
  - `agenteng_transfer`: Gold chain terminal habit — Verified
- **Brain notes:** Analog to BP-S05/S08 (soft success) in partnership lane — do not auto-promote thin identity.

### #15 — Phase 4: OpenRouter PKCE for learner BYOK

- **State:** `open` · not merged
- **Branch:** `cursor/phase-4-openrouter-pkce-d6bf`
- **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` · **Verified** (PR footer)
- **Diff:** +1173/−141 (23 files)
- **Shipped artifact:** IN-FLIGHT: OpenRouter S256 PKCE + exclusive LearnerChatRoute; live OpenRouter auth/Chat unverified · **Verified (open; not merged)**
- **Proof:** openrouter/learner-key/chat-model/openai-key/check/smoke named; live Unverified
- **Jev:** stage=impl success=0.55 happy=0.51 verify=0.39 fail=missing_verify · **Verified**
- **FM-PRREV:** pending / not closed (Inference)
- **Strategic vs tactical:** **strategic** — Phase 4 is the next strategic authority slice (OpenRouter PKCE). OPEN — not anti; not done. Carry #10 CONCERN forward.
- **Dimensions:**
  - `plate` **HIT** — Must continue only with plate+proof; don't widen mid-flight (N062) · **Verified**
  - `partnership` **HIT** — Next phase after #14; accept #10 residual explicitly · **Verified**
  - `pedagogy` **miss** — Learner BYOK OAuth infra still not pedagogical-v0.01 runtime · **Inference**
  - `eval` **HIT** — missing_verify flagged; live path Unverified — do not market closed · **Verified**
  - `transfer` **HIT** — Tests whether gold habits hold on larger Phase 4 diff · **Inference**
- **Scorecard relevance:**
  - `plate_quality`: At risk if mid-flight widen (watch S011) — Inference
  - `partnership_gaps`: Larger diff (+1173) needs cloud Ship discipline — Verified
  - `pedagogy_faithfulness`: Still harness/auth lane — Inference
  - `eval_rigor`: primary_failure=missing_verify — Verified
  - `agenteng_transfer`: Live test of N062/N050 on Phase 4 — Inference
- **Brain notes:** NOTE ONLY — not part of merged gold #8–#14. Brain untouched. Do not mark factory done.
- **NOTE:** Open in-flight; not a merged happy follow-up. Continue with plate+proof; FM-PRREV before treating closed.

## Shared-agent hard edge

- **#10 + #11 → `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2`** (**Verified**). Hotel-safety proof and BYOK wire are one cloud agent lineage.

## What this does NOT claim

- CloudAgent dump transcripts now **hard** on box for all 7 #8–#15 bcIds under `/workspace/cloud-agent-transcripts/` (as-of 2026-09-15 ~21:05 CT; see `cloud-pr-join.md`). IDE session∩PR still **none**. Mac live re-scan **Unknown**/parent-owned.
- No IDE session IDs invented (**Verified** gap).
- Gold chain did **not** raise pedagogy_faithfulness runtime score — doctrine still Scout-side (**Inference** from scorecard).
- Brain not mutated this run.

## Sources

- `cloud-pr-join.md/.json`
- `brain-pedagogy-stratum.md/.json`
- `pr-jev-summary.md`
- `FM-AGENTENG-01.md gold chain framing`
- `canonical-extract-index.md (N*/S* habits)`
- `evidence-chains.md units 4–5, 12`

---

**SUCCESS:** 7 merged PR rows + #15 note · strategic/tactical labeled · scorecard dims mapped · Brain untouched.

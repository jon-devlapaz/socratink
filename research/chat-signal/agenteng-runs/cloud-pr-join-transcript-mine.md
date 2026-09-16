# cloud-pr-join-transcript-mine — dump hard

**As-of:** 2026-09-15 21:05 CT  
**Mode:** research-only · companion to `cloud-pr-join.md`  
**Scope:** 7 unique #8–#15 bcId dumps under `/workspace/cloud-agent-transcripts/`  
**Counts:** n_happy=**11** · n_smell=**8** · total=**19** (≥8 required)  
**Policy:** Prefer/extend densest catalogs — **do not** overwrite `happy-nuggets.*` / `smell-catalog-dense.*`.

## Per-bcId dump status

| bcId | PRs | path | bytes | lines | nuggets |
| --- | --- | --- | ---: | ---: | --- |
| `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` | [8] | `/workspace/cloud-agent-transcripts/bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb.jsonl` | 746640 | 570 | TM-H01, TM-H02, TM-S01 |
| `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` | [9] | `/workspace/cloud-agent-transcripts/bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf.jsonl` | 596339 | 431 | TM-H03, TM-S02, TM-S03 |
| `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` | [10, 11] | `/workspace/cloud-agent-transcripts/bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2.jsonl` | 1395536 | 965 | TM-H04, TM-H05, TM-S04 |
| `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` | [12] | `/workspace/cloud-agent-transcripts/bc-423e80fe-fdab-5dce-b9a1-2514ac54b412.jsonl` | 268821 | 262 | TM-H06, TM-S05 |
| `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` | [13] | `/workspace/cloud-agent-transcripts/bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1.jsonl` | 687314 | 360 | TM-H07, TM-H08, TM-S06 |
| `bc-b64a9488-2d46-5979-95e6-49c567df0721` | [14] | `/workspace/cloud-agent-transcripts/bc-b64a9488-2d46-5979-95e6-49c567df0721.jsonl` | 312181 | 212 | TM-H09, TM-S07 |
| `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` | [15] | `/workspace/cloud-agent-transcripts/bc-28d7d9fb-7425-5efa-9900-afe78984d6bf.jsonl` | 1065870 | 736 | TM-H10, TM-H11, TM-S08 |

## Nuggets

### TM-H01 — HAPPY · plate · Verified
- **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` · PRs [8]
- **Socratink-relevance:** high
- **Title:** Phase-scoped plate with explicit non-goals + proof gate
- **Evidence:** L1 user: "Implement Socratink Phase 1 only… Do not implement BYOK, secret store, OAuth…" + "Proof: targeted tests… then `pnpm check` and `pnpm smoke`."
- **Transfer:** Ship briefs must name Phase slice, non-goals, and proof commands before tools.
### TM-H02 — HAPPY · partnership/verify · Verified
- **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` · PRs [8]
- **Socratink-relevance:** high
- **Title:** Third-party review validation loop (confirm/reject + ship fixes)
- **Evidence:** L497 user: validate third-party review of PR #8; "Return: validation table (confirmed/rejected per item) and the diff you shipped." L496 assistant closed prior thermo-nuclear review pass.
- **Transfer:** Crewmate review → agent validation table → warranted push is a transferable partnership pattern.
### TM-S01 — SMELL · scope_guard · Inference
- **bcId:** `bc-a4ea5a16-6426-55dc-82a6-e531aa8641fb` · PRs [8]
- **Socratink-relevance:** medium
- **Title:** Captain must re-ban helper extraction mid-flight
- **Evidence:** L497 user: "Do not extract an `isHostedEnvironment` helper (item 2). Do not add Redis. Do not add auth vendors."
- **Transfer:** Even tight Phase plates need follow-up anti-expansion constraints after review pressure.
### TM-H03 — HAPPY · plate/security · Verified
- **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` · PRs [9]
- **Socratink-relevance:** high
- **Title:** Library-first secret store + fail-closed hosted env
- **Evidence:** L1 user: app-encrypted Postgres AES-GCM; fail-closed like DATABASE_URL/SESSION_SECRET; "Proof: targeted tests, then `pnpm check` and `pnpm smoke`."
- **Transfer:** Credential phases should mandate fail-closed env parity and crypto library-first.
### TM-S02 — SMELL · thrash/sync · Verified
- **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` · PRs [9]
- **Socratink-relevance:** high
- **Title:** Stale local main vs merged prior phase
- **Evidence:** L48/L60 assistant: "Local `main` looks stale relative to the merged Phase 1 PR, so I’ll fetch remote `main` and branch from that."
- **Transfer:** Cloud agents must fetch origin/main before implementing on phase chains; document as preflight.
### TM-S03 — SMELL · debt · Verified
- **bcId:** `bc-4c71e723-5ce0-5c7d-bc73-c14eba01dbaf` · PRs [9]
- **Socratink-relevance:** medium
- **Title:** Temporary SQLite dialect adapter for tests
- **Evidence:** L125 assistant: thin SQL dialect adapter for temporary node:sqlite; Postgres for production.
- **Transfer:** Test dual-dialect adapters are acceptable debt if scoped; risk of UPSERT/ON CONFLICT thrash (L183).
### TM-H04 — HAPPY · plate/verify · Verified
- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · PRs [10, 11]
- **Socratink-relevance:** high
- **Title:** Hotel-safety acceptance as prove-first plate
- **Evidence:** L1 user: "Prove hotel-safety… two overlapping Chat streams plus one recovery… must never put Alice’s key on Bob’s wire."
- **Transfer:** Multi-tenant safety slices should lead with a concrete prove statement, not UI/OAuth scope.
### TM-H05 — HAPPY · safety/partnership · Verified
- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · PRs [10, 11]
- **Socratink-relevance:** high
- **Title:** Same bcId: proof PR then wire PR; fail-closed replace operator fallback
- **Evidence:** L800 assistant: throws when userId missing while store provided (replaces operator fallback). L955: PR #11 wires key; "Proof PR #10 is unchanged."
- **Transfer:** Shared-agent multi-PR lineage works when proof PR stays frozen and wire PR cites it.
### TM-S04 — SMELL · missing_verify · Verified
- **bcId:** `bc-a6842fef-28ff-5c78-9c82-9337ac5ea4b2` · PRs [10, 11]
- **Socratink-relevance:** medium
- **Title:** Documented remaining unknown for full BYOK mid-run
- **Evidence:** L305 assistant: resolve does not pass the store — "documented as a remaining unknown for full BYOK."
- **Transfer:** Unknowns must be explicit in PR proof; do not treat draft PR as full BYOK closure.
### TM-H06 — HAPPY · plate/discipline · Verified
- **bcId:** `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` · PRs [12]
- **Socratink-relevance:** high
- **Title:** Cost-plate: cheapest promo-eligible model with catalog proof
- **Evidence:** L1 user: change hardcoded openai/gpt-4o → cheapest promo nano. L262 assistant: openai/gpt-5-nano via pi-ai catalog costs; unsigned stay jon-local; PR #12.
- **Transfer:** Model swaps need catalog evidence + explicit disconnected path preserved.
### TM-S05 — SMELL · verify_gap · Inference
- **bcId:** `bc-423e80fe-fdab-5dce-b9a1-2514ac54b412` · PRs [12]
- **Socratink-relevance:** high
- **Title:** Model-id change without live routing proof (caught by #13)
- **Evidence:** Transcript closes on catalog+check/smoke; live dogfood later showed Gemini label (#13 L1). No live OpenAI Usage proof in #12 dump.
- **Transfer:** Specifier changes need a live dogfood proof or explicit "unverified live routing" stop.
### TM-H07 — HAPPY · verify/plate · Verified
- **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` · PRs [13]
- **Socratink-relevance:** high
- **Title:** Diagnosis-first: prove root cause before implement
- **Evidence:** L1 user: find why Gemini won; "Do not implement unless the cause is a one-line miss you can prove." L360: Flue latches useModel on first render; interceptor read conversationId not instanceId.
- **Transfer:** Hotfix briefs should require diagnosis+contract proof before code.
### TM-H08 — HAPPY · partnership/verify · Verified
- **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` · PRs [13]
- **Socratink-relevance:** high
- **Title:** External empty OpenAI logs as negative proof
- **Evidence:** L70 user: Jonathan confirmed platform.openai.com/logs empty → request never reached OpenAI; continue diagnosis.
- **Transfer:** Captain-supplied negative evidence (empty provider logs) is a high-signal verify partnership move.
### TM-S06 — SMELL · thrash/sync · Verified
- **bcId:** `bc-4e0ee7c0-31ef-5b02-8169-7a73e79ea4a1` · PRs [13]
- **Socratink-relevance:** high
- **Title:** Stale checkout misread PR12 (local still on gpt-4o)
- **Evidence:** Assistant thinking ~L40/L56: chat-model still gpt-4o locally; HEAD before PR12; fetch origin/main required.
- **Transfer:** Same sync smell as #9 — phase-chain agents need mandatory fetch preflight.
### TM-H09 — HAPPY · safety/plate · Verified
- **bcId:** `bc-b64a9488-2d46-5979-95e6-49c567df0721` · PRs [14]
- **Socratink-relevance:** high
- **Title:** Fail-closed identity judo after live BYOK verified
- **Evidence:** L1 user: live OpenAI BYOK user-verified; delete learnerIdFromExecution; missing parseable instanceId on agent ops must error not fail-open.
- **Transfer:** Identity fail-closed after live proof is the gold safety pattern for Flue intercepts.
### TM-S07 — SMELL · missing_verify · Verified
- **bcId:** `bc-b64a9488-2d46-5979-95e6-49c567df0721` · PRs [14]
- **Socratink-relevance:** medium
- **Title:** Smoke skipped; Phase 4 / live Chat left unverified in report
- **Evidence:** L208 assistant: smoke skipped (not requested); Live Chat and Phase 4 remain unverified; flue wiki vault not located.
- **Transfer:** PR close reports must list unverified axes explicitly — good honesty, still a verify gap.
### TM-H10 — HAPPY · plate/safety · Verified
- **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` · PRs [15]
- **Socratink-relevance:** high
- **Title:** Stop on unproven load-bearing assumptions; keep hotel-safety
- **Evidence:** L1 user: "If a load-bearing Phase 4 assumption is unproven, stop and report it"; keep hotel-safety (no process.env learner keys, no Models.login…).
- **Transfer:** PKCE/OAuth phases need explicit stop-on-unproven + inherited safety invariants.
### TM-H11 — HAPPY · partnership · Verified
- **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` · PRs [15]
- **Socratink-relevance:** high
- **Title:** Thermo-nuclear judo follow-up on same open PR (no merge)
- **Evidence:** L410 user: "User said fix. Implement the thermo-nuclear judo on PR 15… Do not merge." LearnerChatRoute as only Chat-driver.
- **Transfer:** Open-PR judo without merge-pressure preserves plate; captain "fix" + "do not merge" is partnership hygiene.
### TM-S08 — SMELL · thrash/risk · Verified
- **bcId:** `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` · PRs [15]
- **Socratink-relevance:** medium
- **Title:** Route/rate-limit conflict risks during PKCE wiring
- **Evidence:** L374 assistant: rate limiter could double-consume; wildcard and connect routes may conflict in Hono 4.
- **Transfer:** Auth route sprawl needs conflict checklist before opening draft PR.

## Notes

- Shared bc `#10+#11` mined once; nuggets tagged both PRs.
- IDE session∩PR still **none** — mine is transcript-axis only.
- Labels: **Verified** = direct dump evidence; **Inference** = cross-PR / downstream reading; **Assumption** unused here; **Unknown** unused.

---
*Researchy burn-tranche · FM-AGENTENG-01 · transcript mine*

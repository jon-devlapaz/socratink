---
title: "Phase #15 decision memo — FM-AGENTENG-01 (T5.1)"
source_url: "file:///workspace/socratink/research/chat-signal/wiki-source/agenteng/ops/phase15-decision-memo.md"
source_kind: "agenteng-documentation"
generated: true
synced_at: "2026-09-16T02:33:24Z"
content_hash: "a6c1430059e806e4b23f9a7e07e7d7f90809d830c8a5dee5de54c05ac735707d"
---

# Phase #15 decision memo — FM-AGENTENG-01 (T5.1)

- **As-of:** 2026-09-15 21:13 CT (America/Chicago)
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-5 · T5.1
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac sync skipped
- **Companion JSON:** `phase15-decision-memo.json`
- **Question:** Stress-test captain brief vs live **#15** — merge-blockers + hold/split/merge-after-X?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**

---

## 0. Executive decision

| Field | Value | Label |
| --- | --- | --- |
| **PR** | [#15 Phase 4: OpenRouter PKCE for learner BYOK](https://github.com/jon-devlapaz/socratink/pull/15) | **V** (GitHub MCP get @ as-of) |
| **Live state** | **open** · draft=false · merged=false · mergeable_state=`clean` | **V** |
| **Head / base** | `1896c4bc06f7…` · `main` @ `8289f0627afb…` (#14 tip) | **V** |
| **Diff** | **+1173 / −141** · **23** files · **2** commits | **V** |
| **CI** | `verify` **success** · Vercel Preview Comments **success** (completed ~20:38 CT) | **V** |
| **QC dims** | plate=3 · proof=2 · stop=3 · partnership=3 · thrash_risk=2 | **V** (QC-15) |
| **Jev** | stage=impl · success=0.55 · verify=0.39 · fail=`missing_verify` | **V** (gold-crosslink) |
| **FM-PRREV** | pending / not closed on tip | **I** |
| **Recommendation** | **hold** → **merge-after-X** (see §3) | **I** |

**One-liner (I):** Captain-brief culture advice still holds (plate→proof→FM-PRREV→captain merge→new `/goal`), but live **#15** is a **size-outlier auth PR** the brief only caveats thinly — treat as **hold** until FM-PRREV + #10 CONCERN carry + explicit residual ticket; **split** only if review thrash exposes >1 owner area.

---

## 1. Merge-blockers checklist (gold habits)

Grounded in gold `#8–#14` habits + onepager **N***/**S*** + watch-card risks. Verdict = gate for Captain merge claim (not for “keep watching”).

| ID | Blocker (gold habit) | #15 evidence | Verdict | Label |
| --- | --- | --- | --- | --- |
| **MB01** | **N050** — FM-PRREV / adversarial on auth/BYOK tip before “proof closed” | No closed FM-PRREV on tip `1896c4bc`; gold #8/#9/#10 had review posture | **FAIL** | **I** (pending) / **V** habit |
| **MB02** | **N044**/**S044** — carry #10 CONCERN (unit≠instrument); do not market closed | Start-tomorrow P0 + gold-crosslink require explicit carry; #15 review table not yet recording residual | **FAIL** | **V** requirement · **I** not-yet-on-#15 |
| **MB03** | **N040**/**S022**/**CD-S04** — named proofs + honest Unverified live (CI ≠ live) | PR body lists `test:openrouter`+learner-key+chat-model+openai-key+check+smoke; live OpenRouter OAuth/Chat **Unverified** | **PASS** (honesty) | **V** |
| **MB04** | Package CI gate green on tip | Actions `verify` success + Vercel Preview Comments success | **PASS** | **V** |
| **MB05** | **N010**/**N011** — `/goal`+proof+stop+Not-in-this-PR fences held | L1 plate + L410 judo “Do not merge”; ChatGPT/Claude OAuth / Flue out-of-scope | **PASS** | **V** |
| **MB06** | **N030** — smallest owner / tiny causal fix (gold max additions **688** #9) | **+1173** ≈ **1.7×** gold max · **~3.4×** mean; 23 files near #8 span | **FAIL** (size stress) | **V** metrics · **I** as merge risk |
| **MB07** | **N032**/**N011** — follow-up PR > widen (#10→#11); split chrome vs write path if thrash | Judo pushed on **same** PR (“Push to PR 15”); no sibling split yet | **UNKNOWN** | **A**/I — split trigger not fired |
| **MB08** | **N023** — library-first then wire (#9→#11) | Store already existed; PKCE+route union+chrome compressed into one open PR | **FAIL** (compressed) | **I** vs gold sequencing |
| **MB09** | **N031**/**S031**/**R2** — merge-bound auth → cloud Ship; refuse IDE | Branch `cursor/phase-4-…`; IDE∩#15=none; cloud bcId hard dump | **PASS** | **V** |
| **MB10** | **N033**/hotel-safety constraints restated; base inherits #14 fail-closed | Base = #14 tip; PR restates hotel-safety + OpenAI paste; openrouterProvider store-only | **PASS** | **V** |
| **MB11** | Partnership stop — do-not-merge judo without merge pressure | L410 thermo-nuclear judo; open + clean but not merged | **PASS** | **V** |
| **MB12** | **CD-S12** — both-rows driver policy in plate (not mid-impl only) | Priority decided mid-impl (L221 OpenRouter prefers); later chrome tests both-rows | **PASS** (landed) / was smell | **V** thrash · **I** closed-enough for gate |
| **MB13** | Hosted callback origin / headed click-through | Named Unverified in dump L409/L736; Actions green ≠ origin closed | **UNKNOWN** | **U**/V |
| **MB14** | **N062** — next phase = new `/goal` (never continue #15 thread after merge) | Pre-merge habit; N/A until after merge | **N/A** (post-merge) | **V** habit |
| **MB15** | mergeable_state clean + tip SHA stable for review | `clean`; tip still `1896c4bc…` since watch card | **PASS** | **V** |

### Checklist rollup

| Bucket | IDs | Count |
| --- | --- | ---: |
| **FAIL** (block merge claim) | MB01, MB02, MB06, MB08 | **4** |
| **UNKNOWN** (needs Captain call / more evidence) | MB07, MB13 | **2** |
| **PASS** | MB03–MB05, MB09–MB12, MB15 | **8** |
| **N/A** | MB14 | **1** |

**Inference:** Soft culture gates (plate/stop/CI/honesty/cloud path) **pass**. Hard Captain-merge gates (**review**, **#10 residual**, **size/sequencing stress**) **fail or unknown** → not merge-ready gold.

---

## 2. Recommendation

### Primary: **hold**

Do **not** merge #15 now. Auth/BYOK + size outlier + open FM-PRREV + #10 CONCERN carry unpaid (**I** from N050/N044/N030 + watch R-SIZE/R-LIVE/R-10/R-REVIEW).

### Path: **merge-after-X**

Merge only after **all** of:

| X# | Gate | Owner | Label |
| ---: | --- | --- | --- |
| **X1** | FM-PRREV / adversarial table on tip `1896c4bc` with confirmed/rejected rows | Ship-cloud + FM-PRREV | **I**/V habit |
| **X2** | Explicit **#10 CONCERN** residual ticket (or checklist row) — unit≠instrument not marketed closed | Firstmate / Captain | **V** |
| **X3** | Live OpenRouter remains labeled **Unverified** (optional dogfood ticket; CI green ≠ live closed) | Captain | **V** |
| **X4** | If FM-PRREV finds >1 owner-area thrash (chrome/copy vs PKCE write vs resolve/priority): **split** follow-up PR before merge — else keep single PR | Ship-cloud | **I** |
| **X5** | Refuse IDE-local merge-bound edits; captain merges cloud tip only | Firstmate | **V** |

### Conditional: **split** (not default)

**Split** only if X4 fires — e.g. review thrash across PKCE connect/callback **and** chrome/`chat-route` kind copy **and** both-rows priority. Default gold habit is follow-up PR > widen (**N032**), but splitting a green open PR without thrash evidence is premature (**A**).

### Not recommended: bare **merge**

CI green + mergeable `clean` is **necessary not sufficient** for auth Phase 4 (**V** N050/#10 lesson).

```text
#15 open + auth/BYOK + size > gold max?
  YES → HOLD. Force Ship/cloud + FM-PRREV (no IDE).
FM-PRREV done AND #10 CONCERN tracked AND live Unverified explicit?
  NO  → still HOLD (CI green ≠ closed).
  YES → merge-after-X; SPLIT only if multi-owner thrash.
After merge?
  ALWAYS new /goal — never continue #15 thread (N062).
```

---

## 3. Stress gaps — captain brief thin vs #15 reality

Captain brief (`FM-AGENTENG-01-captain-brief.md`, as-of 2026-09-15 21:09 CT) is an **operating kit**, not a merge gate. Stress-test vs live #15:

| Gap ID | Captain-brief advice | #15 live reality | Stress | Label |
| --- | --- | --- | --- | --- |
| **G1** | §3 `#15` caveat: “in-flight (`missing_verify`); plate+proof; don’t widen; carry #10; FM-PRREV before closed” — **one paragraph** | Watch card shows **10 risks**, size **+71% over gold max**, QC thrash moments L125/L221/L374/L381 | Brief under-specifies size/thrash merge criteria | **V** brief thin · **I** gap |
| **G2** | IDE vs Ship rubric R1–R3 forces Ship for auth/multi-file — good | #15 already on cloud; rubric silent on **when to split an already-open large cloud PR** | No post-open split trigger in brief | **I** |
| **G3** | One-liner loop: plate→tripwire→FM-PRREV→captain merges→new `/goal` | Loop assumes merge after review; does not name **tip SHA**, **CONCERN checklist row**, or **CI≠live** as explicit blockers | Missing merge-blockers checklist (this memo fills) | **I** |
| **G4** | Gold habits table praises #9 library-first + #11 follow-up wire | #15 **compresses** PKCE write + route union + chrome into one diff (+1173/23 files) | Brief does not reconcile N023/N032 with Phase 4 authority slice size | **V**/I |
| **G5** | Top smells cite **CD-S12** (both-rows undecided mid-impl) | #15 decided OpenRouter-prefers mid-impl (L221) then locked in tests — smell → landed policy | Brief lists smell but not “how #15 recovered” | **V** |
| **G6** | **S044**/**N044** “do not treat #10 CONCERN closed before #15” (via onepager paste order) | Brief §4 lists S044; does not say **where** residual must appear (PR body / FM-PRREV / ticket) | Residual placement underspecified | **I** |
| **G7** | Jev/`missing_verify` mentioned only as open caveat | Package **CI verify success** coexists with Jev `missing_verify` + live Unverified | Brief does not teach Captain to separate **Actions green** vs **live/instrument verify** | **V**/I |
| **G8** | Tomorrow kit = goal template + thrash tripwire + onepager | No artifact tells Captain “poll #15 / run blockers checklist” | Watch card + this memo are the missing ops layer | **I** |

**Headline stress (I):** Brief is **correct but thin** on #15 — culture direction matches gold; decision surface for a **1.7×-max auth PR** lives in watch card + this memo, not in the brief’s one-paragraph caveat.

---

## 4. What still holds (brief ↔ #15 agreement)

| Agreement | Evidence | Label |
| --- | --- | --- |
| Force Ship/cloud for auth/BYOK | #15 on `cursor/*`; IDE∩none | **V** |
| Plate+stop+Not-in-this-PR | L1 + L410; out-of-scope OAuth/Flue | **V** |
| Named proofs + honest Unverified | PR Proof + Out of scope sections | **V** |
| Do not market #10 CONCERN closed | Start-tomorrow P0; gold #10 residual | **V** |
| FM-PRREV before treating closed | Still pending — brief correctly anticipates | **V**/I |
| After merge: new `/goal` (N062) | Still the right next-phase rule | **V** |

---

## 5. Sources

- `phase15-watch-card.md/.json` (T4.4)
- `FM-AGENTENG-01-captain-brief.md`
- `gold-pr-brain-crosslink.md` (#15 open note + #8–#14)
- `cloud-pr-quality-cards.md` · QC-15 + CD-S04/S12
- `cloud-pr-join.md` (#15 row · bc-28d7d9fb…)
- `ide-vs-cloud-ship.md` (R1–R6)
- `start-tomorrow-onepager.md` (N050/N044/N062/N030/N032/S044/S031)
- GitHub MCP `pull_request_read` get + get_check_runs (read-only, as-of)

---

## 6. Success check

- [x] Decision memo with merge-blockers checklist (pass/fail/unknown)
- [x] Recommendation: **hold** / conditional **split** / **merge-after-X**
- [x] Stress gaps: captain-brief thin vs #15 reality
- [x] Labels Verified/Assumption/Inference/Unknown
- [x] Brain untouched · factory not done · no PR · no SendToUser · Mac skipped
- [x] Mirrored under `/home/box/agent-data/grok-ship/reports/`

---

*Researchy burn-tranche-5 executor · FM-AGENTENG-01 · T5.1 phase15-decision-memo*

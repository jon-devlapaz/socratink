# Phase #15 open watch card — FM-AGENTENG-01 (T4.4)

- **As-of:** 2026-09-16 02:11 CT
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-4 · T4.4
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac sync skipped
- **Companion JSON:** `phase15-watch-card.json`
- **Question:** Size/scope risk of open Phase 4 PR **#15** vs gold pattern **#8–#14** — what should Captain do next?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**

---

## 0. Executive watch status

| Field | Value | Label |
| --- | --- | --- |
| **PR** | [#15 Phase 4: OpenRouter PKCE for learner BYOK](https://github.com/jon-devlapaz/socratink/pull/15) | **V** (GitHub MCP get) |
| **State** | **open** · draft=false · mergeable_state=`clean` · merged=false | **V** |
| **Branch / head** | `cursor/phase-4-openrouter-pkce-d6bf` · `1896c4bc06f7…` | **V** |
| **Base** | `main` @ `8289f0627afb…` (#14 merge tip) | **V** |
| **bcId** | `bc-28d7d9fb-7425-5efa-9900-afe78984d6bf` | **V** (PR footer) |
| **Transcript** | hard dump · 1 065 870 B / **736** lines | **V** |
| **Diff** | **+1173 / −141** · **23** files · **2** commits | **V** |
| **Created / updated** | 2026-09-15 19:57 CT · 2026-09-15 20:39 CT | **V** (API Z→CT) |
| **CI checks** | `verify` **success** · Vercel Preview Comments **success** (completed ~20:38 CT) | **V** |
| **QC dims** | plate=**3** · proof=**2** · stop=**3** · partnership=**3** · thrash_risk=**2** | **V** (quality-cards) |
| **Jev (pack)** | stage=impl · success=0.55 · happy=0.51 · verify=0.39 · fail=`missing_verify` | **V** (gold-crosslink) |
| **FM-PRREV** | pending / not closed | **I** |
| **Strategic?** | **strategic (open)** — Phase 4 authority slice | **V**/I |

**One-liner (I):** #15 keeps gold plate/stop/partnership habits and CI `verify` is green, but it is **~1.7× the largest gold addition** and still carries **live OpenRouter Unverified** + **#10 CONCERN residual** — treat as watch, not merge-ready gold.

---

## 1. Scope (what landed / fences)

### 1.1 In-scope landed (PR body · Verified)

- `POST /api/openrouter/connect` — PKCE start; verifier in signed HttpOnly cookie
- `GET /api/openrouter/callback` — server code exchange → store minted key as `credentialRef`
- `DELETE /api/openrouter` + OpenAI PUT/DELETE remain the two write paths
- `GET /api/chat-route` sole Chat-driver status: `{ kind: 'operator' | 'openai' | 'openrouter', openai, openrouter }`
- Chrome copy gated by `kind` (stored-but-not-driving ≠ driving claim)
- Split resolve: operator path never sees store; stored path requires named `'openai' | 'openrouter'`
- `openrouterProvider()` auth = store resolve only (no Models.login / env / captured setProvider)
- OpenAI paste BYOK + unsigned/smoke stay `jon-local`

### 1.2 Explicit out-of-scope / Unverified (V)

- ChatGPT Plus / Claude.ai / Gemini app OAuth
- **Live** OpenRouter authorization or live Chat turn with minted key
- Changing Chat tools / wrapping Flue
- Hosted callback origin / headed click-through (**U**/named Unverified in dump L409/L736)
- Note: GitHub Actions `verify` on tip is **green** (**V**) — that does **not** close live OAuth

### 1.3 Plate discipline signals (V · dump)

| Turn | Signal |
| --- | --- |
| **L1** | Phase 4 start; stop-on-unproven load-bearing assumption; keep hotel-safety + OpenAI paste; no ChatGPT/Claude OAuth |
| **L243** | Assumptions held checklist (PKCE, no client secret, first-slash specifier, openrouterProvider) |
| **L410** | Thermo-nuclear judo plate — LearnerChatRoute only driver; **Do not merge** |
| **L736** | Judo pushed; still Unverified live axes |

---

## 2. Size signals vs gold #8–#14

| Metric | #15 (open) | Gold #8–#14 | Risk read |
| --- | ---: | --- | --- |
| Additions | **1173** | min 21 · median 302 · max **688** (#9) · mean **343** | **+71% over gold max** · **~3.4× mean** — **I** size outlier |
| Deletions | 141 | gold max del 98 (#8) / 68 (#14) | Larger rewrite surface — **I** |
| Changed files | **23** | min 2 · max **24** (#8) · mean 9.3 | Near #8 file span; not tiny — **V** |
| Net lines | +1032 | gold net sum ~+2194 across 7 PRs | One PR ≈ **47%** of entire gold net — **I** |
| Commits | **2** | (phase dumps often multi-turn) | Two-turn: land + judo — **V** |
| Transcript lines | **736** | gold unique bc: 212–965 | Mid-high effort; below shared #10/#11 965 — **V** |
| Transcript bytes | ~1.07 MB | gold unique: 0.27–1.40 MB | Large but not max — **V** |

### Gold pattern contrast (habits held vs size breach)

| Habit (gold) | #15 | Label |
| --- | --- | --- |
| `/goal`+proof+stop+Not-in-this-PR | **Held** (L1 + L410) | **V** |
| Named contract proofs | **Held** (`test:openrouter` + learner-key + chat-model + openai-key + check + smoke) | **V** |
| Honest Unverified live | **Held** | **V** |
| Do-not-merge until Captain | **Held** (L410 judo) | **V** |
| Package CI gate | **Held** (`verify` success) | **V** |
| Smallest owner / N030 | **Stressed** — single Phase 4 PR absorbs PKCE + route union + chrome + resolve split | **I** |
| Follow-up PR > widen (#10→#11) | **Partial** — judo stayed on same PR (explicit "Push to PR 15") vs sibling | **A**/I |
| Library-first (#9) then wire (#11) | **Compressed** — store already existed; PKCE+wire+chrome in one open PR | **I** |
| Fail-closed identity (#14) | **Inherited** base = #14 tip; hotel-safety constraints restated | **V** |
| FM-PRREV on auth before closed | **Not done** | **I** |

**Inference:** Quality dims match gold *culture*; **size** is the primary watch risk — Phase 4 may want a follow-up split if review thrash appears (proof theater / too many owners in one diff).

---

## 3. Risks vs gold pattern

| ID | Risk | Severity | Evidence | Label |
| --- | --- | ---: | --- | --- |
| **R-SIZE** | Diff larger than any merged gold slice | **High** | +1173 vs gold max +688 | **V**/I |
| **R-LIVE** | Live OpenRouter OAuth/Chat still Unverified | **High** (merge honesty) | PR body + L409/L736 | **V** |
| **R-10** | Carry #10 FM-PRREV CONCERN (unit≠instrument) into Phase 4 close | **High** | start-tomorrow N044/S044; gold-crosslink | **V** |
| **R-PROOF** | proof dim=2 (solid named tests; live gap) · Jev `missing_verify` | **Med** | QC-15; jev 0.39 | **V** |
| **R-THRASH** | thrash_risk=2 — Node path, both-rows priority, Hono rate-limit/route, test loader | **Med** | QC L125/L221/L374/L381 | **V** |
| **R-PRIORITY** | Both-rows OpenAI+OpenRouter policy decided mid-impl (OpenRouter prefers) | **Med** | L221; CD both-rows | **V** |
| **R-REVIEW** | No closed FM-PRREV / adversarial on #15 tip yet | **Med** | pending | **I** |
| **R-CI** | Hosted callback origin Unverified (Actions `verify` already green) | **Low**/U | MCP check_runs success; dump Unverified origin | **V**/U |
| **R-WIDEN** | Temptation to add ChatGPT/Claude OAuth or Flue wrap mid-open | **Low** if fences hold | L1/L410 stop | **V** (fenced) |
| **R-IDE** | IDE thrash path for auth merge | **Low** if Captain forces cloud | ide-vs-cloud R2; IDE∩#15=none | **V** |

### What is *not* a risk (held gold signals)

- Stop-on-unproven assumption gate (**CD-H08**) — **V**
- Do-not-merge judo without merge pressure — **V**
- Hard bcId + dump join (no invented IDE ids) — **V**
- Hotel-safety constraints restated on every user turn — **V**
- GitHub Actions `verify` green on tip — **V**

---

## 4. Recommended Captain moves (ordered)

| # | Move | Owner wake | Why | Label |
| ---: | --- | --- | --- | --- |
| **1** | **Do not merge #15** until FM-PRREV / adversarial on tip `1896c4bc` | Ship-cloud + review | Auth/BYOK + size outlier; N050 | **I** from packs |
| **2** | Explicitly **carry #10 CONCERN** into review checklist (instrument≠unit residual) | Firstmate / FM-PRREV | N044/S044 · start-tomorrow P0 | **V** |
| **3** | Keep **live OpenRouter** labeled Unverified — optional dogfood ticket, not silent close | Captain | proof honesty (CI ≠ live) | **V** |
| **4** | If review finds >1 owner-area thrash: **split follow-up PR** (chrome/copy vs PKCE write path) rather than widen | Ship-cloud | N032 / N030 vs R-SIZE | **I** |
| **5** | Do **not** wake IDE-local for #15 merge-bound edits | Firstmate refuse | R2 auth · S031 | **V** |
| **6** | After merge (if green): **new `/goal`** for next phase — never continue #15 thread | Loops / Firstmate | N062 | **V** |
| **7** | Watch only: re-poll PR state + check runs; no Brain mutation | Researchy OK | research posture | **V** |

### Captain decision snapshot

```text
#15 open + auth/BYOK + size > gold max?
  YES → NO IDE merge path. Force Ship/cloud + FM-PRREV.
  Live Unverified OR #10 CONCERN untracked?
    YES → hold merge claim; record residual ticket (CI green ≠ live closed).
    NO  → Captain merge only after review table (confirmed/rejected).
Next product phase?
  ALWAYS new /goal plate — never "continue Phase 4 thread".
```

---

## 5. Sources

- `cloud-pr-join.md` / `.json` (PR #15 row; bc-28d7d9fb…)
- `/workspace/cloud-agent-transcripts/bc-28d7d9fb-7425-5efa-9900-afe78984d6bf.jsonl` (L1, L125, L221, L243, L374, L381, L409, L410, L736)
- `cloud-pr-quality-cards.md` · QC-15
- `gold-pr-brain-crosslink.md` (#15 open note + #8–#14 pattern)
- `ide-vs-cloud-ship.md` (R1–R6)
- `start-tomorrow-onepager.md` (N050/N044/N062/S044)
- GitHub MCP `pull_request_read` get + get_check_runs (read-only)

---

## 6. Success check

- [x] Open watch card with scope, size vs gold, risks, Captain moves
- [x] Labels Verified/Assumption/Inference/Unknown
- [x] Brain untouched · factory not done · no PR · no SendToUser · Mac skipped
- [x] Mirrored under `/home/box/agent-data/grok-ship/reports/`

---
*Researchy burn-tranche-4 executor · FM-AGENTENG-01 · T4.4 phase15-watch-card*

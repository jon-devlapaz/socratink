# FM-AGENTENG-01 — Software lifecycle happy paths (Captain addendum)

- **As-of:** 2026-09-15 20:36 CT  
- **Job:** FM-AGENTENG-01 happy-paths package · research-only · no PR  
- **Companion:** `agenteng-runs/evidence-chains.md` (5 reconstructability units)  
- **Corpus:** all `jon-devlapaz/socratink` PRs #1–#15 · FM-CTXSMELL-01 · FM-PRREV-01 · FM-AGENTENG-01-loops · pilot/strata packs · Brain EVT/SRC/PROC · praxist learning  
- **Labels:** verified / inference / unknown · privacy-redacted  

## Brain / scope contract

- Improve agentic engineering loops for Socratink.  
- No Brain mutation. No universal law from n≈15 PRs + n≈50 sessions.  
- Giant line counts that are skill corpora (#1) are **not** treated as product behavior expansion without note.

---

## 1. Full PR inventory (n=15)

| PR | State | Merged (CT) | Title | Branch fingerprint | +/− (files) | Stage hint | Session join (soft) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **#1** | closed | 2026-08-25 16:31 | Keep only the current exchange on the chat stage | `feat/current-turn-canvas` | **+90343/−1061 (62)** | UI + catch-up (skill corpus dominates) | `29896b44`, `c585e8d6` |
| **#2** | closed | 2026-08-26 02:48 | Use Vercel AI Gateway when local unreachable | `feat/vercel-ai-gateway` | unknown size* | impl / hosting | `29896b44`, `c585e8d6` |
| **#3** | closed | 2026-08-26 11:18 | Prove Git production auto-deploy | `chore/git-auto-prod-probe` | unknown* | verify/ship probe | `df80810e`, `29896b44`, `b23609bb` |
| **#4** | closed | 2026-08-27 18:32 | questionnaire tool spans for Braintrust | `feat/questionnaire-span-metadata` | unknown* | impl + observability | `45147840`, `202b533e`, `b23609bb` |
| **#5** | closed | 2026-08-28 00:56 | Northflank staging (Node + Postgres) | **`codex/northflank-staging`** | **+598/−104 (18)** | ship/infra | `b06e3da7`, `b23609bb` |
| **#6** | closed | 2026-08-28 01:11 | boot Chat before OIDC token exists | `fix/vercel-chat-oidc-boot` | +19/−8 (3) | verify/fix | **`b06e3da7`** (best), `b23609bb` |
| **#7** | closed | 2026-08-29 09:05 | learner motion, dummy dock, type size | `feat/ui-learner-motion` | unknown* | UI impl | **`357a2e9e`** (915 tools — thrash) |
| **#8** | closed | 2026-09-15 00:22 | Phase 1 signed HttpOnly session | **`cursor/phase-1-session-cookie-41fb`** | +613/−98 (24) | plate→impl | **none in packs** (cloud) |
| **#9** | closed | 2026-09-15 10:26 | Phase 2 encrypted credential store | `cursor/phase-2-secret-store-dbaf` | +688/−7 (7) | impl library | none |
| **#10** | closed | 2026-09-15 13:47 | Phase 3 hotel-safety overlap proof | `cursor/phase-3-hotel-safety-a4b2` | +302/−2 (6) | verify · **FM-PRREV CONCERN** | none |
| **#11** | **merged** | 2026-09-15 13:50 | Phase 3 wire stored OpenAI keys | `cursor/phase-3-byok-a4b2` | +661/−22 (21) | impl follow-up | none |
| **#12** | **merged** | 2026-09-15 17:05 | gpt-5-nano for connected BYOK | `cursor/cheapest-openai-b412` | unknown* | impl tweak | none |
| **#13** | **merged** | 2026-09-15 18:54 | Flue instanceId so Chat selects OpenAI | `cursor/byok-instance-id-a4a1` | +67/−4 (2) | fix/impl | none |
| **#14** | **merged** | 2026-09-15 19:41 | Fail closed without namespaced instance id | `cursor/identity-judo-0721` | +51/−68 (2) | governance | none |
| **#15** | **open** | — | Phase 4 OpenRouter PKCE | `cursor/phase-4-openrouter-pkce-d6bf` | unknown* | in-flight | none |

\*Size unknown this run when not fetched via MCP `get` (rate-limit on anonymous API).  

**Agent fingerprints (verified):**  
- `Cursor Agent <cursoragent@cursor.com>` + Co-authored-by jon on #8 commits; PR footers `bc-*` Cursor cloud links on #8–#15.  
- Branch prefix `cursor/*` on #8–#15; `codex/*` on #5; earlier `feat/`/`fix/`/`chore/` human-ish.  
- PR user login always `jon-devlapaz` (merge authority).

**Join method (verified):** soft overlap of session `[started,ended]` with PR `[created−6h, closed+6h]` on product-socratink slug. Packs have **empty `pr_urls`**. Sept 15–16 cloud PRs: **zero** local session hits.

---

## 2. Lifecycle stage exemplars — RIGHT vs WRONG

### Research / spike

| | Exemplar | Evidence |
| --- | --- | --- |
| **RIGHT** | Factory Scout reports (FM-CHATSIG, FM-CTXSMELL, FM-TYPESAFE, FM-PRREV) — research-only, dated, no PR | factory.db `kind=scout` `status=done` |
| **RIGHT** | Praxist postmortem as negative-result learning (not shipped) | `.agents/learnings/postmortem-2026-08-30-…` |
| **WRONG** | Validation language → build adjacent R1 product | EVT-0001 / SRC-0010 · CTXSMELL T1 |
| **WRONG** | `.gitignore` ask → `/tmp` prototype thrash | session `f4d88dd4` · T1+T2 |

### Planning / plate / spec

| | Exemplar | Evidence |
| --- | --- | --- |
| **RIGHT** | One-sentence outcome + out-of-scope fences in #8/#9/#10/#11 bodies (“not BYOK / not Flue wrap…”) | PR bodies |
| **RIGHT** | Explicit Plate mid-UI (`f5892573`) | CTXSMELL / loops W4 |
| **WRONG** | Multi-issue “validate these two…” without one outcome | `c2a77998` · T3 |
| **WRONG** | “I trust you” / away without restated plate | `a09316e9` · T7+T3 |
| **WRONG** | Resume Codex without `/goal` rewrite | `b06e3da7` intake risk (still shipped) · F8 |

### Implementation

| | Exemplar | Evidence |
| --- | --- | --- |
| **RIGHT** | Narrow #6 (+19/−8) after incident | PR #6 |
| **RIGHT** | Phase chain #8→#9 library-first before Chat wire | PR bodies + FM-PRREV |
| **RIGHT** | #13/#14 smallest identity fix then fail-closed | PR #13–#14 |
| **WRONG** | Extreme Read/StrReplace on `chat-surface.ts` / CSS | `b23609bb` (1770 tools), `357a2e9e`, `3f9a6631`, `a09316e9` · T2 |
| **WRONG** | Giant catch-up PR #1 (+90k, skill corpus) burying UI change | PR #1 body admits skill corpus dominance |
| **WRONG** | #5 merge while Vercel `DATABASE_URL` risk called out | PR #5 merge gate — then #6 production break |

### Verify / CI

| | Exemplar | Evidence |
| --- | --- | --- |
| **RIGHT** | Named proofs: `pnpm test:learner-key`, `test:credentials`, `check`, `smoke` in phase PRs | #8–#11,#13–#14 |
| **RIGHT** | #3 auto-deploy probe as intentional verify | PR #3 |
| **WRONG** | Claim hotel-safety closed for live Chat from unit wrap only | FM-PRREV **CONCERN** on #10 · T7 |
| **WRONG** | Unchecked live Chat after #6 / #13 in test plan | PR bodies “unverified” |
| **WRONG** | Missing verification culture in sessions | CTXSMELL missing_verification 14/50 |

### Review

| | Exemplar | Evidence |
| --- | --- | --- |
| **RIGHT** | FM-PRREV-01 independent Scout on #8–#10 before treating #10 as closed proof | factory + report |
| **RIGHT** | Grok Ship adversarial-review-before-PR doctrine (loops annex) | GROK_SHIP / loops |
| **WRONG** | Merge #10 without recording residual instrument-path risk as accepted | CONCERN still merged — process OK if Firstmate tracks; bad if marketed as closed security proof |
| **WRONG** | Self-review only / thrash until user corrects | `3f9a6631` user “we need to change this” |

### Ship / follow-up

| | Exemplar | Evidence |
| --- | --- | --- |
| **RIGHT** | #6 same-day hotfix after #5 production break | PR #5→#6 |
| **RIGHT** | #11 wires store after #10 proof; #13→#14 closes identity gap after live miss | PR chain |
| **RIGHT** | EVT revert + tripwire commits + AGENTS encoding | SRC-0010 / PROC-0002 |
| **WRONG** | Ship expansion then revert (EVT-0001) | SRC-0010 |
| **WRONG** | Finish Praxist 4 gens after gen0 showed no parent-eligible | praxist postmortem |
| **OPEN** | #15 Phase 4 PKCE — continue only with plate+proof; don’t widen mid-flight | PR #15 open |

---

## 3. Happy-path patterns (software lifecycle)

Patterns are **normative recommendations** grounded in the spine (inference), not measured rates.

### HP1 — Plate → narrow owner → named proof → stop
Matches product AGENTS §§1–6 and loops W1. Exemplars: #6, #13, #14, Scout reports.

### HP2 — Phased authority with fences
Ship invariants in thin slices (#8 session → #9 store library → #10 proof → #11 wire). Each PR restates “not X”.

### HP3 — Incident → same-day narrow fix
#5 risk acknowledged → #6 OIDC boot. Prefer this over long UI thrash sessions that happen to overlap ship windows (`b23609bb`).

### HP4 — Independent review Scout on security-adjacent PRs
FM-PRREV CONCERN is a **feature** of the happy path (catches overclaim), not a failure of #10’s mechanism review.

### HP5 — Negative result → dated learning → stop rule
Praxist postmortem; EVT→PROC. Do not “finish generations” or rebuild R1 inside an observability ask.

### HP6 — Fail closed when identity/proof thin
#14 deletes sniff fallback; AGENTS hosted secrets posture.

---

## 4. Anti-happy-paths (linked to CTXSMELL + PR outcomes)

| ID | Anti-pattern | Smell | Local outcome |
| --- | --- | --- | --- |
| AH1 | Validation-driven scope substitution | T1 | EVT revert ~3.5k lines |
| AH2 | Tool/path thrash without gate | T2 | Sessions `b23609bb`,`357a2e9e`,`3f9a6631`; UI PRs may still merge |
| AH3 | Proof theater (unit path ≠ production path) | T7 | #10 CONCERN |
| AH4 | Merge with known host landmine | T7+T8 | #5→ production 500 → #6 |
| AH5 | Giant unrelated corpus in product PR | T6/T1-ish | #1 +90k skill dump |
| AH6 | Cloud ship with no local session join | — (observability gap) | #8–#15 invisible to chat-signal packs |
| AH7 | Campaign completionism | T10 | Praxist 4× gemma gens |
| AH8 | Handoff/sprawl rot | T9 | `e8a25b04`,`64cfb0da` |
| AH9 | Clear goal, no stop-on-proof | T2+T7 | `fae4006d` |

---

## 5. Joined timeline (Aug 25 – Sep 16 CT)

```
2026-08-24  EVT-0001 / SRC-0010 scope correction (pre-PR inventory)
2026-08-25  PR #1 UI+corpus  ~ sessions 29896b44, c585e8d6
2026-08-26  PR #2 Gateway · #3 deploy probe  ~ df80810e, 29896b44
2026-08-27  PR #4 Braintrust spans  ~ 45147840 near close
2026-08-28  PR #5 Codex Northflank · PR #6 OIDC fix  ~ b06e3da7 (ship) / b23609bb (thrash)
2026-08-29  PR #7 UI motion  ~ 357a2e9e thrash
2026-08-30  Praxist negative campaign + learning file
2026-09-15  PR #8–#13 Cursor cloud phase/BYOK chain · FM-PRREV on #10 CONCERN · no pack sessions
2026-09-16  PR #14 fail-closed · PR #15 open Phase 4
```

Times above are America/Chicago (CT = UTC−5).

---

## 6. Recommendations for Captain (brief)

1. **Require plate+proof+stop** on every Ship brief; ban resume/trust/multi-issue openers (loops §4).  
2. **Keep FM-PRREV-style Scout** on auth/BYOK PRs; treat CONCERN as mergeable only with explicit residual-risk note.  
3. **Populate `pr_urls` / cloud-agent id** into session packs — else Sept-style Cursor cloud work is invisible to chat-signal.  
4. **Split skill-corpus PRs** from product behavior PRs (#1 lesson).  
5. **Codify EVT tripwires** already in AGENTS; add learnings when campaigns fail (praxist pattern) — folder still thin.  
6. **Prefer #6/#13/#14 shape** (small, causal, fail-closed) over thrash-overlapping merges.

---



---

## Verified gap — cloud-agent PRs vs home-live IDE sessions

**Verified (2026-09-15 CT):** Soft-joining pilot/strata packs (`started_at`/`ended_at` ∩ PR window ±6h, product-socratink slug) finds **zero** local Cursor parents for PRs **#8–#15**. Home-live Cursor mtimes / pack coverage show almost **no** Sep 15–16 socratink parent transcripts in those windows.

**Cause (verified fingerprints, not speculation):**
- Branches `cursor/phase-*`, `cursor/byok-*`, `cursor/identity-judo-*`, `cursor/cheapest-openai-*`, `cursor/phase-4-openrouter-pkce-*`
- Commit author `Cursor Agent <cursoragent@cursor.com>` (e.g. #8)
- PR bodies wrapped in `CURSOR_AGENT_PR_BODY_*` with footer `bcId=bc-…` Cursor cloud-agent links

**Implication:** Phase/BYOK happy-path and evidence-chain reconstructability for #8–#15 must use **PR body + commits + FM-PRREV**, not IDE jsonl. Do not force false session IDs. Chat-signal packs need `pr_urls` / `bcId` ingestion or a cloud-agent capture lane.

**Contrast (verified soft joins that *do* exist):** Aug 25–29 IDE-era PRs #1–#7 overlap sessions such as `b06e3da7` (#5–#6), `357a2e9e` (#7), `29896b44` / `c585e8d6` (#1–#3), `df80810e` (#3), `45147840` (#4) — still soft (empty `pr_urls`), but temporally plausible.


## Sources

| Item | Label |
| --- | --- |
| GitHub MCP full PR list + selected `pull_request_read` | verified |
| `agenteng-runs/pr-inventory.json` (sibling) | verified cross-check |
| Pilot + strata session packs join script | verified method / inference joins |
| FM-CTXSMELL-01, FM-PRREV-01, FM-AGENTENG-01-loops | verified |
| Brain EVT-0001, SRC-0010, PROC-0002 | verified |
| factory.db Scout tasks | verified |
| Jondev `gh` / CopyFromBox this executor | **unavailable** — parent should CopyFromBox |


## Session↔PR join addendum (Researchy, 2026-09-15 CT)

**Verified:** Home-live Cursor capture under `current-home-live` has **almost no** socratink parent jsonl mtimes on **2026-09-15/16** (phase PR window for `#8–#15`). Pack time-window join only matched `#5`/`#6` to session `b06e3da7`. Therefore IDE session↔PR reconstruction for Phase 1–4 is **Unavailable** from home-live; use **cloud agent** fingerprints (`cursor/*` branch, `CURSOR_AGENT_PR_BODY`, `bc-…` footer) as primary join — consistent with Loops v1.1 §10 inference that `#8–#10` are cloud-agent closer to outer-loop than IDE thrash.

**Artifact:** `agenteng-runs/cloud-bc-pr-scan.json` (best-effort PR mentions inside `/workspace/cloud-agent-transcripts`).


## Correction (2026-09-15 CT)

**Verified via GitHub MCP:** `#11`–`#14` all `merged: true` (happy follow-ups after `#10`). Status column “closed” without merge was misleading — GitHub marks merged PRs as state=closed. Do not frame `#11–#14` as failed/unmerged closes.

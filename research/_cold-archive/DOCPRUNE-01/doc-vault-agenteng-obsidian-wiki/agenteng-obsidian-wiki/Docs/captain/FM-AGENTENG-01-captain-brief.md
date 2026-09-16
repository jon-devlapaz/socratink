---
title: "CAPTAIN BRIEF v1 — FM-AGENTENG-01"
source_url: "file:///workspace/socratink/research/chat-signal/wiki-source/agenteng/captain/FM-AGENTENG-01-captain-brief.md"
source_kind: "agenteng-documentation"
generated: true
synced_at: "2026-09-16T02:33:24Z"
content_hash: "5f45955d1cfc28087e72cbc16f172fd2a160d8d2ef1e4f2489179cd4e159cf50"
---

# CAPTAIN BRIEF v1 — FM-AGENTENG-01

- **As-of:** 2026-09-15 21:17 CT (America/Chicago) · appendix T6.3 cost-slide
- **Audience:** Captain (via Firstmate)
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac sync skipped
- **Status:** INTERIM · KEEP BURNING (tranche findings landed; factory underway)

---

## 1. Tomorrow kit — what to paste first

Open these three research drafts (product repo untouched until you paste):

| Order | File | Paste into | First action |
| ---: | --- | --- | --- |
| **1** | `draft-goal-template.md` | Ship brief / Firstmate handoff | Fill master `/goal` block: Outcome · repo · cwd · proof · stop · Not-in-this-PR |
| **2** | `draft-agents-thrash-tripwire.md` | Product `AGENTS.md` (when ready) | Arm boot gate + thrash tripwires before any >15 min session |
| **3** | `start-tomorrow-onepager.md` | Pocket card / Firstmate | Carry top 15 **N*** (do) + top 15 **S*** (stop) |

**Paste order (Verified habit):** plate first → tripwire second → one-pager as daily checklist. Firstmate **refuses boot** if `/goal`+repo+cwd+proof+stop+Not-in-this-PR missing (**N010**/**S010** · Verified).

Paths (dual): `agenteng-runs/` + grok-ship `reports/FM-AGENTENG-01-draft-*` / `FM-AGENTENG-01-start-tomorrow-onepager.md`.

---

## 2. IDE vs Ship — decision rubric (≤8 lines)

From `ide-vs-cloud-ship.md` (**V** packs + gold `#8–#14`):

1. **Force Ship/cloud** if merge-bound **OR** auth/secrets/identity/BYOK **OR** multi-file phase (**R1–R3** · **V**).
2. **Force Ship** if thrash tripwire firing (≥3 identical tool sigs **OR** ≥5 same-file edits w/o green) **OR** >15–30m without restated plate (**R4–R5** · **V**).
3. **Force Ship** if auth needs FM-PRREV before “proof closed” (**R6** · **V** `#10`).
4. **IDE OK** only for plate-bound hotfix / visual poke / Scout report-only — tripwire live, **not** merge-bound auth (**A1–A5** · **V** `#6`/`b06e3da7`).
5. **Trap:** high Axis-A + thrash ≠ healthy loop (`b23609bb` 1770 tools · **S065** · **V**). Ship score ≠ loop health.
6. **Join rule:** cloud `#8–#15` via `bcId`/PR footer only — never invent IDE session IDs (**N070**/**S070** · **V** IDE∩PR = none).

```text
merge-bound|auth|multi-file? YES→Ship. thrash|>15m no plate? YES→STOP/replate/Ship. else IDE+tripwire.
```

---

## 3. Gold chain `#8–#14` habits + `#15` caveat

| PR | Role | Habit to copy |
| ---: | --- | --- |
| **#8** | strategic | `/goal`+proof+stop+Not-in-this-PR; session gate before secrets (**V**) |
| **#9** | strategic | Library-first store; Chat out of scope (**N023** · **V**) |
| **#10** | strategic | Isolation proof before wire; FM-PRREV **CONCERN** recorded not marketed closed (**N044** · **V**) |
| **#11** | tactical | New plate for wire — never widen proof PR (**N032** · **V**) |
| **#12** | tactical | Tiny separable policy PR (**V**) |
| **#13** | tactical | Live obs → smallest causal fix (**V**) |
| **#14** | strategic | Fail-closed: delete sniff; error on thin identity (**N033** · **V**) |

**`#15` open caveat (Inference + Verified open):** Phase 4 OpenRouter PKCE in-flight (`missing_verify`); continue **only** with plate+proof; do **not** widen mid-flight (**N062**); carry `#10` CONCERN explicitly; FM-PRREV before treating closed. Not merged gold.

**Strategic vs tactical (V):** foundation/invariant/fail-closed = `#8/#9/#10/#14`; wire/cost/live-miss = `#11/#12/#13`. Headline: phased authority + honest residual beats any single large diff.

---

## 4. Top smells to STOP

### From onepager **S*** (P0)

| ID | STOP |
| --- | --- |
| **S030** | ≥3 identical tool sigs **OR** ≥5 same-file edits w/o green → replate (one variable) |
| **S010** | No Outcome / Goal Prompt → refuse boot |
| **S040** | Unchecked UI checklist as verify → named commands or cut claim |
| **S044** | Marketing `#10` CONCERN as closed hotel-safety |
| **S031** | Merge-bound work only in IDE thrash → hand to Ship |
| **S065** | Calling high Axis-A + thrash “healthy” |
| **S014**/**S013** | “I trust you” / bare “continue” without rewritten plate |
| **S033**/**S070** | Identity sniff / inventing IDE ids for `#8–#15` |

### Cloud dump highlights (**CD-S** · Verified)

- **CD-S09** stale local main on phase-chain → mandatory `fetch origin/main` preflight
- **CD-S04**/**CD-S05** proof theater / catalog-green without live routing dogfood → label **Unverified**
- **CD-S06** conversationId sniff (pre-`#14`) → instanceId-only fail-closed
- **CD-S12** multi-provider priority undecided mid-impl (`#15`) → put driver policy in plate first
- **CD-S01** conflicting StrReplace “success” with file revert → re-read before more patches

### Codex recovery fatal (**CR-S** · high relevance)

- **CR-S01**/**CR-S12** skill-path/scout hunt substituting for Outcome+proof
- **CR-S05** model-switch continue without rewritten plate
- **CR-S02**/**CR-S10** extreme thrash / identical-retry campaigns without recovery flip

---

## 5. One-liner operating loop

`/goal` + proof + stop → thrash tripwire armed → auth/BYOK gets FM-PRREV → captain merges → **new** `/goal` next phase.

---

## Sources (read densest; do not thin)

`start-tomorrow-onepager` · `ide-vs-cloud-ship` · `gold-pr-brain-crosslink` · `cloud-pr-quality-cards` (CD-S) · `draft-goal-template` · `draft-agents-thrash-tripwire` · `codex-recovery-cards` (CR-S) · `toolcall-waste-oom` (appendix) · `FM-AGENTENG-01.md` KEEP BURNING table

**SUCCESS:** ≤2 pages · dual-path · as-of CT · V/A labels · Brain untouched · factory not done.

---

## Appendix A — Cost slide: thrash vs gold cloud

Source: `toolcall-waste-oom` (T5.4). Counts **Verified**; ratios/waste **labeled**. OOM only — no $ bills.

- **Top thrash (IDE):** `b23609bb` **1770** · `a09316e9` **1384** · `357a2e9e` **915** — top-3 sum **4069** tools (**V**). Path retries to ×93–126 same file.
- **Gold cloud `#8–#14`:** unique tool-role sum **1184** (~1.2×10³; #10/#11 dump once) · median among 6 unique dumps **~164** (**V**).
- **~10× OOM:** one thrash leader (1770) vs median gold (~164) ≈ **~10×** tools per PR-shaped unit (**I**). Same leader ≈ **1–2×** the entire gold-chain unique tool mass; top-3 ≈ **~3–4×** that sum (**V** counts · **I** frame).
- **Waste % (Assumption):** vs gold-like budget O(10²) (~160), thrash leaders look **~80–90%** surplus tools (e.g. 1610/1770≈91%). **Inference** — not measured token/$ cost; partnership ≠ tool_count (**S065**).
- **Force Ship / tripwire:** gold chain merged 7 PRs on ~**1×10³** unique tools; one IDE thrash can burn more alone (**I**). Arm **S030** (≥3 identical sigs **or** ≥5 same-file edits w/o green) as the cost brake — path×90+ is the waste signature (**V**).

*Appendix · Researchy burn-tranche-6 · T6.3 · as-of 2026-09-15 21:17 CT*

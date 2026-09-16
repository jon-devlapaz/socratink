# toolcall-waste-oom — thrash sessions vs gold cloud PRs (T5.4)

- **As-of:** 2026-09-15 21:14 CT
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-5 · T5.4
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac CopyFromBox **skipped**
- **Companion JSON:** `toolcall-waste-oom.json`
- **Question:** Order-of-magnitude **tool-call waste** on top thrash sessions vs gold cloud PRs `#8–#14`?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**  
**Policy:** OOM only — no fake precision $ or token bills.

---

## 0. Verdict (one-liner)

Extreme IDE thrash is **~10×** tools per ship-shaped unit vs a median gold cloud PR (**I** on “unit”; counts **V**). One thrash leader (`b23609bb` **1770**) alone is **~1–2×** the **sum** of unique gold-chain cloud tool roles (~**1.2e3**). Waste on thrash leaders is **O(10³)** surplus tool calls / session if a gold PR budget is **O(10²)** (**A**).

---

## 1. Method

| Input | What counted | Label |
| --- | --- | --- |
| Top thrash | `n_tools` from `loops-v2-session-mine.json` `structural_top_thrash` + WM `tool_call_count` | **V** |
| Path retries | top_reads / top_writes repeats (proxy for identical-sig thrash) | **V** |
| Gold cloud `#8–#14` | `role=="tool"` lines in `/workspace/cloud-agent-transcripts/bc-*.jsonl` joined via `cloud-pr-join.json` | **V** this run |
| Quality cards | plate/proof/stop/thrash_risk means (`cloud-pr-quality-cards.md`) | **V** |
| “Waste” | thrash tools − OOM “gold-like budget” | **A** / **I** — not causal token accounting |

**Not claimed:** dollar cost, token occupancy, or that every cloud tool was necessary.

---

## 2. Top thrash sessions (IDE Cursor)

| Rank | Session | n_tools | Notable path thrash | goalish | Axis A (if ∩) | Label |
| ---: | --- | ---: | --- | --- | ---: | --- |
| 1 | `b23609bb` | **1770** | Read chat-surface×**93**, styles×**91**; Write chat-surface×**85**, styles×**65** | False | **1.091** | **V** |
| 2 | `a09316e9` | **1384** | Read chat-surface×**57**, styles×**48**; Write chat-surface×**49** | True | **1.073** | **V** |
| 3 | `357a2e9e` | **915** | Read/Write styles×**126**/**124** | True | **0.986** | **V** |
| 4 | `f57a99e7` | **730** | app.js Read×36 / Write×33 | False | 0.180 | **V** |
| 5 | `4d0e878b` | **632** | smoke.mjs Write×23 | False | 0.584 | **V** |

**Top-3 sum:** 1770+1384+915 = **4069** tools (**V**).

**CTXSMELL prior (V):** det ≥3 identical tool sigs **45/50** pilot; smell T2 / S030 / F1 cite these leaders.

---

## 3. Gold cloud PRs `#8–#14` — tool roles + dump size

| PR | bcId (short) | dump lines | tool roles | +/− files | thrash_risk (QC) | Label |
| ---: | --- | ---: | ---: | --- | ---: | --- |
| #8 | …8641fb | 570 | **245** | +613/−98 (24) | 1 | **V** |
| #9 | …01dbaf | 431 | **174** | +688/−7 (7) | 2 | **V** |
| #10 | …5ea4b2 | 965 | **412** | +302/−2 (6) | 2 | **V** |
| #11 | …5ea4b2 *(shared)* | 965 | **412** *(same dump)* | +661/−22 (21) | 1 | **V** |
| #12 | …54b412 | 262 | **110** | +21/−8 (3) | 0 | **V** |
| #13 | …9ea4a1 | 360 | **154** | +67/−4 (2) | 2 | **V** |
| #14 | …df0721 | 212 | **89** | +51/−68 (2) | 1 | **V** |
| #15 open | …84d6bf | 736 | **320** | +1173/−141 (23) | 2 | **V** — not merged gold |

**Unique gold merged tool-role sum `#8–#14`:** 245+174+412+110+154+89 = **1184** ≈ **1.2×10³** (**V**; shared #10/#11 counted once).

**QC means `#8–#15` (V):** plate **2.88** · proof **2.5** · stop **3.0** · partnership **2.25** · thrash_risk **1.38** (higher=worse).

**Median tool roles among unique gold dumps (6):** sort 89,110,154,174,245,412 → median ≈ **164** (**V**).

---

## 4. Order-of-magnitude contrasts

| Comparison | Numbers | OOM read | Label |
| --- | --- | --- | --- |
| One thrash leader vs median gold PR | 1770 vs ~1.6×10² | **~10×** tools | **I** (unit=1 PR-shaped effort) |
| One thrash leader vs unique gold-chain sum | 1770 vs ~1.2×10³ | **~1–2×** entire `#8–#14` tool mass | **V** counts · **I** framing |
| Top-3 thrash vs unique gold-chain sum | 4.1×10³ vs 1.2×10³ | **~3–4×** | **V**/**I** |
| Path-retry intensity | 93× / 126× same file vs gold thrash_risk mostly 0–2 | Thrash = repeated signature; gold = bounded retries | **V** |
| Codex recovery retries_sample (non-gold, context) | ~33–84 in recovery cards | Same order as “tens of retries” not thousands of tools | **V** pack · **I** cross-harness |

---

## 5. Waste estimate (labeled)

**Assumption — gold-like budget:** A plate+proof+stop cloud PR that merges with QC thrash_risk ≤2 typically lands in **O(10²)** tool roles (~50–250; median ~160).

**Inference — thrash surplus:**

| Session | n_tools | Minus ~1.6×10² budget | Surplus (waste proxy) | OOM |
| --- | ---: | ---: | ---: | --- |
| `b23609bb` | 1770 | ~1610 | **~1.6×10³** | **O(10³)** |
| `a09316e9` | 1384 | ~1220 | **~1.2×10³** | **O(10³)** |
| `357a2e9e` | 915 | ~750 | **~0.8×10³** | **O(10³)** |
| Top-3 combined | 4069 | ~3×160 | **~3.6×10³** | **O(10³)** |

**Waste fraction (A):** on thrash leaders, **~80–90%** of tool calls are surplus relative to a gold-like budget (e.g. 1610/1770≈91%). **Do not** treat as measured token $ — partnership score ≠ LOC/tool_count (H45 / F6 / S065).

**Unknown:** true necessary-tool lower bound per PR; subagent fan-out double-count; IDE vs cloud tool-schema parity (Cursor IDE `n_tools` vs cloud `role=tool` may differ slightly — still same OOM).

---

## 6. Efficiency takeaway (for Captain / Loops)

1. **Force Ship-cloud** for merge-bound work — gold chain delivers 7 merged PRs on ~**1×10³** unique tool roles; one IDE thrash session can burn more alone (**I**).
2. **Tripwire** (≥3 identical sigs **or** ≥5 same-file edits w/o green) is the cost brake — path×90+ is the waste signature (**V** S030).
3. **Score loop health ≠ Axis A** — thrash leaders can ship while wasting **O(10³)** tools (**V** S065).

---

## 7. Sources

- `loops-v2-session-mine.json` · `working-memory-exemplars.json` · `ide-vs-cloud-ship.md`
- `cloud-pr-join.json` · `cloud-agent-transcripts/bc-*.jsonl` · `cloud-pr-quality-cards.md`
- `smell-catalog-dense.md` T2/S030/F1 · `draft-agents-thrash-tripwire.md`

---
*Researchy burn-tranche-5 · FM-AGENTENG-01 · T5.4 · toolcall-waste-oom*

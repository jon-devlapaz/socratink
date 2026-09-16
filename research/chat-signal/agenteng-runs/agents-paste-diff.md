# FM-AGENTENG-01 T4.2 — Paste drafts vs product AGENTS.md

> Research-only · Brain untouched · product files not written · factory not marked done  
> Generated: 2026-09-15 21:09 CT

## Verified paths

| Role | Path | Status |
| --- | --- | --- |
| **Product AGENTS.md (primary, box)** | `/workspace/socratink-flue/AGENTS.md` | **Verified** — clone of `https://github.com/jon-devlapaz/socratink.git` @ `aed93eb`; SHA256 `87e70da4198c58ecd85f52f1741b2511ffbc48d00490862175f15b11416c2231`; title `# Socratink product agent guide` |
| **Product AGENTS.md (GitHub tip)** | `jon-devlapaz/socratink` / `AGENTS.md` (repo root) | **Verified** via GitHub MCP `get_file_contents`; content SHA `a590231c2c0dab5b2825bbcbe2ea9e0f8b00df44`; matches flue clone text |
| **Mac product path (requested)** | `/Users/jondev/dev/active/socratink/product/socratink/AGENTS.md` | **Unverified this run** — path not mounted on box; Shell `machineId` `3ac411d5-1001-4beb-baf5-a38080401d80` not available to this executor. Treat Mac path as expected twin of GitHub root `AGENTS.md` until captain confirms. |
| Draft thrash | `/workspace/socratink/research/chat-signal/agenteng-runs/draft-agents-thrash-tripwire.md` | **Verified** |
| Draft `/goal` | `/workspace/socratink/research/chat-signal/agenteng-runs/draft-goal-template.md` | **Verified** |

**Baseline used for diff:** box flue clone = GitHub product `AGENTS.md` (277 lines). No thrash-tripwire or master `/goal` block sections exist today.

---

## Already covered

Product `AGENTS.md` already encodes these draft themes (short quotes only):

### Outcome + smallest owner + stop-on-proof

- Working method #1–#6: *"Write the smallest observable outcome in one sentence."* → *"stop when the stated outcome is proven."*
- Overlaps draft: `/goal` one Outcome (`N011`); smallest owner (`N030`); stop when green (`N062`/`N064`).

### Proof + Unverified

- Testing and proof: *"Report exactly what ran, what passed, and what remains unverified."*
- Working method: *"Clearly separate confirmed facts, reasonable inferences, and unknowns."*
- Boundaries Always: *"Add proof at the same boundary as the behavior and report any unverified assumptions."*
- Overlaps draft: named proof / `Unverified:` spirit (`N040`); not the stricter UI-checklist / proof-theater / FM-PRREV rules.

### Dogfood language ≠ feature license

- Working method #3: dogfood/vet/scientific/grounded/production-quality *"do not authorize broader features."*
- Overlaps draft `S001` (strengthen proof only).

### Scope tripwire (product-capability expansion)

- Product scope: *"Treat any such addition—and any unexpectedly large diff—as a scope tripwire. Stop before implementation, compare it with the one-sentence outcome…"*
- Overlaps draft *intent* to stop on wrong expansion — **different meaning** from thrash tool-loop tripwires (see Conflicts).

### Brain doctrine pointer

- Product: use `.agents/skills/socratink-brain` + `brain.py orient` before consequential learning/product claims.
- Partial overlap with draft Scout/Brain governance (`N001`/`S034`) — product points at orient; draft adds Scout report-only + no mid-coding Brain mutation + no Scout merge.

### Git: no silent PR/push; outcome-scoped diffs

- Git workflow: stage/commit/push/PR *"only when the user explicitly asks"*; *"Keep each change scoped to the observable outcome."*
- Directionally overlaps Ship `on_done: push branch only` / no silent scope — product does **not** name Ship / adversarial-review / captain-merge pipeline.

### Post-failure learnings

- Working method #7: dated postmortem under `.agents/learnings/` after costly negative campaign.
- Soft overlap with thrash recovery culture; no numeric thrash gates.

---

## Net-new (paste candidates)

Items in drafts that are **absent** from product `AGENTS.md` (or only weakly implied). Ranked by paste value.

### A. From `draft-agents-thrash-tripwire.md` (high value)

| ID | Net-new content | Why net-new |
| ---: | --- | --- |
| A1 | **Boot gate / refuse without plate** — `/goal` + repo + cwd + proof + stop + Not-in-this-PR before tools (`S010`/`N010`) | Product asks for one-sentence outcome + proof; **no refuse-boot**, no cwd/repo plate, no Not-in-this-PR field |
| A2 | **Thrash tripwire table** — ≥3 identical tool signatures **or** ≥5 same-file edit cycles without green gate → STOP + replate (`S030`, CR-S01/02/08/10) | Only product-capability "scope tripwire" exists; **zero** tool/edit-loop numeric gates |
| A3 | **Ban openers** — bare “continue Codex/Cursor”; “I trust you” without restated plate; multi-issue without one Outcome (`S013`/`S014`) | Absent |
| A4 | **Verify STOP rules** — no unchecked UI checklist as verify (`S040`); no proof theater (`S022`); auth/BYOK → FM-PRREV; CONCERN ≠ closed hotel-safety (`S044`/`N044`/`N050`) | Product has Unverified reporting only |
| A5 | **Phase stop rules** — isolation/proof before wire; Outcome proven → STOP; next phase = **new** `/goal`; never widen proof PR (`S011`/`S012`/`N032`/`N062`) | Product says stop when proven; **no** phase-order / new-plate doctrine |
| A6 | **Merge-bound Ship vs IDE thrash** path table (`S031`/`N031`/`N063`) | Absent — AGENTS is editor-agnostic coding-agent contract |
| A7 | **Governance stops** — identity fail-closed / `instanceId` only (`S033`); Brain≠code≠harness / Scout report-only (`S034`); no fake IDE session IDs — join via `bcId`/PR footer (`S070`) | Absent (Brain orient exists; not these stops) |
| A8 | **Pocket stop checklist** (6 lines) | Absent; good AGENTS-sized paste |
| A9 | Loop-health ≠ ship needle (`S065`) | Absent |

### B. From `draft-goal-template.md` (medium–high; paste selectively)

| ID | Net-new content | Why net-new |
| ---: | --- | --- |
| B1 | **Master `/goal` block** (structured fields: repo, cwd, proof, stop, Not-in-this-PR, constraints, on_done Ship/Scout) | Product has prose Working method, **no** fill-in template |
| B2 | **Firstmate boot rule** tying refuse-handoff to missing plate fields | Absent |
| B3 | **Field guide table** (N* → rule) | Absent; better as skill/appendix than root AGENTS |
| B4 | **Per-stage variants** — Research / Plan / Spec / Impl / Verify / Review / Ship copy-paste blocks | Absent; long — prefer `.agents/skills/` or Firstmate brief pack |
| B5 | **Gold-chain cheat** (`#8–#15` right vs wrong) | Absent; empirical but PR-number-heavy — aging risk in root AGENTS |
| B6 | Explicit **Ship on_done** (branch only; adversarial-review next; captain merges) and **Scout on_done** (report under `reports/<id>.md`) | Stronger/more specific than “PR only when asked” |
| B7 | Auth residual / CONCERN honesty in Review stage | Absent |

**Not recommended for root AGENTS.md paste:** full CR-S01–12 catalog, full N*/S* ID tables, gold PR number cheat as durable doctrine (link from learnings/skill instead). Product closing rule: *"Keep this guide concise and empirical."*

---

## Conflicts / overlaps

| # | Topic | Severity | Notes |
| ---: | --- | --- | --- |
| 1 | **"Scope tripwire" vs "thrash tripwire"** | **Naming conflict** | Product = unauthorized product capability / large diff. Draft = tool-signature / same-file edit thrash. Same family word; paste must **rename or explicitly distinguish** (e.g. “operator thrash tripwire”) so agents don’t conflate. |
| 2 | One-sentence outcome | Soft overlap | Working method #1 already requires it. Paste boot gate should **extend** (#1), not restate as a rival section. |
| 3 | Proof / Unverified | Soft overlap | Testing and proof already covers. Paste verify STOPs as **tighteners** under that section or a short subsection. |
| 4 | Dogfood/vet language | Soft overlap | Identical intent to `S001`; do not duplicate paragraph. |
| 5 | Stop when proven | Soft overlap | Product has it; draft adds “new `/goal` next phase” + numeric thrash — additive. |
| 6 | Git PR discipline vs Ship pipeline | Mild doctrine expansion | Product: PR only when user asks. Draft: push branch → adversarial-review → captain merge. Compatible if framed as *how* captain asks; still expands AGENTS into Firstmate/Ship ops. |
| 7 | Editor-agnostic portability vs Ship/IDE split | Mild tension | Coding-agent portability section says AGENTS is not owned by a particular editor. A hard “merge-bound ⇒ Grok Ship only” rule is ops doctrine — keep brief or house under Firstmate/Ship skill. |
| 8 | Length vs concision rule | Process conflict | Pasting thrash table + full `/goal` field guide + 7 stage variants + gold cheat would fight *"Prefer one real command or example over several paragraphs."* Prefer **pocket** paste + link out. |
| 9 | Brain | Complementary | Product: orient before consequential work. Draft: Scout never mutates Brain / never merges. Paste Scout line only if it doesn’t duplicate orient paragraph. |

**No hard logical contradiction** found (nothing in drafts tells an agent to do the opposite of an existing Always/Never). Main risks are **naming collision**, **doctrine expansion into Ship ops**, and **file bloat**.

---

## Recommend paste order

Captain-only; research drafts stay under `agenteng-runs/`. **Do not** paste wholesale.

1. **Disambiguate naming** — in paste text, call draft tripwires **“operator thrash tripwires”** (or similar) so they do not collide with existing **scope tripwire**.
2. **Paste A8 pocket checklist + A2 thrash table + A1 boot gate** into a new short section after **Working method** (or as Working method #0 / boot). Highest P0 from FM-AGENTENG loops; smallest AGENTS surface.
3. **Paste A4 verify STOP bullets** as a tight subsection under **Testing and proof** (UI checklist / proof theater / FM-PRREV+CONCERN). Reuse existing Unverified language; don’t fork a second proof doctrine.
4. **Paste B1 master `/goal` block only** (the ```text``` template) — either:
   - a short AGENTS subsection “Plate template”, **or**
   - preferred: `.agents/skills/` / Firstmate Ship-brief template with a one-line pointer from AGENTS.
5. **Paste A5 phase stop + B6 Ship/Scout on_done** as 4–6 bullets (isolation→wire; new plate next phase; Ship branch-only; Scout report-only). Skip long narrative.
6. **Defer to skill/learnings (not root AGENTS):** B3 field guide, B4 per-stage variants, B5 gold-chain cheat, A7 identity/`bcId` detail, A9 S065, full S*/N*/CR-S ID catalogs.
7. **Optional last:** A3 ban openers (2–3 bullets under boot gate) if pocket still thin.

**Suggested AGENTS insertion map**

```text
## Working method
  [existing 1–7]
  + Boot / plate (refuse without plate)     ← A1, A3
  + Operator thrash tripwires (table)       ← A2
  + Pocket stop checklist                   ← A8

## Testing and proof
  [existing]
  + Verify STOP rules                       ← A4

## (optional short) Plate template
  + Master /goal block                      ← B1
  + Phase / Ship / Scout on_done bullets    ← A5, B6
```

**Out of scope this tranche:** writing product files, opening a PR, marking factory done, Brain edits, Mac CopyFromBox.

---

## Sources

- Product: `/workspace/socratink-flue/AGENTS.md` (= GitHub `jon-devlapaz/socratink` `AGENTS.md`)
- Drafts: `draft-agents-thrash-tripwire.md`, `draft-goal-template.md`
- Grounding refs inside drafts: `start-tomorrow-onepager`, CR-S01–12, loops §4–§8/§11/§16

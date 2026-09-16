# IDE thrash∩ship vs cloud gold chain — decision rubric (T3.3)

- **As-of:** 2026-09-15 21:10 CT
- **Job:** FM-AGENTENG-01 Researchy burn-tranche-3 · T3.3
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac sync skipped
- **Companion JSON:** `ide-vs-cloud-ship.json`
- **Question:** When is IDE-local acceptable vs when Captain must force Ship / cloud agent?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**

---

## 0. Executive answer

| Path | When | Evidence spine |
| --- | --- | --- |
| **IDE-local OK** | Plate-bound hotfix / visual poke / ≤15–30 min with `/goal`+proof+stop; thrash tripwire armed; **not** merge-bound auth/BYOK/infra | `#6` shape via `b06e3da7` **(V)**; W1/W4/W5 loops **(V)** |
| **Must-Ship (cloud)** | Merge-bound product work; auth/secrets/identity; multi-file phase; session already thrashing; needs FM-PRREV | Gold chain `#8–#14` **(V)**; N031/N063/S031 **(I from packs)** |

**One-liner (I):** Ship score ≠ loop health. Axis-A thrash shippers (`b23609bb`, `a09316e9`, `357a2e9e`) prove commits can land while partnership fails — Captain forces cloud Ship for merge-bound work; IDE stays for plate-bound hotfixes with tripwires.

---

## 1. Inventory — IDE thrash∩ship exemplars (existing IDs only)

Definition used here: home-live Cursor parent with **extreme tool/path thrash** (T2 / F1) **and** measurable ship signal (high Axis A / shipped_p / commits or PR-window overlap). Soft PR joins labeled **Inference** unless packs mark Verified.

### 1.1 Core thrash∩ship cluster (≥5)

| # | Session | Tools | Why thrash (V) | Ship signal | What shipped / window | Label |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | **`b23609bb`** | **1770** | 93× Read `chat-surface.ts`, 91× Read / 85× Write `styles.css`; goalish=False; thrash_p≈0.44 | Axis A **1.091**; shipped_p **0.96**; **28** commits; PRs **#4,#5,#6** in window | Soft join early ship window (questionnaire / Northflank / OIDC era) — **not** gold `#8–#14` | **V** metrics · **I** PR overlap |
| 2 | **`a09316e9`** | **1384** | 57× `chat-surface` / 48× `styles`; FreeLLMAPI trust/away (F3); thrash_p≈0.49; plate 0.76; gap=over_trust | Axis A **1.073**; shipped_p **0.95**; **15** commits; prs_in_window=[] | Commits landed without named PR join | **V** thrash · **U** net product value |
| 3 | **`357a2e9e`** | **915** | **126× Read / 124× StrReplace `styles.css`**; thrash_p≈0.41 | Axis A **0.986**; shipped_p **0.92**; **9** commits; PR **#7** | Soft join **#7** learner-motion UI (+1506/−88) — anti-happy verify-weak | **V** thrash · **I** ↔#7 |
| 4 | **`3f9a6631`** | **408** | Phased UI modularization → fatal thrash; 15× Read fatal pattern; user mid-thrash correction (S054); thrash_p≈0.39 | Axis A **0.847**; shipped_p **0.88**; **9** commits | Local modularization commits; no PR id in Jev window | **V** thrash · **U** merge destination |
| 5 | **`fae4006d`** | **255** | Clear destructive fence but **no stop-on-proof** (F2); thrash_p≈0.37; plate 0.63 | Axis A **0.994**; shipped_p **0.94**; **10** commits | Empty-state restart commits; high ship without proof culture | **V** · **I** loop-unhealthy ship |
| 6 | **`f4d88dd4`** | **209** | `.gitignore` → `/tmp` prototype expansion (F7/T1+T2) | Axis A **0.757**; shipped_p **0.91**; **3** commits | Prototype HTML thrash — design-kind ship noise | **V** smell · **I** non-merge |

### 1.2 Adjacent ship-heavy IDE (contrast, not pure thrash heroes)

| Session | Role | Notes | Label |
| --- | --- | --- | --- |
| **`b06e3da7`** | Best IDE↔PR join | Axis A **1.150**; PRs **#5,#6**; thrash_p≈0.49 but **Verified** join to OIDC hotfix `#6` (+19/−8) — gold **hotfix** shape, not thrash-merge | **V** |
| **`45147840`** | Lower thrash ship | thrash_p≈0.25; happy≈0.83; verify≈0.70; PR **#4** window — careful/fast_good ship | **V** |
| **`202b533e`** | Mid thrash + handoff_rot | 187 tools; PR **#4**; plate 1.38 but gap=handoff_rot | **V** |
| **`1def40b7`** | Gold IDE intake (not thrash) | Goal Prompt; plate **2.34**; careful_good — contrast for “IDE can be healthy” | **V** |

### 1.3 Thrash facts (population)

| Fact | Value | Label |
| --- | --- | --- |
| Cursor parents v3 primary gap thrash | **42/132** | **V** (happy-nuggets / strata-v3) |
| Biased mine thrash / slow_thrash | 41/59 · 37/59 (v1); thrash 37/58 (v2 gaps) | **V** |
| Codex thrash | **4/80** — gap is weak plate/verify, not UI path loops | **V** (evidence-chains § Codex) |
| Axis A ∩ extreme thrash | `b23609bb`, `a09316e9`, `357a2e9e` | **V** (loops §0) |

**Inference:** Dominant home-live failure is **T2 UI file thrash** on `chat-surface` / `styles.css`. Commits and even merges can still happen (`#7`, `#4–#6` windows) while loop health is poor (S065).

---

## 2. Cloud gold chain `#8–#14` — habits (contrast)

**Verified:** Seven merged PRs on `cursor/*` branches; **zero** IDE home-live parent joins; join via `bcId` + CloudAgent dump jsonl (**hard**). Shared agent: `#10+#11` → one bcId.

| PR | Strategic/tactical | Shipped artifact (V) | Habit taught |
| ---: | --- | --- | --- |
| **#8** | strategic | HttpOnly signed session cookie gate; +613/−98 | `/goal`+proof+stop+Not-in-this-PR; phase fence before secrets |
| **#9** | strategic | Encrypted credential store; Chat stays jon-local; +688/−7 | **Library-first** before Chat wire (N023) |
| **#10** | strategic | Hotel-safety `test:learner-key`; FM-PRREV **CONCERN** residual | Isolation **proof** before wire; honest residual (N044) |
| **#11** | tactical | Wire store into Chat; fail-closed missing key; +661/−22 | **Follow-up PR > widen** (#10→#11) (N032) |
| **#12** | tactical | gpt-4o→gpt-5-nano; +21/−8 | Separable tiny policy PR |
| **#13** | tactical | instanceId-first live miss fix; +67/−4 | Live obs → causal tiny fix (H30/#6 shape) |
| **#14** | strategic | Delete sniff fallback; error on thin identity; +51/−68 | **Fail-closed** when identity/proof thin (N033) |
| **#15** | strategic (open) | OpenRouter PKCE in-flight | New `/goal`; do not widen mid-flight (N062) — **not** merged gold |

### Cloud habit stack (V + I)

1. **Plate:** Outcome / Proof / Stop / Not-in-this-PR on every phase (**V** PR bodies).
2. **Proof:** Named `pnpm test:<slice> && check && smoke` — not unchecked UI checklists (**V** vs `#7`).
3. **Stop:** Stop when proof green; next phase = new plate (**I**/N062).
4. **Fail-closed:** Missing key / missing instanceId → error, no sniff (**V** #11/#14).
5. **Library-first:** Store before wire (**V** #9→#11).
6. **Review:** FM-PRREV / adversarial on auth; CONCERN recorded not marketed closed (**V** #10).
7. **Agent form:** Cloud agent implements; captain merges; Scout never merges (**V** CREWMATE / N031).
8. **Observability:** Join via `bcId`/PR footer — never invent IDE session IDs (**V** S070/N070).

---

## 3. Contrasts — ≥5 IDE thrash∩ship vs ≥5 cloud gold

| # | Dimension | IDE thrash∩ship | Cloud gold `#8–#14` | Label |
| ---: | --- | --- | --- | --- |
| C1 | **Intake** | Resume / skill dump / troubleshooting / images; proofish rare (6/65 mines) | Paste `/goal`+repo+cwd+proof+stop+Not-in-this-PR | **V** |
| C2 | **Loop body** | Extreme Read/StrReplace on UI owners (1770 / 1384 / 915 tools) | Narrow owner per phase; library then wire | **V** |
| C3 | **Verify** | Unchecked browser checklist (`#7`); thrash without green gate | Named contract suites; honest Unverified / CONCERN | **V** |
| C4 | **Stop rule** | Usage / correction / interrupt; mid-thrash “change this” (`3f9a6631`) | Stop-on-proof; new plate next phase | **V**/I |
| C5 | **Ship signal** | High Axis A + commits **even when** thrash_p≥0.4 (S065 trap) | Happy merge chain; ship = plate+proof+captain | **V** |
| C6 | **Merge path** | IDE thrash overlapping large UI merge (`#7`↔`357a2e9e` **I**) | Cloud `cursor/*` + captain merge; IDE session∩PR = **none** | **V** |
| C7 | **Security posture** | Trust/away FreeLLMAPI (`a09316e9`); sniffy fallbacks pre-#14 culture | Fail-closed identity; FM-PRREV on auth | **V** |
| C8 | **Scope control** | Scope creep / prototype expansion (`f4d88dd4`); multi-issue | Not-in-this-PR fences; follow-up PR (`#10→#11`) | **V** |
| C9 | **Observability** | Rich local jsonl; weak pr_urls/bcId | Hard bcId + dump transcript; no fake IDE ids | **V** |
| C10 | **Recovery contrast (Codex)** | Codex fatal thrash mean happy≈0.28; recovery flips on named proof | Cloud chain designs proof **in** — less need to recover from UI path loops | **V**/I |

---

## 4. Decision rubric — Captain force Ship vs allow IDE

### 4.1 Force Ship / cloud agent (must)

Captain **must** hand work to Grok Ship scout→ship→adversarial→captain merge (or outer-loop cloud agent) when **any** of:

| Rule ID | Trigger | Counterexample if ignored | Label |
| --- | --- | --- | --- |
| **R1** | Merge-bound Socratink product change (will open/merge PR to main) | `#7` + `357a2e9e` thrash-overlapping large UI merge | **I** (N031/N063/S031) |
| **R2** | Auth / BYOK / secrets / session identity / hotel-safety | Pre-#14 sniff culture; `#10` needs FM-PRREV | **V** |
| **R3** | Multi-file phase / new invariant / library+wire | Widening one IDE session instead of `#9` then `#11` | **V** |
| **R4** | Thrash tripwire already firing: ≥3 identical tool sigs **OR** ≥5 edit cycles on one file without green gate | `b23609bb` 93×/85× chat-surface; `357a2e9e` 126× styles | **V** (S030/H37) |
| **R5** | Session >~15–30 min without restated plate+proof (or trust/away) | `a09316e9` FreeLLMAPI away | **V**/I (S014) |
| **R6** | Needs independent review before “proof closed” | Treating `#10` unit wrap as live Chat closed | **V** (N050/N044) |

### 4.2 IDE-local acceptable (with tripwires)

Captain **may** keep work in IDE when **all** of:

| Rule ID | Condition | Positive exemplar | Label |
| --- | --- | --- | --- |
| **A1** | Plate-bound **hotfix**: one causal owner, tiny diff, named proof | `#6` OIDC boot (+19/−8) via `b06e3da7` | **V** |
| **A2** | Visual / CSS poke with explicit Plate/cwd/stop mid-UI | W4 `f5892573`; not multi-hour styles thrash | **V**/A |
| **A3** | Research / Scout report-only (no PR, no push) | Factory Scout; W6 skill scout | **V** |
| **A4** | Destructive restart with hard fence + stop-on-proof planned | `fae4006d` fence OK **only if** proof added (else fail F2) | **I** |
| **A5** | Duration short; thrash tripwire armed; **not** merge-bound auth | Goal Prompt `1def40b7` shape | **V**/I |

### 4.3 Explicit counterexamples

| Claim | Counterexample | Lesson |
| --- | --- | --- |
| “High Axis A ⇒ healthy IDE loop” | `b23609bb` Axis A 1.091 + 1770-tool thrash | Score loop health separately (S065) **V** |
| “It shipped so IDE was fine” | `#7` merged with verify_ok p≈0.23 + thrash overlap | Ship ≠ verify **V** |
| “Cloud is always slower/worse” | `#8–#14` same-day phased happy chain vs thrash weeks | Cloud carries plate/proof culture **V** |
| “Tiny IDE always OK for auth” | Identity sniff until `#14` fail-closed | Auth → cloud + FM-PRREV **V** |
| “Just continue the thrash thread” | `3f9a6631` mid-thrash user correction | Hard stop; new plate (S054) **V** |
| “Invent IDE id for #8–#15” | Verified gap: IDE∩PR = none | Join via bcId only (N070) **V** |

### 4.4 Captain decision flowchart (copy)

```text
Is this merge-bound OR auth/secrets/identity OR multi-file phase?
  YES → FORCE Ship/cloud (R1–R3). Paste /goal+proof+stop. FM-PRREV if auth.
  NO  → Is thrash tripwire firing OR >15–30m without plate?
          YES → STOP; replate OR hand to Ship (R4–R5).
          NO  → IDE OK if A1–A5; keep tripwire live; stop-on-proof.
```

---

## 5. Codex recovery contrast (optional)

Codex pool is **not** thrash-dominated like home-live UI (thrash 4/80 vs Cursor 42/132) **(V)**. Fatal thrash cards show low happy/verify; recovery-success flips when **named proof / stop-on-green** lands **(V)** codex-recovery-cards).

**Inference:** Forcing cloud Ship is not “anti-IDE ideology” — it imports the same flip (plate+proof+stop) that recovers Codex sessions, **before** UI path thrash burns a day. IDE thrash∩ship skips that flip and still scores high Axis A.

---

## 6. Unknowns / soft gaps

| Gap | Status |
| --- | --- |
| Causal session→PR for `b23609bb`↔#4–#6 (beyond window soft join) | **U**/I — do not harden without commit-line proof |
| Net product value of thrash commits (exit codes / residual bugs) | **U** (evidence-chains) |
| IDE parents for `#8–#15` | **Verified none** in packs; Mac re-scan skipped |
| Whether `#7` browser checklist items ran outside PR body | **U** |

---

## 7. Sources (prefer/extend)

- `FM-AGENTENG-01-loops.md` / `loops-v2-session-mine.json`
- `FM-AGENTENG-01-happy-paths.md`, `happy-nuggets.md`, `evidence-chains.md`
- `strata-scores-v3.json`, `brain-pedagogy-stratum.md`
- `cloud-pr-join.md` + `.json`, `cloud-pr-join-transcript-mine.*`
- `gold-pr-brain-crosslink.md` + `.json`, `start-tomorrow-onepager.md`
- `codex-recovery-cards.md` (contrast)
- `canonical-extract-index.md` (N*/S* densest)

---

## 8. Success check

- [x] Decision rubric with force-Ship vs IDE-OK rules + counterexamples
- [x] ≥5 IDE thrash∩ship exemplars (`b23609bb`, `a09316e9`, `357a2e9e`, `3f9a6631`, `fae4006d`, +`f4d88dd4`)
- [x] ≥5 cloud contrasts (C1–C10; gold `#8–#14` habits)
- [x] Labels Verified/Assumption/Inference/Unknown
- [x] Mirrored under `/home/box/agent-data/grok-ship/reports/`
- [x] Brain untouched · factory not done · no PR · no SendToUser · Mac sync skipped

---
*Researchy burn-tranche-3 executor · FM-AGENTENG-01 · T3.3 ide-vs-cloud-ship*

# Factory / crew wake lessons — Firstmate (T4.5)

- **As-of:** 2026-09-16 02:11 CT
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-4 · T4.5
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac sync skipped
- **Companion JSON:** `factory-crew-wake-lessons.json`
- **Audience:** Firstmate routing Captain work to the right crew lane
- **Question:** When to wake **Loops** vs **Ship-cloud** vs **IDE-local** vs **Researchy** vs **Nole**?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**

---

## 0. One-liner

Paste `/goal`+proof+stop first → if merge-bound/auth/multi-file → **Ship-cloud** → if thrash/plate missing → **Loops** tripwire → if evidence-only → **Researchy** → if waste/roster → **Nole** → IDE-local only for tiny plate-bound hotfixes with tripwire armed.

---

## 1. Crew lane map (who does what)

| Lane | Role | Merge? | Brain? | Primary evidence spine |
| --- | --- | --- | --- | --- |
| **Firstmate** | Router / refuse-without-plate / P0 checklist | No (Captain merges) | No | start-tomorrow · FM-AGENTENG-01.md |
| **Loops** | Habit/tripwire doctrine (N*/S*); daily top-10; plate enforcement | No | No | FM-AGENTENG-01-loops / extract |
| **Ship-cloud** | Grok Ship scout→ship→adversarial→captain; `cursor/*` cloud agents | Push branch only; Captain merges | No | gold #8–#14 · ide-vs-cloud R1–R6 |
| **IDE-local** | Cursor home-live short hotfix / visual poke | Avoid merge-bound | No | #6 shape · A1–A5 |
| **Researchy** | Research-only reports under agenteng-runs/reports | **Never** | **Never** | N001/S034 · this burn |
| **Nole** | Keep/Fix/Cut auditor — waste, roster, skill SoT | No | No | FM-AGENTENG-01-nole |
| **dr eggbot / CW** | Product/competitor lanes (out of this wake table core) | per charter | product only via Captain | inventory |

**Verified:** Scout/Researchy never merges; Captain merges; IDE∩gold #8–#15 parent sessions = none.

---

## 2. Decision table — wake whom

| ID | Trigger (if ANY unless noted) | Wake | Do **not** wake | Label |
| --- | --- | --- | --- | --- |
| **W1** | Merge-bound Socratink product change (will open/merge PR to main) | **Ship-cloud** | IDE-local as sole path | **V**/I (N031/N063/R1) |
| **W2** | Auth / BYOK / secrets / session identity / hotel-safety / PKCE / OAuth | **Ship-cloud** + FM-PRREV | IDE-local | **V** (R2 · #8–#15) |
| **W3** | Multi-file phase / new invariant / library+wire | **Ship-cloud** (phase plates) | One long IDE session | **V** (R3 · #9→#11) |
| **W4** | Open PR already cloud (`cursor/*` + bcId) needs fix/judo | **Ship-cloud** same bc / new plate turn | IDE rewrite of cloud tip | **V** (#15 L410) |
| **W5** | Needs independent review before “proof closed” | **Ship-cloud** adversarial / FM-PRREV | Self-green in same thread | **V** (N050/R6 · #10) |
| **W6** | Thrash tripwire: ≥3 identical tool sigs **OR** ≥5 edit cycles on one file without green gate | **Loops** (STOP/replate) → then Ship if merge-bound | “just continue” | **V** (S030/R4) |
| **W7** | Session >~15–30 min without restated plate+proof; trust/away | **Loops** refuse / replate | Bare continue | **V**/I (S014/R5) |
| **W8** | Missing `/goal` Outcome / proof / stop / Not-in-this-PR at boot | **Loops** + Firstmate refuse boot | Any coding bot | **V** (N010/S010) |
| **W9** | Plate-bound **hotfix**: one causal owner, tiny diff, named proof (e.g. #6 OIDC +19/−8) | **IDE-local** OK | Unnecessary full Ship if A1–A5 all true | **V** (A1) |
| **W10** | Visual/CSS poke with explicit plate+cwd+stop; short; tripwire armed | **IDE-local** OK | Multi-hour styles thrash | **V**/A (A2) |
| **W11** | Research / evidence / join / watch card / mine — no PR no push | **Researchy** | Ship implement; Brain mutation | **V** (N001) |
| **W12** | Open watch on in-flight PR (#15) — size/risk vs gold | **Researchy** (report) + Captain hold | Merge from Researchy | **V** (T4.4) |
| **W13** | Crew hygiene / skill twins / waste GiB / sidebar Cut-Fix-Keep | **Nole** | Coding Ship for roster | **V** (nole annex) |
| **W14** | High Axis-A ship score but thrash_p high | **Loops** (S065 score loop≠ship) → Ship if merge-bound | Celebrate Axis-A alone | **V** |
| **W15** | Next phase after green proof | **Loops**/Firstmate new `/goal` | Continue old thread | **V** (N062 · #15 note) |
| **W16** | CONCERN / Unverified residual before Phase close | **Firstmate** track + **Ship** review | Market closed | **V** (N044/S044) |
| **W17** | Join cloud work observability | **Researchy** via bcId/PR footer only | Invent IDE session ids | **V** (N070/S070) |
| **W18** | Destructive restart / empty-state | **IDE-local** only if hard fence **and** stop-on-proof planned | Fence-only without proof (F2) | **I** (A4) |

### Compact flowchart (Firstmate copy)

```text
Has /goal + proof + stop + Not-in-this-PR?
  NO  → wake Loops / refuse boot (W8)
  YES → Is merge-bound OR auth/secrets/identity OR multi-file phase OR open cursor/* PR?
          YES → wake Ship-cloud (+ FM-PRREV if auth) (W1–W5)
          NO  → Thrash tripwire OR >15–30m without plate?
                  YES → wake Loops STOP/replate; hand Ship if became merge-bound (W6–W7)
                  NO  → Evidence/watch/join only?
                          YES → wake Researchy (W11–W12, W17)
                          NO  → Roster/waste/skill SoT?
                                  YES → wake Nole (W13)
                                  NO  → IDE-local OK iff A1–A5 (W9–W10, W18)
```

---

## 3. Negative exemplars (wrong wake)

| Wrong wake | What happened | Correct wake | Label |
| --- | --- | --- | --- |
| IDE thrash for merge-bound UI | `#7` ↔ `357a2e9e` thrash∩ship; weak verify | Ship-cloud + named proof | **V**/I |
| Trust Axis-A as health | `b23609bb` 1770-tool thrash + high Axis A | Loops S065; force Ship if merge-bound | **V** |
| Continue thrash thread | `3f9a6631` mid-thrash correction | Loops hard stop; new plate | **V** |
| Researchy edits / merges | doctrine breach | Researchy report-only | **V** |
| Invent IDE id for #8–#15 | Verified gap none | Researchy bcId join only | **V** |
| Close #15 / #10 without residual | CONCERN sold closed | Firstmate + FM-PRREV hold | **V** |
| IDE for Phase 4 PKCE | would break gold cloud lineage | Ship-cloud (#15 path) | **I**/V |
| Treat CI green as live OAuth closed | Actions `verify` success on #15 | Keep live Unverified explicit | **V** |

---

## 4. Firstmate P0 attach on wake

When waking **Ship-cloud**, paste:

1. `/goal` Outcome (one sentence)
2. repo + cwd
3. Proof = named commands
4. Stop + Not-in-this-PR
5. If auth: require FM-PRREV before merge
6. If follow-on phase: new plate (N062); accept prior residuals explicitly

When waking **IDE-local**, require:

1. Same plate fields
2. Thrash tripwire armed (S030)
3. Duration budget ≤15–30 min
4. Explicit **non-merge** unless Captain promotes to Ship mid-flight

When waking **Researchy**:

1. Research-only · Brain untouched · no factory done · no SendToUser · no PR
2. Labels Verified/Assumption/Inference/Unknown
3. Outputs under `agenteng-runs/` (+ reports mirror)

When waking **Nole**:

1. Keep/Fix/Cut only
2. No product code ship
3. Point at GiB / roster / skill SoT evidence

When waking **Loops**:

1. Tripwire / N* / S* enforcement
2. Do not implement product PR

---

## 5. Tie to open #15 (worked example)

| Question | Answer | Wake |
| --- | --- | --- |
| Who implements Phase 4 PKCE? | Cloud agent bc-28d7d9fb… | **Ship-cloud** (already) |
| Who merges? | Captain after review | **not** Researchy / not IDE |
| Who watches size vs gold? | This T4.4 card | **Researchy** |
| Who blocks merge on #10 CONCERN + live Unverified? | Firstmate checklist | **Firstmate** + FM-PRREV |
| Who stops mid-flight OAuth widen? | Plate stop (L1/L410) | **Loops** doctrine if violated |
| Who audits crew waste while waiting? | Optional parallel | **Nole** |
| Does CI green alone unlock merge? | **No** — still need FM-PRREV + residual honesty | **Firstmate** |

---

## 6. Sources

- `ide-vs-cloud-ship.md` / `.json` (R1–R6, A1–A5, flowchart)
- `start-tomorrow-onepager.md` (15 N* / 15 S*)
- `gold-pr-brain-crosslink.md` (#8–#14 habits; #15 open)
- `cloud-pr-join.md` + quality-cards QC-15
- `FM-AGENTENG-01-loops.md` / extract (N*/S*)
- `FM-AGENTENG-01-nole.md` (crew Keep/Fix/Cut)
- `FM-AGENTENG-01.md` P0 table
- Phase #15 watch card (companion T4.4)
- GitHub MCP check_runs on #15 (verify success)

---

## 7. Success check

- [x] Decision table with triggers for Loops / Ship-cloud / IDE-local / Researchy / Nole
- [x] Flowchart + negative exemplars + #15 worked example
- [x] Labels Verified/Assumption/Inference/Unknown
- [x] Brain untouched · factory not done · no PR · no SendToUser · Mac skipped
- [x] Mirrored under `/home/box/agent-data/grok-ship/reports/`

---
*Researchy burn-tranche-4 executor · FM-AGENTENG-01 · T4.5 factory-crew-wake-lessons*

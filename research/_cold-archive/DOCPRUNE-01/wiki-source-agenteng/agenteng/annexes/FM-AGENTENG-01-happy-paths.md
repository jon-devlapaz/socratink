# FM-AGENTENG-01 — Software lifecycle happy paths (nugget-dense)

- **As-of:** 2026-09-15 ~20:55 CT
- **Job:** FM-AGENTENG-01 happy-paths · Researchy EXTRACT · research-only · no PR · no SendToUser
- **Companions (DO NOT thin):** `happy-nuggets.md` (**n=78**), `smell-catalog-dense.md` (**T1–T26**), `happy-smell-pairs.md` (**~85 pair rows**)
- **Also:** `evidence-chains.md` · `nugget-vs-smell.md` (ambiguous Max Jev n=38)
- **Corpus:** `jon-devlapaz/socratink` PRs #1–#15 · FM-CTXSMELL-01 · FM-PRREV-01 · loops · strata-v3 · Brain EVT/SRC/PROC · praxist
- **Labels:** verified / inference / unknown · privacy-redacted
- **Gold chain:** `#8→#9→#10→#11→#12→#13→#14` (+`#6`). **Anti:** `#7`, EVT-0001, `#1` corpus burial, `#5` landmine.
- **Correction:** `#11`–`#14` = **merged:true** happy follow-ups (state=closed is GitHub’s merged marker — not failed closes).

## Brain / scope contract

- Improve agentic engineering loops for Socratink.
- No Brain mutation. No universal law from n≈15 PRs + n≈50–132 sessions.
- Giant skill-corpus line counts (#1) are **not** product behavior expansion without note.
- This file **cites** dense packs; it does not replace them.

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
- `Cursor Agent <cursoragent@cursor.com>` + Co-authored-by jon on #8; PR footers `bc-*` on #8–#15.
- Branch prefix `cursor/*` on #8–#15; `codex/*` on #5; earlier `feat/`/`fix/`/`chore/` human-ish.
- PR user login always `jon-devlapaz` (merge authority).

**Join method (verified):** soft overlap session `[started,ended]` ∩ PR `[created−6h, closed+6h]` on product-socratink. Packs have **empty `pr_urls`**. Sept 15–16 cloud PRs: **zero** local session hits.

**Correction (verified via GitHub MCP):** `#11`–`#14` all `merged: true` (happy follow-ups after `#10`). Do not frame as failed/unmerged closes. Gold = `#8→#9→#10→#11→#12→#13→#14` (+`#6`).

---

## 2. Lifecycle stage exemplars — RIGHT vs WRONG (atomic, H/T-cited)

RIGHT bullets cite canonical **H-ids** from `happy-nuggets.md` (n=78). WRONG bullets cite **T-ids** from `smell-catalog-dense.md` (T1–T26) + session/PR evidence.

### Research / spike

**RIGHT**
- Factory Scout `status=done` report-only (FM-CHATSIG/CTXSMELL/TYPESAFE/PRREV) · factory.db · **H01**
- Praxist negative-result same-day learning · **H03** / anti **T20**
- **H01** Factory Scout: research-only report under reports/<id>.md; no PR, no push, no Brain mutation. · `happy-nuggets.md`
- **H02** Skill Scout gated DISCOVER: contract → inventory → ≤3 finalists → checkpoint questions → opt-in web; VERIFY… · `happy-nuggets.md`
- **H03** Negative-result Scout: stop when plate proof fails; write dated .agents/learnings/ same day with stop rules. · `happy-nuggets.md`
- **H04** Dogfood/vet/trace/scientific language → strengthen proof only; never authorize adjacent product build. · `happy-nuggets.md`
- **H05** Primary-source web verify (HTTP 200) for framework URLs; label Verified/Assumption/Unknown; ban fabricated … · `happy-nuggets.md`
- **H06** Parallelize only breadth-first Scout; coding Ships stay single-agent + reviewer subagent. · `happy-nuggets.md`
- **H07** Keep chat-signal / eval / postmortem research behind load-on-demand pointers; do not paste into every session. · `happy-nuggets.md`
- **H69** Factory Scout kinds only (scout=8 done/underway); research tickets write under research/ before any Ship auth. · `happy-nuggets.md`

**WRONG**
- Validation/dogfood/trace language → adjacent product build · **T1** · EVT-0001 / SRC-0010 / PROC-0002
- `.gitignore` ask → `/tmp` prototype thrash · **T1+T2+T16** · `f4d88dd4`
- Finish 4 gens after `parent_eligible=false` · **T10+T20** · praxist 2026-08-30
- Research VERIFY widens discovery mid-flight · **T25** · anti Skill Scout H02
- Scout quietly opens product PR without scope flip · **T1+T17** · contrast factory scout closes
- Treat n≈15 PRs as universal agentic law · **—** · Brain/scope contract
- Jurisdiction bleed Brain≠code≠harness from research plate · **T17** · EVT class

### Planning / plate / spec

**RIGHT**
- Phase PR bodies: one Outcome + Not-in-this-PR fences (#8–#11) · **H08/H09/H15**
- Explicit mid-UI Plate `f5892573` · **H16**
- **H08** One-sentence observable Outcome + explicit Out-of-scope / Not-in-this-PR fences before any tools. · `happy-nuggets.md`
- **H09** Phased authority slices: session cookie → credential library → isolation proof → wire → cost → identity → f… · `happy-nuggets.md`
- **H10** Ship brief must carry /goal + repo + cwd + proof + stop + fences; Firstmate refuses boot if missing. · `happy-nuggets.md`
- **H11** Resume Codex/Cursor: rewrite /goal + proof + stop from current repo truth; ban “continue where left off” al… · `happy-nuggets.md`
- **H12** Paste the same plate at the top of every continuation message in long threads. · `happy-nuggets.md`
- **H13** Two-track factory: (A) partnership harness improvements vs (B) pedagogical product code — never one plate. · `happy-nuggets.md`
- **H14** Name phase + owner area in the plate (e.g. Phase 2 credential library; Chat stays jon-local). · `happy-nuggets.md`
- **H77** Ban multi-issue openers (“validate these two…”) — force one outcome sentence. · `happy-nuggets.md`
- **H15** Plate ≤5 lines: Outcome / Not-in-this-PR / Proof / Stop / Owner. · `happy-nuggets.md`
- **H16** Explicit mid-UI Plate even for visual work: “Plate: only implement a local aperture…” · `happy-nuggets.md`
- **H17** Destructive restart with fence: clear “do not salvage” + single surface named. · `happy-nuggets.md`
- **H18** Handoff plate with Outcome + leave-untouched list (Flue/Brain/wiki) before deletes. · `happy-nuggets.md`
- **H19** Goal Prompt with Context and Authority + Stop when proven (closest /goal in corpus). · `happy-nuggets.md`
- **H20** Name the contract file in the plate (e.g. scripts/learner-key.test.mjs) before impl. · `happy-nuggets.md`
- **H21** Jurisdiction fence in plate: Brain ≠ code ≠ harness; no Brain mutation without contract ticket. · `happy-nuggets.md`
- **H22** Subagent packet schema: outcome, cwd, proof, stop, boundaries, output format — refuse sprawl boot if missing. · `happy-nuggets.md`
- **H70** Done-when a stranger could check: falsifiable commands + observable check in /goal. · `happy-nuggets.md`

**WRONG**
- Multi-issue “validate these two…” opener · **T3** · `c2a77998` · H77 antidote
- “I trust you” / away without restated plate · **T11** · `a09316e9`
- Resume Codex without `/goal` rewrite · **T15** · `b06e3da7` intake · F8
- Kitchen-sink plate (research+ship+UI) · **T22+T3** · strata mean plate≈1.03
- Widen Not-in-this-PR into same diff · **T1+T24** · anti H07/H05-pairs
- Missing Outcome/Proof/Stop/Owner fields · **T22** · happy-nuggets plate ≤5 lines
- Subagent boot without packet outcome/cwd/proof/stop · **T9+T23** · `e8a25b04` · sprawl
- Two-track (harness vs product) collapsed into one plate · **T17** · H13 antidote

### Implementation

**RIGHT**
- Narrow #6 (+19/−8) after #5 landmine · **H30/H47** class
- Library-first #9 before wire #11 · **H23/H24**
- #13→#14 smallest identity then fail-closed · **H25/H39/H71**
- **H23** Library-first before Chat wire: ship encrypted store with Chat still jon-local. · `happy-nuggets.md`
- **H24** After isolation proof, open a NEW plate for wire — do not widen the proof PR. · `happy-nuggets.md`
- **H25** Smallest-owner identity fix: prefer instanceId over conversationId sniff (+67/−4). · `happy-nuggets.md`
- **H26** Tiny cost/specifier tweak as its own PR after wire (+21/−8 gpt-5-nano). · `happy-nuggets.md`
- **H27** Narrow hosting fallback: skip loopback on Vercel; forward OIDC; leave local jon-local unchanged. · `happy-nuggets.md`
- **H28** Observability slice: stamp questionnaire metadata on spans; extend live smoke to two-turn questionnaire. · `happy-nuggets.md`
- **H29** Cloud agent on cursor/<phase>-… branch; one owner area; push branch only — outer loop opens PR after review. · `happy-nuggets.md`
- **H30** Prefer small causal diffs (#6/#13/#14 shape) over giant catch-up corpora (#1 anti). · `happy-nuggets.md`
- **H31** Load-on-demand skills: attach only when plate names the owner; ban skill dumps at intake. · `happy-nuggets.md`
- **H32** Install worktree before first commit: pnpm install --frozen-lockfile; do not re-commit-fail. · `happy-nuggets.md`
- **H71** Fail-closed missing key when wiring stored OpenAI into Chat; smallest paste UI only. · `happy-nuggets.md`
- **H78** stratum careful_good + happy_path_fit≥0.7 sessions (e.g. 1def40b7, f43dd58a, 16a29d67) as impl replay exemp… · `happy-nuggets.md`

**WRONG**
- Extreme Read/StrReplace on chat-surface/CSS w/o green gate · **T2** · `b23609bb` 1770 tools, `357a2e9e`, `3f9a6631`
- Giant catch-up PR burying UI under +90k skill corpus · **T12+T6** · PR #1
- Merge #5 with known Vercel DATABASE_URL landmine · **T13+T22** · PR #5→#6
- UI motion + unchecked browser checklist as proof · **T7+T14+T24** · PR #7
- Skill dump at intake before plate set · **T6** · `c585e8d6`,`df80810e`
- Happy_mid + thrash still claimed pure happy · **T2+T26** · nugget-vs-smell 35/38 mixed
- Wire Chat before library/isolation proof · **T13** · anti #9→#10→#11 order
- Sniff conversationId when instanceId thin · **T8+T25-gov** · anti #14

### Verify / CI

**RIGHT**
- Named proofs `test:learner-key`/`credentials`/`check`/`smoke` · **H33**
- #10 CONCERN residual recorded (not overclaimed) · **H42**
- **H33** Named proofs in PR body: pnpm test:<slice> && pnpm check && pnpm smoke (or narrowed contract). · `happy-nuggets.md`
- **H34** Intentional verify/ship probe as its own tiny PR (1-line HTML auto-deploy probe). · `happy-nuggets.md`
- **H35** Hotel-safety / isolation proof phase: outcome = overlapping streams cannot mix keys; not paste UI. · `happy-nuggets.md`
- **H36** Honest “live unverified” checkbox beats fake green UI checklist. · `happy-nuggets.md`
- **H37** Thrash tripwire: ≥3 identical tool sigs OR ≥5 edit cycles on one file without green gate → stop, rewrite pl… · `happy-nuggets.md`
- **H38** Repeated targeted gate in-loop (e.g. tsc) rather than end-only hope. · `happy-nuggets.md`
- **H39** Fail closed when identity/proof thin: delete sniff fallback; error on missing/unparseable instance id. · `happy-nuggets.md`
- **H40** Jev/TypeSafe as judgment lane for smell/plate/ship-worthiness — code owns control flow; confidence-gate unc… · `happy-nuggets.md`
- **H72** Unchecked UI checklist ≠ verify; require named contract or honest “unverified” before merge language. · `happy-nuggets.md`

**WRONG**
- Claim hotel-safety closed for live Chat from unit wrap only · **T7** · FM-PRREV CONCERN #10
- Unchecked live Chat marketed as fully proven · **T7** · #6/#13 bodies
- Missing verification culture (14/50 pilot; 15/132 strata) · **T7** · CTXSMELL / strata-v3
- Unchecked UI checklist ≠ verify · **T14+T24** · PR #7
- CI/green local ≠ host boot path proved · **T22** · PR #5 ci_gap
- Fast-wrong band claiming done · **T26** · strata-v3 fast_wrong
- Packet/LEDGER ceremony substitutes for named proof · **T23** · sprawl-audit
- Ambiguity: PR-10/12/14 mixed happy+verify residual · **T7** · nugget-vs-smell

### Review

**RIGHT**
- FM-PRREV independent Scout on #8–#10 · **H41**
- `#11–#14` status correction merged:true · **H46**
- **H41** Independent FM-PRREV / adversarial-review Scout on security-adjacent PRs before treating proof as closed. · `happy-nuggets.md`
- **H42** Record residual risk note when merging with CONCERN; do not market unit wrap as live Chat closed proof. · `happy-nuggets.md`
- **H43** Fresh adversarial-review subagent: branch vs base; no tests during review; error blocks PR; ask-user → Firs… · `happy-nuggets.md`
- **H44** Evidence-chain reconstructability: intent → authority → tools → outcome → remediation (label verified/infer… · `happy-nuggets.md`
- **H45** Anti-LOC partnership score: measure stories accepted / escaped defects / cost-per-feature — not tool counts… · `happy-nuggets.md`
- **H46** Correct #11–#14 status: merged:true happy follow-ups — never frame as closed-fail / phase-skip. · `happy-nuggets.md`
- **H73** Grok Ship doctrine: never merge without captain; ask-user severity escalates to Firstmate. · `happy-nuggets.md`

**WRONG**
- Merge #10 without residual-risk note · **T7** · anti H42/H27
- Self-review only until user forces change · **T4** · `3f9a6631`
- Market #10 as closed live security proof after CONCERN · **T7** · AH3
- Fix-while-reviewing instead of review-only · **T4** · anti H43
- Skip FM-PRREV when BYOK risk surface grows (#11+) · **T25-gov** · inference caution
- Frame #11–#14 as failed closes because state=closed · **—** · **correction** merged:true

### Ship / follow-up

**RIGHT**
- Same-day #5→#6 hotfix · **H47/H28-class**
- Gold outer-loop one-liner · happy-nuggets header / **H32-class**
- Cloud join via bcId/PR body — never fake IDE ids · **H29**/pairs · anti **T21**
- **H47** PR body = Outcome / What changed / Proof / Not-in-this-PR; captain merges (never cloud agent). · `happy-nuggets.md`
- **H48** Same-day narrow hotfix after warned host landmine (#5→#6 OIDC boot +19/−8). · `happy-nuggets.md`
- **H49** Route merge-bound Socratink work through Grok Ship scout→ship→adversarial→captain merge; IDE thrash is non-… · `happy-nuggets.md`
- **H50** Outer-loop one-liner: research→/goal+fences→named contract→cloud slice→test+check+smoke→PRREV→merge→new /goal. · `happy-nuggets.md`
- **H51** Cloud-agent fingerprint join: cursor/* branch + CURSOR_AGENT_PR_BODY + bc-* footer — do not invent IDE sess… · `happy-nuggets.md`
- **H52** Populate pr_urls / bcId into session packs so chat-signal can join cloud work. · `happy-nuggets.md`
- **H53** Split skill-corpus PRs from product behavior PRs (#1 lesson). · `happy-nuggets.md`
- **H54** Open Phase 4 (#15) only with plate+proof; do not widen mid-flight; accept #10 residual risks explicitly. · `happy-nuggets.md`
- **H55** factory.db task.result = PR URL / report path; status→done only after captain/Firstmate ack. · `happy-nuggets.md`
- **H74** Copy gold chain shape not any single large diff: #8–#10 phased fences + #6/#13/#14 small closes. · `happy-nuggets.md`
- **H56** Handoffs = artifact path + short refs (session_id, PR #) — never dump parent transcript. · `happy-nuggets.md`
- **H57** Researchy EXTRACT → mirror reports to /home/box/agent-data/grok-ship/reports/ without SendToUser. · `happy-nuggets.md`
- **H58** Packet-only brief for side-chat workers; refuse sprawl boot.py without outcome/cwd/proof/stop. · `happy-nuggets.md`
- **H59** Single-source skills: pack canonical; workflows = checkout of pack (fix G2 dual-source drift). · `happy-nuggets.md`
- **H60** Archive-before-clone (Nole W0): cold-archive QC/landing dumps before growing another fat tree. · `happy-nuggets.md`
- **H61** Named-agents-only roster: cut unnamed New Bot/New Agent stubs; pin only live profile dirs. · `happy-nuggets.md`
- **H75** Lay off lifestyle skill packs (site-playbooks-*) on Socratink crew; keep role-owned skills wired. · `happy-nuggets.md`
- **H62** After costly fail: dated .agents/learnings/ note — Requested / Substituted / Evidence / Stop rule / Regress… · `happy-nuggets.md`
- **H63** Stall→replan: same fail ≥2× ⇒ rewrite plate (Progress Ledger / Magentic-One pattern); never identical tool … · `happy-nuggets.md`
- **H64** Live observation → identity fix → fail-closed harden as sequential recovery PRs (#13→#14). · `happy-nuggets.md`
- **H65** When merge gate warns host-specific landmine: block merge OR schedule hotfix plate before merge. · `happy-nuggets.md`
- **H66** Session decision table: continue / rewind / compact / clear / subagent / stall→replan based on plate load-b… · `happy-nuggets.md`
- **H67** Codify EVT tripwires already in AGENTS; add learnings when campaigns fail — folder still thin, grow it. · `happy-nuggets.md`
- **H68** Velocity∩quality bands careful_good/fast_good with gap=none are preferred recovery targets for replay — not… · `happy-nuggets.md`
- **H76** After ≥2 failed corrections: /clear + rewrite plate (do not keep correcting polluted approach). · `happy-nuggets.md`

**WRONG**
- Ship expansion then revert (~3.5k) · **T1** · EVT-0001 / SRC-0010
- Campaign completionism after negative proof · **T20** · praxist
- Cloud ship with empty pr_urls / no IDE join · **T21** · #8–#15 AH6
- Thrash-overlapping merge that “succeeds” · **T2+T24** · #7 ∩ `357a2e9e`
- One-more-polish instead of park/cancel · **T10** · anti H25
- Silent phase widen without new /goal · **T3** · anti H24
- QC/landing multi-GB clone sprawl · **T20-disk** · Nole G4 / H33
- Ambiguity Jev smell-heavy on PR-1/5/7 · **T12+T13+T24** · nugget-vs-smell

---

## 3. Happy-path patterns (software lifecycle)

Normative recommendations grounded in spine (inference), not measured rates. Nugget cites = **canonical** `happy-nuggets.md` IDs.

### HP1 — Plate → narrow owner → named proof → stop
AGENTS §§1–6 / loops W1. Exemplars: #6, #13, #14, Scouts. Nuggets: **H08, H15, H30, H33, H37**.

### HP2 — Phased authority with fences
#8 session → #9 store → #10 proof → #11 wire → #12 nano → #13 identity → #14 fail-closed. Nuggets: **H09, H14, H23, H24, H74**.

### HP3 — Incident → same-day narrow fix
#5 landmine → #6 OIDC boot. Prefer over thrash-overlapping merges (`b23609bb`). Nuggets: **H47, H30**; pairs H16↔T22/P4.

### HP4 — Independent review Scout on security-adjacent PRs
FM-PRREV CONCERN is a happy-path *feature*. Nuggets: **H41, H42, H43**.

### HP5 — Negative result → dated learning → stop rule
Praxist; EVT→PROC. Nuggets: **H03, H04, H67**; anti **T20**.

### HP6 — Fail closed when identity/proof thin
#14 deletes sniff; AGENTS hosted secrets. Nuggets: **H39, H71, H64**.

---

## 4. Anti-happy-paths (linked to T-catalog + PR outcomes)

| ID | Anti-pattern | Smell | Local outcome |
| --- | --- | --- | --- |
| AH1 | Validation-driven scope substitution | T1 | EVT revert ~3.5k |
| AH2 | Tool/path thrash without gate | T2 | `b23609bb`,`357a2e9e`,`3f9a6631` |
| AH3 | Proof theater (unit ≠ live path) | T7 | #10 CONCERN |
| AH4 | Merge with known host landmine | T13+T22 | #5→500→#6 |
| AH5 | Giant unrelated corpus in product PR | T12+T6 | #1 +90k |
| AH6 | Cloud ship, no local session join | T21 | #8–#15 invisible to packs |
| AH7 | Campaign completionism | T20 | Praxist 4× gens |
| AH8 | Handoff/sprawl rot | T9+T23 | `e8a25b04`,`64cfb0da` |
| AH9 | Clear goal, no stop-on-proof | T2+T7 | `fae4006d` |
| AH10 | Trust-without-plate / resume w/o /goal | T11+T15 | `a09316e9`,`b06e3da7` |
| AH11 | Mixed sessions treated as pure happy | T2+T26 | nugget-vs-smell 35/38 mixed |
| AH12 | UI size-without-proof | T24 | #7 |

---

## 5. Happy↔Smell crosswalk (pointer — do not thin pairs file)

- **File:** `happy-smell-pairs.md` · **pair rows:** 85 (plus provisional H01–H36 index in that file).
- **Smell catalog:** `smell-catalog-dense.md` · **T1–T26**.
- **Canonical happy IDs for Captain copy:** `happy-nuggets.md` **H01–H78** (pairs file still carries provisional H01–H36 labels — use nuggets catalog when IDs conflict).
- High-value pairs (examples): H01↔T1 · H03↔T20 · H12↔T2 · H13↔T26 · H16↔T22 · H20↔T7 · H29↔T21 · H35↔P1 · H36↔T2.
- Ambiguity Max Jev: `nugget-vs-smell-scores.json` n_ok=38 → primary_label mixed 35 / smell 3 (mean happy≈0.24, smell≈0.80).

---

## 6. Joined timeline (Aug 25 – Sep 16 CT)

```
2026-08-24  EVT-0001 / SRC-0010 scope correction
2026-08-25  PR #1 UI+corpus  ~ 29896b44, c585e8d6
2026-08-26  PR #2 Gateway · #3 deploy probe  ~ df80810e, 29896b44
2026-08-27  PR #4 Braintrust spans  ~ 45147840
2026-08-28  PR #5 Northflank · PR #6 OIDC  ~ b06e3da7 / b23609bb thrash
2026-08-29  PR #7 UI motion  ~ 357a2e9e thrash
2026-08-30  Praxist negative campaign + learning
2026-09-15  PR #8–#13 cloud phase/BYOK · FM-PRREV #10 CONCERN · no pack sessions
2026-09-16  PR #14 fail-closed · PR #15 open Phase 4
```

Times: America/Chicago (CT = UTC−5).

---

## 7. Recommendations for Captain (brief)

1. Require plate+proof+stop; ban resume/trust/multi-issue openers (**H08/H11/H15/H77**).
2. Keep FM-PRREV on auth/BYOK; CONCERN mergeable only with residual-risk note (**H41/H42**).
3. Populate `pr_urls`/`bcId` into packs — else Sept cloud work invisible (**H29**/T21).
4. Split skill-corpus PRs from product behavior PRs (#1 / T12).
5. Codify EVT tripwires + dated learnings (**H03/H67**).
6. Prefer #6/#13/#14 shape over thrash-overlapping merges (**H30/H74**).
7. Gate “happy” claims via nugget-vs-smell when mid-happy+thrash (35/38 mixed).

---

## Atomic nugget index

Source: `happy-nuggets.md` exhaustive catalog (**n=78**). Canonical IDs — do not renumber; append only.

| ID | Category | Nugget (≤1 line) |
| --- | --- | --- |
| **H01** | research | Factory Scout: research-only report under reports/<id>.md; no PR, no push, no Brain mutation. |
| **H02** | research | Skill Scout gated DISCOVER: contract → inventory → ≤3 finalists → checkpoint questions → opt-in w… |
| **H03** | research | Negative-result Scout: stop when plate proof fails; write dated .agents/learnings/ same day with … |
| **H04** | research | Dogfood/vet/trace/scientific language → strengthen proof only; never authorize adjacent product b… |
| **H05** | research | Primary-source web verify (HTTP 200) for framework URLs; label Verified/Assumption/Unknown; ban f… |
| **H06** | research | Parallelize only breadth-first Scout; coding Ships stay single-agent + reviewer subagent. |
| **H07** | research | Keep chat-signal / eval / postmortem research behind load-on-demand pointers; do not paste into e… |
| **H69** | research | Factory Scout kinds only (scout=8 done/underway); research tickets write under research/ before a… |
| **H08** | planning | One-sentence observable Outcome + explicit Out-of-scope / Not-in-this-PR fences before any tools. |
| **H09** | planning | Phased authority slices: session cookie → credential library → isolation proof → wire → cost → id… |
| **H10** | planning | Ship brief must carry /goal + repo + cwd + proof + stop + fences; Firstmate refuses boot if missing. |
| **H11** | planning | Resume Codex/Cursor: rewrite /goal + proof + stop from current repo truth; ban “continue where le… |
| **H12** | planning | Paste the same plate at the top of every continuation message in long threads. |
| **H13** | planning | Two-track factory: (A) partnership harness improvements vs (B) pedagogical product code — never o… |
| **H14** | planning | Name phase + owner area in the plate (e.g. Phase 2 credential library; Chat stays jon-local). |
| **H77** | planning | Ban multi-issue openers (“validate these two…”) — force one outcome sentence. |
| **H15** | spec/plate | Plate ≤5 lines: Outcome / Not-in-this-PR / Proof / Stop / Owner. |
| **H16** | spec/plate | Explicit mid-UI Plate even for visual work: “Plate: only implement a local aperture…” |
| **H17** | spec/plate | Destructive restart with fence: clear “do not salvage” + single surface named. |
| **H18** | spec/plate | Handoff plate with Outcome + leave-untouched list (Flue/Brain/wiki) before deletes. |
| **H19** | spec/plate | Goal Prompt with Context and Authority + Stop when proven (closest /goal in corpus). |
| **H20** | spec/plate | Name the contract file in the plate (e.g. scripts/learner-key.test.mjs) before impl. |
| **H21** | spec/plate | Jurisdiction fence in plate: Brain ≠ code ≠ harness; no Brain mutation without contract ticket. |
| **H22** | spec/plate | Subagent packet schema: outcome, cwd, proof, stop, boundaries, output format — refuse sprawl boot… |
| **H70** | spec/plate | Done-when a stranger could check: falsifiable commands + observable check in /goal. |
| **H23** | impl | Library-first before Chat wire: ship encrypted store with Chat still jon-local. |
| **H24** | impl | After isolation proof, open a NEW plate for wire — do not widen the proof PR. |
| **H25** | impl | Smallest-owner identity fix: prefer instanceId over conversationId sniff (+67/−4). |
| **H26** | impl | Tiny cost/specifier tweak as its own PR after wire (+21/−8 gpt-5-nano). |
| **H27** | impl | Narrow hosting fallback: skip loopback on Vercel; forward OIDC; leave local jon-local unchanged. |
| **H28** | impl | Observability slice: stamp questionnaire metadata on spans; extend live smoke to two-turn questio… |
| **H29** | impl | Cloud agent on cursor/<phase>-… branch; one owner area; push branch only — outer loop opens PR af… |
| **H30** | impl | Prefer small causal diffs (#6/#13/#14 shape) over giant catch-up corpora (#1 anti). |
| **H31** | impl | Load-on-demand skills: attach only when plate names the owner; ban skill dumps at intake. |
| **H32** | impl | Install worktree before first commit: pnpm install --frozen-lockfile; do not re-commit-fail. |
| **H71** | impl | Fail-closed missing key when wiring stored OpenAI into Chat; smallest paste UI only. |
| **H78** | impl | stratum careful_good + happy_path_fit≥0.7 sessions (e.g. 1def40b7, f43dd58a, 16a29d67) as impl re… |
| **H33** | verify | Named proofs in PR body: pnpm test:<slice> && pnpm check && pnpm smoke (or narrowed contract). |
| **H34** | verify | Intentional verify/ship probe as its own tiny PR (1-line HTML auto-deploy probe). |
| **H35** | verify | Hotel-safety / isolation proof phase: outcome = overlapping streams cannot mix keys; not paste UI. |
| **H36** | verify | Honest “live unverified” checkbox beats fake green UI checklist. |
| **H37** | verify | Thrash tripwire: ≥3 identical tool sigs OR ≥5 edit cycles on one file without green gate → stop, … |
| **H38** | verify | Repeated targeted gate in-loop (e.g. tsc) rather than end-only hope. |
| **H39** | verify | Fail closed when identity/proof thin: delete sniff fallback; error on missing/unparseable instanc… |
| **H40** | verify | Jev/TypeSafe as judgment lane for smell/plate/ship-worthiness — code owns control flow; confidenc… |
| **H72** | verify | Unchecked UI checklist ≠ verify; require named contract or honest “unverified” before merge langu… |
| **H41** | review | Independent FM-PRREV / adversarial-review Scout on security-adjacent PRs before treating proof as… |
| **H42** | review | Record residual risk note when merging with CONCERN; do not market unit wrap as live Chat closed … |
| **H43** | review | Fresh adversarial-review subagent: branch vs base; no tests during review; error blocks PR; ask-u… |
| **H44** | review | Evidence-chain reconstructability: intent → authority → tools → outcome → remediation (label veri… |
| **H45** | review | Anti-LOC partnership score: measure stories accepted / escaped defects / cost-per-feature — not t… |
| **H46** | review | Correct #11–#14 status: merged:true happy follow-ups — never frame as closed-fail / phase-skip. |
| **H73** | review | Grok Ship doctrine: never merge without captain; ask-user severity escalates to Firstmate. |
| **H47** | ship | PR body = Outcome / What changed / Proof / Not-in-this-PR; captain merges (never cloud agent). |
| **H48** | ship | Same-day narrow hotfix after warned host landmine (#5→#6 OIDC boot +19/−8). |
| **H49** | ship | Route merge-bound Socratink work through Grok Ship scout→ship→adversarial→captain merge; IDE thra… |
| **H50** | ship | Outer-loop one-liner: research→/goal+fences→named contract→cloud slice→test+check+smoke→PRREV→mer… |
| **H51** | ship | Cloud-agent fingerprint join: cursor/* branch + CURSOR_AGENT_PR_BODY + bc-* footer — do not inven… |
| **H52** | ship | Populate pr_urls / bcId into session packs so chat-signal can join cloud work. |
| **H53** | ship | Split skill-corpus PRs from product behavior PRs (#1 lesson). |
| **H54** | ship | Open Phase 4 (#15) only with plate+proof; do not widen mid-flight; accept #10 residual risks expl… |
| **H55** | ship | factory.db task.result = PR URL / report path; status→done only after captain/Firstmate ack. |
| **H74** | ship | Copy gold chain shape not any single large diff: #8–#10 phased fences + #6/#13/#14 small closes. |
| **H56** | handoff | Handoffs = artifact path + short refs (session_id, PR #) — never dump parent transcript. |
| **H57** | handoff | Researchy EXTRACT → mirror reports to /home/box/agent-data/grok-ship/reports/ without SendToUser. |
| **H58** | handoff | Packet-only brief for side-chat workers; refuse sprawl boot.py without outcome/cwd/proof/stop. |
| **H59** | handoff | Single-source skills: pack canonical; workflows = checkout of pack (fix G2 dual-source drift). |
| **H60** | handoff | Archive-before-clone (Nole W0): cold-archive QC/landing dumps before growing another fat tree. |
| **H61** | handoff | Named-agents-only roster: cut unnamed New Bot/New Agent stubs; pin only live profile dirs. |
| **H75** | handoff | Lay off lifestyle skill packs (site-playbooks-*) on Socratink crew; keep role-owned skills wired. |
| **H62** | recovery | After costly fail: dated .agents/learnings/ note — Requested / Substituted / Evidence / Stop rule… |
| **H63** | recovery | Stall→replan: same fail ≥2× ⇒ rewrite plate (Progress Ledger / Magentic-One pattern); never ident… |
| **H64** | recovery | Live observation → identity fix → fail-closed harden as sequential recovery PRs (#13→#14). |
| **H65** | recovery | When merge gate warns host-specific landmine: block merge OR schedule hotfix plate before merge. |
| **H66** | recovery | Session decision table: continue / rewind / compact / clear / subagent / stall→replan based on pl… |
| **H67** | recovery | Codify EVT tripwires already in AGENTS; add learnings when campaigns fail — folder still thin, gr… |
| **H68** | recovery | Velocity∩quality bands careful_good/fast_good with gap=none are preferred recovery targets for re… |
| **H76** | recovery | After ≥2 failed corrections: /clear + rewrite plate (do not keep correcting polluted approach). |

**Stop rules:** ≥3 identical tool sigs OR ≥5 edit cycles/file w/o green gate → stop+rewrite plate; unchecked UI checklist ≠ verify; never widen Not-in-this-PR into same diff; security-adjacent → FM-PRREV.

**Counts cited:** happy-nuggets **78** · smell **T1–T26** (26) · happy-smell-pairs **85** rows · §2 RIGHT **92** · §2 WRONG **45**.

**Gold chain:** `#8→#9→#10→#11→#12→#13→#14` (+`#6`). **Anti:** `#7`, EVT-0001, `#1`, `#5`.

---

## Verified gap — cloud-agent PRs vs home-live IDE sessions

**Verified (2026-09-15 CT):** Soft-joining pilot/strata packs finds **zero** local Cursor parents for PRs **#8–#15**. Home-live mtimes show almost **no** Sep 15–16 socratink parent transcripts in those windows.

**Cause (verified fingerprints):** `cursor/phase-*` / `cursor/byok-*` / `cursor/identity-judo-*` / `cursor/cheapest-openai-*` / `cursor/phase-4-openrouter-pkce-*`; author `Cursor Agent <cursoragent@cursor.com>`; PR bodies `CURSOR_AGENT_PR_BODY_*` + `bcId=bc-…`.

**Implication:** Phase/BYOK reconstructability for #8–#15 uses **PR body + commits + FM-PRREV**, not IDE jsonl. Do not force false session IDs. Packs need `pr_urls`/`bcId` ingestion or cloud-agent capture lane (**T21** / **H29**).

**Contrast:** Aug 25–29 IDE-era #1–#7 soft-join `b06e3da7` (#5–#6), `357a2e9e` (#7), `29896b44`/`c585e8d6` (#1–#3), `df80810e` (#3), `45147840` (#4) — still soft (empty `pr_urls`), temporally plausible.

---

## Session↔PR join addendum (Researchy, 2026-09-15 CT)

**Verified:** Home-live `current-home-live` has almost no socratink parent jsonl mtimes on 2026-09-15/16. Pack join matched `#5`/`#6`↔`b06e3da7` only. Phase 1–4 IDE reconstruction **Unavailable**; use cloud fingerprints. Artifact: `cloud-bc-pr-scan.json`.

---

## Correction (2026-09-15 CT)

**Verified via GitHub MCP:** `#11`–`#14` all `merged: true` (happy follow-ups after `#10`). “Closed” without merge was misleading. Do not frame `#11–#14` as failed/unmerged closes. (**H46**)

---

## Sources

| Item | Label |
| --- | --- |
| GitHub MCP PR list + pull_request_read | verified |
| `pr-inventory.json` | verified |
| `happy-nuggets.md` n=78 | verified dense pack (not overwritten) |
| `smell-catalog-dense.md` T1–T26 | verified dense pack (not overwritten) |
| `happy-smell-pairs.md` ~85 rows | verified dense pack (not overwritten) |
| strata-pack-v3 / nugget-vs-smell scores | verified |
| FM-CTXSMELL / FM-PRREV / loops / Brain EVT | verified |
| Mac product path CopyFromBox | **parent-owned** — this executor wrote box `agenteng-runs/` + mirrored `grok-ship/reports/` only |


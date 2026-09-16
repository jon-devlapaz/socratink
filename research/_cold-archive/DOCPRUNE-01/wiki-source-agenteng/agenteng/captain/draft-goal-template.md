# DRAFT — `/goal` template (paste-ready)

> **Research-only draft** for FM-AGENTENG-01 T3.4 · Captain paste into Ship briefs / outer-loop / Firstmate.  
> Grounded in: top 15 N*, gold PR chain `#8–#15`, loops §4 / §6 / §11.

---

## Master `/goal` block (default — paste and fill)

```text
/goal <one observable learner/operator outcome — one sentence>

repo: jon-devlapaz/socratink          # never guess
cwd / worktree: <exact path>

proof: <named commands, e.g. pnpm test:<slice> && pnpm check && pnpm smoke>
       # OR: Unverified: <live path not instrumented — do not pretend closed>

stop: when proof green for /goal; do not polish adjacent surfaces

Not-in-this-PR / out_of_scope:
  - <fence 1>
  - <fence 2>
  - no Brain mutation
  - no drive-by refactors

constraints: smallest owner; match AGENTS.md + ZEN.md; one phase only

on_done (Ship): push branch only — do not open PR (adversarial-review next; captain merges)
on_done (Scout): report under reports/<id>.md — no PR, no push, no code changes
```

**Firstmate boot rule (`N010`/`S010`):** refuse handoff if `/goal` + repo + cwd + proof + stop + Not-in-this-PR are missing.

**Banned openers:** “pick up where Codex/Cursor left off” alone (`S013`); “I trust you” without restated plate (`S014`); multi-issue validate-without-one-Outcome; skill dump before Outcome.

---

## Field guide (why each line exists)

| Field | N* / gold | Rule |
| --- | --- | --- |
| `/goal` one Outcome | `N011` | One observable sentence + explicit Out-of-scope; follow-up PR > widen mid-flight |
| repo + cwd | `N010` | Named; never invent paths or session IDs |
| proof | `N040`/`N020` | Named contract/commands (`test:learner-key` / `test:credentials` / `test:openrouter`) before or with impl — never unchecked UI checklist |
| stop | `N062`/`N064` | Green for `/goal` → stop; next phase = **new** `/goal` |
| Not-in-this-PR | `N011`/`S011` | Fences; cut creep or open follow-up PR |
| smallest owner | `N030` | Copy gold shape (`#6`/`#13`/`#14` small closes), not large diffs |
| Ship on_done | `N031`/`N063` | Branch only; captain opens/merges; IDE thrash ≠ merge path |
| Scout on_done | `N001` | Report-only; Brain untouched |
| Auth residual | `N044`/`N050` | CONCERN + residual ticket; FM-PRREV before closed claim |
| Fail closed | `N033` | Thin identity/proof → error; no sniff fallback |
| New plate after proof | `N032` | `#10→#11`: never widen proof PR for wire |
| Library-first | `N023` | Ship encrypted store with Chat still out of scope (`#9`) |
| Join cloud | `N070` | `bcId`/PR footer only for `#8–#15` |

---

## Per-stage variants (copy-paste)

Repo for all: `https://github.com/jon-devlapaz/socratink` — never guess.

### Research (Scout) — `N001`

```text
/goal Produce a report-only answer to: <question>. No code changes.
Repo: jon-devlapaz/socratink
Done-when: report at reports/<id>.md with sources, unknowns, and a recommended next /goal OR explicit stop.
Fences: no PR, no push, no “quick fix,” no scope into product features.
Not-in-this-PR: N/A (no PR).
Stop: when unknowns are listed and recommendation is one sentence.
```

### Plan

```text
/goal Name the next shippable phase for <theme> as one outcome sentence plus fences.
Repo: jon-devlapaz/socratink
Done-when: written plate with phase name, Outcome, Not-in-this-PR list, and named proof command — captain-ready to paste into Ship.
Fences: one phase only; no implementation in this step.
Stop: when plate is paste-ready; do not start coding.
```
*Gold exemplar:* phase titles on `#8–#15`.

### Spec — `N020`

```text
/goal Specify the contract that proves <invariant> (e.g. overlapping Chat streams cannot mix learner keys).
Repo: jon-devlapaz/socratink
Done-when: named test file/path + pass criteria a stranger can run; production gaps listed as Out of scope.
Fences: no UI paste product; no Flue rewrite unless named.
Proof: pnpm test:<slice> must be inventable from the spec alone.
Stop: when Done-when is falsifiable.
```
*Gold exemplar:* `#10` `test:learner-key`.

### Impl — `N030`/`N031`

```text
/goal <one observable outcome matching the phase plate>
Repo: jon-devlapaz/socratink
Done-when: branch pushed; diff matches Outcome only; nearest contracts green locally.
Constraints: smallest owner; match AGENTS.md; no drive-by refactors.
Out of scope: <copy Not-in-this-PR>
On done: push branch only — no PR until adversarial-review.
```
*Gold exemplar:* `#8–#9` cloud; `#11` wire-after-proof (new plate).

### Verify — `N040`

```text
/goal Prove <invariant> with named commands; do not add features.
Repo: jon-devlapaz/socratink
Done-when: `pnpm test:<slice> && pnpm check && pnpm smoke` green; any live check listed as verified or explicitly Unverified.
Fences: no new product surface; no widening Not-in-this-PR.
Stop: when commands green or failure diagnosed once with a new plate.
```

### Review — `N050`/`N044`

```text
/goal Independent review of PR #<n> against its Outcome/Proof claims.
Repo: jon-devlapaz/socratink
Done-when: severity-tagged findings (error/warning/info); explicit PASS / CONCERN / FAIL; residuals named.
Fences: review-only — no merge, no push, no “fix while reviewing.”
Stop: when verdict + counts delivered to Firstmate.
```
*Gold exemplar:* FM-PRREV on `#10` CONCERN = happy-path honesty — not closed hotel-safety.

### Ship — `N062`/`N063`

```text
/goal Open/land PR for phase <name> with Outcome / Proof / Not-in-this-PR body.
Repo: jon-devlapaz/socratink
Done-when: PR URL recorded; adversarial-review clean of errors (concerns documented); captain merge decision captured.
Fences: no silent scope; no treating CONCERN as closed security proof without Firstmate note.
Stop: after merge or explicit park — next phase gets a new /goal.
```
*Gold chain:* `#8–#14` merged; `#15` only with plate+proof (`N062`); carry `#10` residual explicitly.

---

## Gold-chain cheat (right vs wrong)

| Signal | Right | Wrong |
| --- | --- | --- |
| Plate | Outcome + Not-in-this-PR (`#8–#14`) | Multi-issue / resume without rewrite |
| Phase order | Session → store → isolation proof → wire (`#8→#11`) | Wire before prove |
| Proof | Named contracts | Unchecked UI checklist |
| Agent form | Cloud Ship + review | IDE thrash then large merge |
| Review | CONCERN recorded (`#10`) | Market CONCERN as closed |
| Follow-ups | New plate (`#11–#14`) | Widen proof PR in-place |
| Stop | New `/goal` next phase | One-more-polish after green |

---

**Sources:** `start-tomorrow-onepager` N*; `gold-pr-brain-crosslink`; `FM-AGENTENG-01-loops.md` §4/§6/§11.  
**Status:** research draft under `agenteng-runs/` only — no product PR.

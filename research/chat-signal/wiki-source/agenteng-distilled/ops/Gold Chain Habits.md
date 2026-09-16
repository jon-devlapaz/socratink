# Gold Chain Habits

Merged cloud PRs `#8–#14` on `cursor/*` — join via `bcId` only (**N070**). Zero IDE parent joins.

## Strategic vs tactical

| PR | Kind | Habit |
| ---: | --- | --- |
| **#8** | strategic | Plate + session cookie gate before secrets |
| **#9** | strategic | **Library-first** — encrypted store; Chat still out of scope (**N023**) |
| **#10** | strategic | Isolation proof (`test:learner-key`); **CONCERN** residual honest (**N044**) |
| **#11** | tactical | Wire follow-up PR — never widen proof PR (**N032**) |
| **#12** | tactical | Tiny separable policy PR |
| **#13** | tactical | Live miss → causal tiny fix |
| **#14** | strategic | **Fail-closed** — delete sniff fallback (**N033**) |
| **#15** | open | New `/goal`; see [[Phase 15 Hold]] |

## Habit stack

1. **Plate** — Outcome / Proof / Stop / Not-in-this-PR every phase
2. **Proof** — named `pnpm test:<slice> && check && smoke`
3. **Stop** — green → stop; next phase = new plate (**N062**)
4. **Follow-up PR > widen**
5. **Fail closed** when identity/proof thin
6. **Captain merges**; push branch only

See [[Start Tomorrow]] · [[IDE vs Ship]].

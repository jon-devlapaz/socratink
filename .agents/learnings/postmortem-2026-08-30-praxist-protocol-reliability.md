---
kind: postmortem
date: 2026-08-30
slug: praxist-protocol-reliability
read_when:
  - praxist
  - protocol_reliability
  - chat tutor instruction search
  - multi-agent research campaign
  - DIG / PI / gemma / FreeLLMAPI model split
status: closed
result: negative_search
shipped_to_product: false
run_id: run_2026-08-30_05-34-44-478314_praxist_task
abandoned_run_id: run_2026-08-30_05-33-31-103695_praxist_task
---

# Postmortem: all-commodity Praxist protocol-reliability campaign

Read this before launching or resuming Praxist against Chat tutor instructions,
especially `socratink_protocol_reliability` or any maximize-LCB search over
frozen synthetic fixtures.

## Stop rules for the next agent

1. **Do not ship** any variant from this campaign into `src/agents/chat.ts`.
   Highest LCB was a protocol falsifier. Promotion gate said `parent_eligible:
   false`. That is the correct product answer.
2. **Do not relaunch this campaign as-is** to “finish” or “get more
   generations.” It already ran to `max_generations` (4/4), exit 0, and found
   no clean parent. Completing the loop is not a product win.
3. **Do not use a commodity model for DIG (plan) or PI (promote).** Use it only
   for workers. If the frontier operator budget is gone, stop and say so; do
   not silently substitute gemma for the planner.
4. **Do not treat a higher `protocol_reliability_lcb` as success** when
   `critical_violation_count > 0`. The metric will be gamed. The evaluator
   already refused those parents.
5. **Stop after generation 0** if every scored variant has a critical protocol
   violation and none is parent-eligible. Do not spend further generations
   confirming that.
6. **Do not start** until all of these are true: baseline parses to the
   intended metric (not `0.0`), `claude` is on `PATH` for *experiment*
   sessions (not only DIG), and one dummy experiment session can spawn.

## What this campaign was

Task: generate Chat tutor-instruction variants and score them on frozen
synthetic fixtures against baseline **`protocol_reliability_lcb` ≈ 0.3057**
(current Chat instruction). Evidence class: synthetic/engineering only. Never
learner evidence.

Final report:

- `praxist_task/docs/praxist_reports/20260830_165711_run_2026-08-30_05-34-44-478314_praxist_task_final_run_completion_gen3.md`
- Run dir: `praxist_task/experiments/run_2026-08-30_05-34-44-478314_praxist_task`

Confirmed outcome: no shippable Chat instruction. Frontier diagnostic-only.
Gems 0. Highest LCB **0.529** is `gen0_peer2_C06_protocol_violation_falsifier`
(1 critical violation). `gen1_peer2_explicit_response_surface` reached
**0.409** (above 0.31) with 2 critical violations. Generation 2 closed on
**safety_cap with 0 findings**. Product Chat was not updated.

## What happened (facts)

1. Codex initialized the task, measured the 8-fixture baseline, and launched.
   Operator session burned frontier quota on setup (~41 min), then hit a usage
   limit. Research peers were already wired to **gemma4:31b** via an
   OpenRouter-shaped FreeLLMAPI, not to Codex.
2. First start (`run_2026-08-30_05-33-31-103695_praxist_task`) parsed baseline
   as **0.0** because `task.yaml` used `protocol_reliability_lcb:` instead of
   `metric_name` / `metric_value`. Codex SIGTERM’d it and patched.
3. Second start (`run_2026-08-30_05-34-44-478314_praxist_task`) got past DIG,
   then experiment sessions died with `Error: claude not found in PATH` (exit
   127). DIG used the bundled CLI by full path; workers needed `claude` on
   `PATH`. Package `claude-agent-sdk` was installed; the `claude` command was
   not.
4. Cursor stopped the live run (including a degenerate PI-with-empty-findings
   path), symlinked the bundled binary onto `PATH`, cropped the failed gen-0
   close, and resumed. Experiment sessions then ran. The resumed search used
   **gemma for DIG, workers, and PI**.
5. The run completed in ~11 hours at `max_generations`, exit 0. No clean
   parent. The promotion gate held.

## What went wrong, by actor

**Root cause.** Commodity model on the whole arc (plan, grind, promote) after
the frontier budget had already been spent on *launch*. A cheap planner will
raise LCB by breaking protocol. The evaluator catching that is not a search
success.

**Codex.** Real baseline work, then a wrong baseline schema, a launch without
a `which claude` check for experiment sessions, and frontier quota spent on
the operator loop instead of DIG/PI.

**Operator (user).** Choosing gemma/FreeLLMAPI after Codex died was rational.
Letting the all-gemma run continue to four generations after gen 0 already
showed looping planners and protocol-breaking “wins” optimized for *a finished
Praxist campaign*, not *a shippable instruction*. Those are different goals.

**Cursor (this recovery).** PATH repair and crop/resume were the right
plumbing. Completing four gemma generations after that was not. The recovery
agent should have stated the expected scientific yield *before* resume: you
will get diagnostic falsifiers and a safety-capped gen, not a tutor.

**Praxist / task shape.** DIG + falsify/diagnostic slots on a first campaign
whose real ask was “beat 0.31 with zero critical violations” invited the
cheating strategy. A generation that “completes” on a safety cap with 0
findings is a process hole, not a negative result worth another generation.

## What worked

- Baseline measurement of current Chat (~0.31 LCB) is reusable.
- The promotion gate (`parent_eligible: false` on critical violations) did
  its job. Empty confirmed/incubator is the system working.
- Empty useful parents is the search not working. Keep those two facts
  distinct.

## If a new campaign is authorized

Aim at **zero critical violations first**, then LCB above 0.31. Put a real
planner on DIG and PI. Commodity on workers only. One-sentence outcome that
forbids shipping a higher LCB with a protocol break.

Launch gate, in order:

1. Baseline parses to the intended metric and value (not 0.0).
2. `command -v claude` succeeds in the environment experiment sessions inherit.
3. One dummy experiment session starts without exit 127.
4. Planner model is not the worker model unless the user explicitly accepts a
   diagnostic-only run.

Stop gate: after gen 0, if nothing is parent-eligible, report a negative
search and wait. Do not “finish the generations.”

Treat any later result as engineering evidence only. Do not claim learning
effectiveness, mastery, or a better tutor from this run or a rerun of it.

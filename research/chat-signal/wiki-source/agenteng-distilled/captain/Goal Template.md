# Goal Template

Paste-ready `/goal` for Ship / IDE / Scout. Boot refuse without plate (**N010** / **S010**).

## Master block

```text
/goal <one observable learner/operator outcome — one sentence>

repo: jon-devlapaz/socratink
cwd / worktree: <exact path>

proof: <named commands, e.g. pnpm test:<slice> && pnpm check && pnpm smoke>
       # OR: Unverified: <live path not instrumented>

stop: when proof green for /goal; do not polish adjacent surfaces

Not-in-this-PR / out_of_scope:
  - <fence 1>
  - <fence 2>
  - no Brain mutation
  - no drive-by refactors

constraints: smallest owner; one phase only

on_done (Ship): push branch only — captain merges after adversarial-review
on_done (Scout): report under reports/<id>.md — no PR, no push, no code
```

## Banned openers

- Bare “continue Codex/Cursor” (**S013**)
- “I trust you” without restated plate (**S014**)
- Multi-issue validate without one Outcome

## Short variants

### Scout

```text
/goal Produce a report-only answer to: <question>. No code changes.
Done-when: reports/<id>.md with sources, unknowns, next /goal OR stop.
Fences: no PR, no push, no quick fix.
```

### Impl (Ship)

```text
/goal <one observable outcome matching the phase plate>
proof: pnpm test:<slice> && pnpm check && pnpm smoke
Not-in-this-PR: <fences>
stop: when proof green; push branch only
```

### After proof → wire (**N032**)

New `/goal` — never widen the proof PR (#10→#11).

See [[Start Tomorrow]] · [[Thrash Tripwire]].

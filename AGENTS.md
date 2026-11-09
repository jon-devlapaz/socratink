# Socratink product agent guide

Make the smallest complete change that produces the requested learner or
operator outcome. Read [ZEN.md](ZEN.md) before planning or changing files.
State the outcome, scope, proof, and stop condition before tool loops.

## Read the right context

- **Product direction or learning behavior:** read the Brain's
  [Constitution](socratink-brain/CONSTITUTION.md) and
  [North Star](socratink-brain/NORTH-STAR.md), then only the linked Canon needed
  for the task. The Brain is a separate repository. If unavailable locally,
  use [its source repository](https://github.com/jon-devlapaz/socratink-brain/tree/master).
  Report missing authority rather than inventing doctrine. The application
  code and its checks establish current implementation; the North Star does
  not establish that a capability is built or proven.
- **Current product:** [PRODUCT.md](PRODUCT.md) describes the implemented
  boundary. [README.md](README.md) covers setup and verification.
- **Writing or reviewing code:** read [CODING_STANDARDS.md](CODING_STANDARDS.md)
  and the area-specific standards it links. For UI changes, also read
  [DESIGN.md](DESIGN.md).
- **Pi Durable engine, tools, or model routing changes:** inspect the installed
  `@earendil-works/pi-durable` version and its published types; do not invent
  APIs or rely on missing helpers.
- **Repeating an operator failure:** read matching local notes under
  `.agents/learnings/` when present. Keep lessons conditional on their
  `read_when` triggers, and check historical commands against this checkout.
- **Recovering old research:** use [the recovery index](research/README.md).
  Never preload or glob-read `research/_cold-archive/**` or host archives.
  Archived research and skill packs are not current instructions.

## Work within the request

Inspect the owning module, its callers, and the nearest contract or smoke
test before editing. Prefer existing flows and vanilla TypeScript/CSS.
Keep environment access behind `src/config/` or the server boundary.

Unless the current task already authorizes the action, ask before adding or
upgrading dependencies, changing schemas or learner-data handling, changing
public APIs/authentication/authorization/rate limits, modifying deployment or
external service state, or deleting user work, tests, data, or substantial
behavior. New modes, room systems, routes, storage, evaluation machinery, and
other product capabilities require an explicit request. An unexpectedly large
diff is a reason to reconsider the approach, not expand the scope.

The product owns `src/`. Preserve the Flue attribution and Apache licensing
in the README. Treat `dist/`, dependencies,
caches, logs, artifacts, and environment files as generated or local data.

Keep learner-authored work distinct from AI output and assistance. Use
`present_question` for choices or diagnostics with defined options, and
preserve reveal provenance. A correct response, synthetic run, or passing
software test does not establish retention, transfer, mastery, or production
readiness. Keep secrets and learner data out of source and logs; use synthetic
data for external-service checks.

## Prove and finish

Prefer end-to-end checks for complex behavior and retain a repeatable proof
artifact. For isolated testing, list failure cases and write the test before
implementation. Use the narrowest relevant check while iterating; do not
remove or weaken a test merely to make it pass.

Before a refactor, capture the Trellis baseline with
`pnpm audit:trellis:baseline`. For refactors or feature additions, compare the
result with `trellis audit . --baseline .audit/baseline.json`; preserve the
regression limits in `trellis.yaml` and introduce no import cycles.

Before handing off code, run `pnpm check` and `pnpm smoke` unless the user
narrowed the proof boundary or the environment prevents them. Use browser or
live validation when the requested outcome depends on real interaction or
external delivery, within the task's authorization. Report what ran, what it
proves, and what remains unverified. Available commands live in `package.json`.

After repeated failure at the same seam, collect the failure evidence and
change the approach. Stop after five same-file edit cycles without a passing
check. Record costly repeatable failures as focused, dated local learnings
with a `read_when` trigger and a stop rule.

Inspect `git status --short` before editing and handoff; preserve unrelated
work. Stage, commit, amend, push, create branches, or open PRs only when asked.
When asked for **git golden**, run `scripts/git-golden.sh`, stop on failure,
and report every `FAIL` line. Do not delete branches, worktrees, stashes, or
dirty files unless that deletion was requested.

Keep this file the portable project entry point. Store specialized workflows
in focused, discoverable references; compatibility shims should link here
rather than duplicate doctrine. Stop when the requested outcome is proven.

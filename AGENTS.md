# Socratink product agent guide

You are a product coding agent for the standalone Socratink learning product.
Make the smallest complete change that produces the requested observable
learner or operator outcome, and prove that outcome without expanding product
scope.

Before planning or changing files, read [ZEN.md](ZEN.md). Treat its working
agreements as requirements and its software-design heuristics as defaults.
Before Praxist runs, multi-agent research campaigns, or repeating a failed
operator loop, read matching files in [.agents/learnings/](.agents/learnings/).

## Cold archive and freezes

Never preload or glob-read `research/_cold-archive/**` (gitignored; evacuated
in FM-PARETO-CUT-02). Recovery copies live on the host only — see
[`research/README.md`](research/README.md):

`/Users/jondev/dev/archives/socratink-cold-archive/2026-09-16-from-main/`

Mega skill packs under that host archive (`PARETO-01/skills/`:
`personas-skillset`, `common-skills-skillset`, `variate`) are **archive-only**.
Do not list or load them as default project skills unless Captain explicitly
restores them to `.agents/skills/`.

Praxist-as-progress and extra WebGL scope freezes live in host
`…/PARETO-01/FREEZE.md` (same archives folder). That file does not authorize
deleting `living-ink` / `src/ui/effects/living-ink*` or any Chat knee code.
WebGL helpers under `src/ui/effects/` stay FREEZE-only (do not delete).

## Commands

Run commands from the repository root.

```sh
# Install the locked dependency graph
pnpm install --frozen-lockfile

# Build the UI once, then run the local development server
pnpm dev

# Run the full local quality gate: types, contract tests, and production builds
pnpm check

# Exercise the built app against a deterministic fake model provider
pnpm smoke

# Audit production dependencies
pnpm audit --prod

# Measure structural debt and regressions with Trellis
pnpm audit:trellis
```

Prefer the narrowest relevant check while iterating:

```sh
# Types and builds
pnpm check:types
pnpm build
pnpm build:ui

# Structural debt and baseline regression
pnpm audit:trellis
trellis audit . --baseline .audit/baseline.json

# Targeted contract suites (see package.json "test:*")
pnpm test:chat-model     # or test:chat-turns, test:chat-auto, test:model-route
pnpm test:session        # or test:auth-db, test:oauth, test:credentials
pnpm test:questionnaire  # or test:present-question, test:reveal, test:thinking
```

## Testing and proof

Before handing off a code change, run `pnpm check` and `pnpm smoke` unless the
user narrowed the proof boundary or the environment prevents a check. Report
exactly what ran, what passed, and what remains unverified. GitHub CI installs
with the frozen lockfile, runs the full `pnpm check` quality gate across all
contracts, builds, and runs the deterministic `pnpm smoke` test in full parity
with the local gate.

`pnpm smoke:braintrust-live` is an explicit live integration check, not a CI
step. It requires a completed `pnpm build` and an available Braintrust API key.
Use only synthetic prompts because traces may contain inputs and outputs.

Measure and protect structural maintainability with Trellis (`pnpm audit:trellis`).
Trellis computes an offline 0–100 sloppiness index (lower is better) across
cyclomatic complexity, function erosion, duplication, and import cycles. Before
a refactor, capture a baseline (`pnpm audit:trellis:baseline` or
`trellis audit . --json --out .audit/baseline.json`). During review or before
handoff, verify with `trellis audit . --baseline .audit/baseline.json`. A change
must never introduce circular imports (`failOnNew: [import-cycle]`) or exceed
the regression tolerance in `trellis.yaml`.

## Product and stack

Socratink is a focused, model-backed learning conversation. Do not introduce
a frontend framework to solve a local UI change; keep UI in vanilla TypeScript
and CSS.

The product owns `src/` and learner-facing behavior. Flue framework behavior
comes from published `@flue/*` dependencies; its source is not vendored here.
Keep Flue attribution, Apache licensing, and `@flue/*` package names intact.
A product change must not become a framework rewrite.

Generated and local-only paths such as `dist/`, `node_modules/`, `.cache/`,
`.vercel/`, logs, artifacts, and environment files are not source.

## Working method

1. Write the smallest observable outcome in one sentence.
2. Inspect the owning module, its callers, and the nearest contract or smoke
   test before editing.
3. State the proof needed for that outcome. Strengthen proof when the user says
   “dogfood,” “vet,” “scientific,” “grounded,” or “production quality”; those
   words do not authorize broader features.
4. Change the narrowest stable owner and add or update the closest test.
5. Run targeted checks while iterating, then the full applicable handoff gate.
6. Review the diff, remove incidental artifacts, and stop when the stated
   outcome is proven.
7. After a costly negative campaign or operator path, add a dated postmortem
   under `.agents/learnings/` so the next agent can find the stop rule.

A passing typecheck, build, or smoke proves only its covered behavior. Use live
or browser validation when the request depends on real interaction, recovery,
deployment, or external delivery. Clearly separate confirmed facts, reasonable
inferences, and unknowns.

## Code conventions

Match adjacent code before inventing a new pattern. Use strict types, `.ts`
extensions in local imports, single quotes, semicolons, and the repository's
tab indentation. Prefer small pure functions for environment or policy
decisions, explicit failure for unsafe hosted states, and tests that exercise
the public contract. Keep UI behavior in the existing TypeScript/CSS modules
and keep environment access behind `src/config/` or the server boundary.

Hosted or production environments (`NODE_ENV=production`, `VERCEL=1`) require
explicit configuration (`DATABASE_URL`, `SESSION_SECRET`, `CREDENTIALS_SECRET`,
and `AI_GATEWAY_API_KEY`); fail fast if missing. Local development falls back
to SQLite automatically.

Use comments for rationale, constraints, or non-obvious tradeoffs—not to
restate code. Do not add abstraction, generality, or a dependency until a
demonstrated need makes the resulting module simpler to use or safer to change.
Keep function complexity bounded. Do not pile branching or nested logic onto
hotspot functions identified by `pnpm audit:trellis` (e.g. in
`src/ui/chat-markdown-parse.ts`, `src/ui/chat-surface.ts`, or
`src/ui/effects/living-ink/renderer.ts`); extract focused pure helpers instead
of expanding existing hotspots.

## Flue harness rules

An agent is a capitalized exported function in a module beginning with
`'use agent'`. Flue hooks attach its model, tools, skills, state, and other
capabilities. The function's return value is its instruction.

Routing is explicit in `src/app.ts`: mount an HTTP-reachable agent with
`createAgentRouter`. Registration comes from the `'use agent'` scan, not from
mounting. The model layer uses Pi's provider protocol through the published
Flue runtime.

When posing diagnostics or multiple choices to the learner, the agent MUST
call `present_question`. Never output raw text or markdown bullet choice lists;
only `present_question` produces structured evidence.

Before changing Flue agents, hooks, skills, tools, routing, or harness behavior,
use `.agents/skills/flue-wiki` and read the relevant generated notes from the
sibling `flue-obsidian-wiki` vault. Do not invent Flue APIs from memory.

## Product scope and doctrine

Do not add a user-facing mode, route family, persistence model, schema,
reviewer workflow, evaluation system, or experiment framework unless the user
explicitly requests that product capability. Attach requested behavior to the
existing flow whenever it can own the outcome.

Treat any such addition—and any unexpectedly large diff—as a scope tripwire.
Stop before implementation, compare it with the one-sentence outcome, and ask
for direction if it is not strictly required. Lockfiles and generated output do
not justify expanded behavior.

Failure precedent: a request to trace normal Socratink runs was once expanded
into a separate learner-evidence product with new UI, routes, storage, schemas,
and review machinery. That expansion was reverted. The complete solution was
startup instrumentation plus one verified live trace.

The sibling private `socratink-brain` repository governs what this product may
become or claim. Before consequential product, learning, learner-agent, or
experiment work, use `.agents/skills/socratink-brain` and run:

```sh
python .agents/skills/socratink-brain/scripts/brain.py orient
```

Read the files it lists. Do not reconstruct doctrine from memory, from
`README.md`, or from software-maintenance documents. Never present synthetic
model or evaluator output as learner-authored evidence, durable learning, or
mastery.

## Git workflow

- Inspect `git status --short` before editing and before handoff.
- Preserve user-owned and unrelated work in a dirty worktree.
- Keep each change scoped to the observable outcome; do not bundle cleanup.
- Stage, commit, amend, push, create branches, or open pull requests only when
  the user explicitly asks.
- When asked to commit, stage exact paths and report the resulting commit and
  verification. Never bypass checks or rewrite shared history to make a change
  appear clean.
- Do not remove or weaken a failing test merely to obtain a green result.
- **Git golden** is an on-demand stop condition, not a session gate and not CI.
  When the user says "git golden" or "return to golden", run
  `scripts/git-golden.sh` from the repository root and stop on a non-zero
  exit. Report every `FAIL` line. Do not delete branches, worktrees, stashes,
  or dirty files unless the user explicitly asks to restore or delete. The
  script is the definition: on `main`, clean index, `HEAD == origin/main`,
  exactly one worktree, and only local branch `main`.

## Boundaries

### Always

- Read `ZEN.md`, state the outcome, inspect the real owner, and preserve product
  attribution and learner-authored evidence.
- Read matching files in `.agents/learnings/` before Praxist, multi-agent
  research, or repeating a failed operator loop.
- Keep secrets out of source and logs; use synthetic data for observability and
  external-service checks.
- Add proof at the same boundary as the behavior and report any unverified
  assumptions.
- Verify structural health does not regress during refactors or feature additions (`pnpm audit:trellis`).
- Follow repository-owned skills only when their documented trigger applies.

### Ask first

Unless the user already requested the exact action, ask before:

- adding or upgrading dependencies or changing the lockfile intentionally;
- changing a database schema, persistence model, public API, authentication,
  authorization, rate limits, or learner-data handling;
- modifying CI, deployment configuration, hosting topology, production
  settings, or external service state;
- adding one of the product scope tripwires listed above;
- deleting user-owned files, tests, data, or substantial existing behavior.

### Never

- Commit secrets, API keys, `.env*` contents, learner data, or trace payloads.
- Edit generated dependencies or output such as `node_modules/`, `dist/`, or
  caches as if they were source.
- Vendor, rename, or silently replace published Flue framework behavior.
- Claim learning effectiveness, mastery, or production readiness from code,
  synthetic runs, configuration, or passing tests alone.
- Introduce circular dependency import cycles across TypeScript modules.
- Duplicate project doctrine in `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`,
  `.github/copilot-instructions.md`, `.cursor/skills/`, or `.claude/skills/`.

## Research preload

Load `research/pareto/` and thin `research/chat-signal/` contracts only when the
task needs them. Cold-archive recovery: see **Cold archive and freezes** above
and [`research/README.md`](research/README.md).

## Coding-agent portability

This root `AGENTS.md` is the project-wide contract for coding agents. It is not
owned by a particular editor, CLI, or model. Keep specialized, reusable
workflows in `.agents/skills/` as portable `SKILL.md` packages with scripts.

A thin compatibility shim may point to this file when a tool cannot discover
`AGENTS.md`; it must not duplicate doctrine or workflow. This portability rule
applies to coding-agent configuration and does not change the product's Flue
agent runtime.

Keep this guide concise and empirical. Add a rule when a repeated agent mistake
reveals a missing constraint; remove or update rules when the repository no
longer supports them. Prefer one real command or example over several
paragraphs of abstract advice.

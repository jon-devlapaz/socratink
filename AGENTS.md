# Socratink product agent guide

You are a product coding agent for the standalone Socratink learning product.
Make the smallest complete change that produces the requested observable
learner or operator outcome, and prove that outcome without expanding product
scope.

Before planning or changing files, read [ZEN.md](ZEN.md). Treat its working
agreements as requirements and its software-design heuristics as defaults.
Before Praxist runs, multi-agent research campaigns, or repeating a failed
operator loop, read matching files in [.agents/learnings/](.agents/learnings/).

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
```

Prefer the narrowest relevant check while iterating:

```sh
pnpm check:types
pnpm test:braintrust
pnpm test:chat-model
pnpm test:model-route
pnpm test:chat-auto
pnpm test:database-config
pnpm test:questionnaire
pnpm test:conversation
pnpm test:chat-turns
pnpm build
pnpm build:ui
```

## Testing and proof

Before handing off a code change, run `pnpm check` and `pnpm smoke` unless the
user narrowed the proof boundary or the environment prevents a check. Report
exactly what ran, what passed, and what remains unverified. GitHub CI installs
with the frozen lockfile, checks types, runs the Braintrust and Chat-model
contracts, builds, and runs the deterministic smoke test; the full local gate
also covers the database, questionnaire, conversation, and Chat-turn contracts.

`pnpm smoke:braintrust-live` is an explicit live integration check, not a CI
step. It requires a completed `pnpm build` and an available Braintrust API key.
Use only synthetic prompts because traces may contain inputs and outputs.

## Product and stack

Socratink is a focused, model-backed learning conversation. It is a Node.js
22.19+ ESM application managed with pnpm 11. The declared stack includes
strict TypeScript 7, Vite 8, Hono 4, exact published Flue 2.0.3 packages,
Valibot 1, Braintrust 3, PostgreSQL, and a vanilla TypeScript/CSS learner UI.
Do not introduce a frontend framework to solve a local UI change.

The product owns `src/` and the learner-facing behavior. Flue framework
behavior comes from published `@flue/*` dependencies; its source is not
vendored here. Keep Flue attribution, Apache licensing, and `@flue/*` package
names intact. A product change must not become a framework rewrite.

## Project map

- `src/agents/` — Socratink agent instructions, hooks, and tools
- `src/server/` — model-provider and runtime setup
- `src/ui/` — learner-facing TypeScript, HTML, CSS, and visual effects
- `src/ui/client/` — browser-side conversation transport and recovery
- `src/config/` — environment parsing and application constants
- `src/app.ts` — Hono routes, agent mounting, health checks, and static UI
- `src/db.ts` — application database connection setup
- `src/questionnaire.ts` — shared questionnaire data contract
- `src/braintrust.ts` — optional observability for Chat and Flue runs
- `api/` — Vercel server entry point
- `scripts/` — deterministic contract tests and smoke checks
- `vite.config.ts` — Node application build
- `vite.config.ui.ts` — browser application build
- `Dockerfile` and `vercel.json` — deployment configuration
- `README.md` — supported setup, hosting, and observability behavior
- `ZEN.md` — required maintainability agreements and design heuristics
- `.agents/learnings/` — dated postmortems; read matching files before repeating a campaign or operator failure

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

This existing resolver is representative of the preferred style:

```ts
export type DatabaseTarget =
	| { kind: 'postgres'; connectionString: string }
	| { kind: 'sqlite'; filename: string };

type DatabaseEnvironment = Readonly<{
	DATABASE_URL?: string;
	NF_PROJECT_ID?: string;
	NODE_ENV?: string;
	VERCEL?: string;
}>;

export function resolveDatabaseTarget(environment: DatabaseEnvironment): DatabaseTarget {
	const connectionString = environment.DATABASE_URL?.trim();
	if (connectionString) return { kind: 'postgres', connectionString };

	if (
		environment.NODE_ENV === 'production' ||
		environment.NF_PROJECT_ID ||
		environment.VERCEL === '1'
	) {
		throw new Error('DATABASE_URL is required for durable hosted conversations.');
	}

	return { kind: 'sqlite', filename: '.cache/flue/local.db' };
}
```

Use comments for rationale, constraints, or non-obvious tradeoffs—not to
restate code. Do not add abstraction, generality, or a dependency until a
demonstrated need makes the resulting module simpler to use or safer to change.

## Flue harness rules

An agent is a capitalized exported function in a module beginning with
`'use agent'`. Flue hooks attach its model, tools, skills, state, and other
capabilities. The function's return value is its instruction.

Routing is explicit in `src/app.ts`: mount an HTTP-reachable agent with
`createAgentRouter`. Registration comes from the `'use agent'` scan, not from
mounting. The model layer uses Pi's provider protocol through the published
Flue runtime.

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
- Duplicate project doctrine in `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`,
  `.github/copilot-instructions.md`, `.cursor/skills/`, or `.claude/skills/`.

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

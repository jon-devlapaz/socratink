# Socratink whole-app `/architect` plan (sketch-only)

- **As-of:** 2026-09-15 23:30 CT  
- **Repo:** `jon-devlapaz/socratink`  
- **Mode:** sketch / outer-loop · **no implement PRs until checkpoint**  
- **Author:** loops  
- **Grounding:** `AGENTS.md`, `ZEN.md`, `CONTEXT.md`, `src/app.ts`, `src/{server,config,ui,agents}` listings (GitHub read-only)

## Outcome

Make the next architecture change cheaper and safer: clearer owners, deeper modules, fail-closed auth/model routing, and UI surfaces that can change without thrashing `chat-surface.ts` / CSS — without a Flue rewrite or frontend framework.

## Hard fences (from product doctrine)

- Product owns `src/`; Flue stays published `@flue/*` (no vendoring/rewrite).  
- No React/Vue/Svelte for local UI fixes.  
- One-sentence outcomes; strengthen proof ≠ expand scope.  
- Auth/BYOK: keys from secret store per request; no learner keys on `process.env`; no `Models.login` / captured `setProvider`.  
- Chat model route (CONTEXT): OpenRouter row → else OpenAI paste → else operator `jon-local`.  
- Ask before schema/auth/hosting/scope tripwires.

## Current shape (grounded)

```
Browser (dist/client)
  login.html / index.html → session, openai-key, openrouter UI
  chat-surface + turns/markdown/dock/effects
        │
Hono src/app.ts
  /healthz, /api/session*, openai-key, openrouter, chat-route
  /api/agents/chat/* ← requireChatSession + learnerChatRouteForUser
  createAgentRouter(Chat)  ← Flue agent
  static dist/client
        │
src/server/*  session, credentials, learner-key, provider, rate-limit
src/config/*  chat-model, session, database, openrouter policy
src/agents/chat  instructions/hooks
src/db.ts, braintrust.ts, questionnaire.ts
```

**Pressure points (inference from map + prior dogfood/agenteng):**

1. **Auth gate** — `/` → login; unsigned Chat not reachable (FM-DOGFOOD-01 J1). Architecture must treat “who may Chat” as an explicit product contract.  
2. **Model/auth stack** — session + credential store + ALS learner-key + provider + OpenAI/OpenRouter mounts grew as phased PRs `#8–#15`; risk of shallow pass-through modules.  
3. **UI concentration** — `chat-surface.ts` (~15k) + large CSS; prior thrash sessions centered here.  
4. **Dual Vite builds** — Node app + UI; keep boundary clear.  
5. **Observability** — Braintrust optional; must not become “learning proof.”

## Design-twice candidates (whole-app, not point fixes)

### Shape A — “Clarify owners” (deepen existing layers)

Keep folder names; make contracts explicit:

| Layer | Owns | Must not own |
| --- | --- | --- |
| `config/` | Pure env/policy decisions | I/O, Hono, Flue |
| `server/session` | Cookie identity | Model choice |
| `server/credentials` | Encrypt/store/resolve refs | HTTP shape |
| `server/learner-key` | Per-request route + ALS | UI |
| `server/*-routes` | HTTP adapters only | Crypto policy |
| `agents/chat` | Flue instruction/tools | Hosting auth |
| `ui/*` | Presentation + client transport | Secret material |

**Pros:** Fits ZEN “smallest complete change”; aligns with phase PR culture.  
**Cons:** Won’t fix UI monolith by itself.

### Shape B — “Extraction seams” (same runtime, clearer packages)

Introduce internal seams (still one app, no new product):

- `auth/` — session + chat-access + login redirects  
- `byok/` — credentials + openai-key + openrouter + learner-key  
- `chat-runtime/` — provider + model-route + chat-auto  
- `ui/chat/` — surface/turns/markdown/client only  
- `ui/chrome/` — dock/menu/theme/effects  

**Pros:** Deeper modules; blast-radius for auth vs UI.  
**Cons:** Move cost; needs contract tests at each seam.

### Shape C — “Subtract first” (delete/merge before add)

Inventory dead paths, duplicate model-route copies (`config` vs `server`), unused UI, login vs Chat duplication; merge shallow pass-throughs; only then extract.

**Pros:** ZEN prefer deletion; may shrink thrash surface.  
**Cons:** Needs blast-radius `/how` before deletes.

**Recommendation for synthesis:** start **C then A**, open **B** only where a seam already paid for itself (BYOK/`learner-key` is the strongest B candidate).

## Phased `/architect` sequence (checkpoint between phases)

| Phase | Focus | Sketch deliverable | Proof when implementing later |
| --- | --- | --- | --- |
| **0** | Intent: unsigned vs login-gated Chat | One-page product contract | Dogfood J1 expected rewritten |
| **1** | Auth + session + chat-access | Module sketch + sequence diagram | `pnpm test:*` session/access + smoke |
| **2** | BYOK / learner-key / provider | Deep module APIs; fail-closed matrix | `test:learner-key`, `test:openai-key`, `test:openrouter`, `check` |
| **3** | Chat agent + routing only | What stays in Flue vs Hono | chat-model contracts + smoke |
| **4** | UI split plan | File ownership map for `chat-surface` / CSS | Targeted UI tests + browser dogfood |
| **5** | Config purity + db | Move impure calls out of config | `test:database-config` |

Each phase: **Ground (`/how`) → Sketch twice → Agree (this checkpoint) → only then Implement `/goal`.**

## First implement `/goal` drafts (NOT launched)

Held until you approve a phase:

```text
/goal Document and enforce the Chat access contract (unsigned vs signed) in one owner module without changing Flue.
Repo: jon-devlapaz/socratink
Done-when: contract test + AGENTS/CONTEXT one-paragraph sync; pnpm check; dogfood J1 expectation matches product.
Out of scope: new OAuth providers; UI redesign; Flue wrap.
```

```text
/goal Make learner model routing a deep module: OpenRouter|OpenAI|operator with fail-closed identity, HTTP adapters thin.
Repo: jon-devlapaz/socratink
Done-when: existing learner-key/openai/openrouter tests green; no secret in browser storage; pnpm check + smoke.
Out of scope: new providers; Flue rewrite.
```

## Checkpoint (stop here)

Approve before any cloud-agent implement:

1. **Product:** Is login-gated Chat intentional? (reclasses dogfood F1)  
2. **Shape:** C→A default, B only for BYOK — agree / change?  
3. **First phase to sketch deeply:** 0, 1, 2, 3, or 4?  
4. **pstack:** Run full `/architect` arena multi-model on that phase, or loops-only sketch then Ship?

## Artifacts

- This plan: `product/socratink/research/architect/socratink-architect-plan.md` (Jondev)  
- Factory: `/home/box/agent-data/grok-ship/reports/socratink-architect-plan.md`

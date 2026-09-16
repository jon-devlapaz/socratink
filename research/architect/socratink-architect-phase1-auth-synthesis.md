# Phase 1 auth — Arena synthesis

- **As-of:** 2026-09-15 23:35 CT  
- **Job:** pstack `/architect` arena · Phase 1 auth/session/chat-access  
- **Repo:** `jon-devlapaz/socratink`  
- **Mode:** sketch only · **checkpoint before implement**  
- **Candidates:** 1 deepen-in-place · 2 extract `src/auth/` · 3 subtract-first  

## Rubric (used for pick)

1. Interface depth (capability vs surface size)  
2. Product access contract explicit (gated vs unsigned)  
3. Honest login (no fake IdP in types)  
4. Fail-closed conversation ownership preserved  
5. Blast radius / migratability (smallest complete Phase 1 change)  
6. Red-flag screen (shallow modules, leakage, temporal split, pass-through)

## Cross-read scores (parent judge)

| Criterion | C1 Clarify | C2 Extract auth/ | C3 Subtract |
| --- | --- | --- | --- |
| Depth | Strong (`decideChatAccess`, cookie jar) | Strongest facade | Strong (`SessionAccess`) |
| Explicit policy | `ChatAccessMode` | `ChatAccessMode` | **Best** `ProductAccessPolicy` (+ browserEntry) |
| Honest login | `loginMethods` catalog | thin client | **Best** `enterAnonymously` only |
| Fail-closed ownership | Yes | Yes | Yes |
| Blast radius | **Best** (paths stay) | Higher (new package) | Medium-high (deletes) |
| Red flags | Mild pass-through risk if jar thin | Migration cost | Delete `config/session` risks purity loss |

**Convergence signal:** All three introduce branded `SessionUserId`, explicit Chat access mode/policy, single admit/decide function, and honest-anon login. That consensus is load-bearing.

## Pick: base = Candidate 1

Future maintainers can extend Phase 1 without a folder reshuffle, matching whole-app plan **C→A** (subtract theater / deepen owners before extract). C2’s `src/auth/` remains the Phase-later **B** option once BYOK wants the same seam.

## Grafts

| From | Graft into base | Why |
| --- | --- | --- |
| C3 | `ProductAccessPolicy` with `chat` + `browserEntry` | Richer than mode-only; matches dogfood login-gate question |
| C3 | UI `enterAnonymously()` as sole current entry | Deletes IdP theater at the API |
| C2 | `CookiePort` (Hono-agnostic) behind `server/session` | Depth without forcing `src/auth/` yet |
| C2 | `decideChatAccess` / `AccessDecision` naming clarity | Already close to C1; keep domain result ≠ Response |
| C1 | Keep module paths; `chatAccessMiddleware` thin over decide | Lowest risk Ship |

## Rejected

| Idea | Why |
| --- | --- |
| Full `src/auth/` extract as Phase 1 first PR | Extra move cost; defer until BYOK shared seam (plan B) |
| Delete `config/session.ts` immediately (C3) | Pure policy belongs in config per AGENTS map; merge *logic* not erase layer |
| Claiming OAuth types as live | All candidates agree — keep metadata only |
| Absorbing BYOK into SessionAccess | Phase 2 fence |

## Synthesis decision (rationale)

**Base Candidate 1**, with C3 product policy + honest anon entry, and C2 cookie port behind session I/O. Public mental model: *config owns policy brands; server owns cookie lifecycle + admit; UI owns honest entry.*

## Screened red flags (post-graft)

- Avoid shallow `SignedCookieJar` that only forwards Hono 1:1 — port must add secure/path/secret policy.  
- Do not temporal-split admit into load→validate→save at call sites.  
- Wire `{ userId }` JSON stays at HTTP edge only.

## Open questions (need Captain)

1. Default `ProductAccessPolicy`: keep `chat: 'gated'` + `browserEntry: 'login-first'` (today), or allow unsigned Chat for smoke?  
2. Email “magic link” UX: keep simulate-sent theater, or remove until real IdP?  
3. Env override `CHAT_ACCESS_MODE` / policy file — yes or code constant only?

## Next implementation step (after approve)

One Ship `/goal`: introduce branded ids + `ProductAccessPolicy` + `decideChatAccess` behind existing paths; thin `chat-access` middleware; login → `enterAnonymously` only; `pnpm check` + session/chat-access contracts; no Flue/BYOK/UI redesign.

## Artifacts

- Grounding: `arena-phase1-auth/grounding/HOW-phase1-auth.md`  
- Candidates: `arena-phase1-auth/candidate-{1,2,3}/`  
- This note: `arena-phase1-auth/synthesis/SYNTHESIS.md`  
- Grafted sketch: `arena-phase1-auth/synthesis/sketch.ts`

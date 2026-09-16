# FM-PRREV-01

- **As-of:** 2026-09-15
- **Job id:** FM-PRREV-01
- **Repo:** https://github.com/jon-devlapaz/socratink
- **Scope:** PR #10 (open draft), #9 (merged), #8 (merged)
- **Mode:** review-only (no merge / push / new PRs; tests not re-run)

## Executive summary

**PR #10 verdict: CONCERN** — Overlapping-stream key isolation under ALS is well designed and the contract test forces concurrent resolve + wire capture for Alice/Bob plus cookie-less Alice recovery without mixing keys. However, the proof calls `runWithLearnerKey` directly and does **not** exercise `installLearnerKeyCapture` / Flue `agent` instrumentation, and production `provider.ts` still resolves without a Phase 2 store (always operator `jon-local`). The hotel-safety *mechanism* looks sound; the claim that live overlapping **Chat** streams cannot mix learner keys is not fully closed.

No **error**-severity blockers across #8–#10. Phase chain is coherent: session cookie → encrypted store (library) → ALS learner-key resolve path (proven, not production-wired).

**Finding counts (all PRs):** error **0** · warning **5** · info **8**

## PR #10 — Phase 3: prove overlapping Chat streams cannot mix learner keys

- **Status:** open draft · mergeable_state `clean` · head `d3612f176e8743d7709245b4f405c4f68371c082` · branch `cursor/phase-3-hotel-safety-a4b2`
- **URL:** https://github.com/jon-devlapaz/socratink/pull/10
- **CI:** `verify` success; Vercel preview comments success
- **Intent:** Thread `userId` from namespaced `conversationId` (`userId:nonce`) via ALS into `auth.apiKey.resolve`; when a store is injected, `getUserKey` per learner; never write learner keys to `process.env` / `setProvider` / `Models.login`. Contract: overlapping fake streams must not put Alice’s key on Bob’s wire.

### Findings

1. **[warning]** `scripts/learner-key.test.mjs` (~L171–186) proves isolation by wrapping `models.streamSimple` in `runWithLearnerKey` directly. It never installs or drives `installLearnerKeyCapture()` (`src/server/learner-key.ts` ~L44–56). Real Chat depends on Flue `instrument` seeing `operation.type === 'agent'` and `ctx.conversationId`. Hotel-safety for production agent ops is therefore **inferred** from the chat-auto/model-route pattern, not demonstrated end-to-end.
2. **[warning]** `src/server/provider.ts` (~L17–21) calls `resolveLearnerChatApiKey({ operatorApiKey })` with **no** `store`. Production Chat still always uses operator key; the learner-key branch is latent until a follow-up wires Phase 2. Documented in PR body, but means the shipped Chat path does not yet *use* the proven hotel-safety resolve branch.
3. **[info]** Negative paths are thin: no contract for missing/invalid `conversationId` → operator fallback; no contract that missing stored key throws (no silent `jon-local` fallback) when a store is present.
4. **[info]** Draft; no human PR reviews. `test:learner-key` is hooked into `pnpm check` (`package.json`).

### Tests / proof notes

- Strong overlap gate on both `getUserKey` and wire `apiKey` for 3 concurrent streams (Alice live, Bob live, Alice recover).
- Asserts no Alice↔Bob mix, no operator key on wire when store hits, empty Pi `InMemoryCredentialStore`, env never holds fixture secrets.
- Session helper `userIdFromConversationId` covered in `scripts/session.test.mjs`.
- Author claims nearest contracts + `pnpm check` + `pnpm smoke` passed; head `verify` check is green.

### Overall judgment

**CONCERN** (not FAIL): do not treat hotel-safety as fully proven for live Flue Chat until either (a) a test drives the instrument interceptor with overlapping agent ops, or (b) an explicit follow-up wires the store and re-proves under that path. Mechanism review is favorable; merge of the draft is reasonable after acknowledging the gaps, not as a closed security proof.

## PR #9 — Phase 2: encrypted credential store, not BYOK

- **Status:** merged 2026-09-15 · head `71cc207dcb9dbc40bd4c5e3e535da4dfd89849c1`
- **URL:** https://github.com/jon-devlapaz/socratink/pull/9
- **CI (head):** `verify` success
- **Intent:** Server-side AES-256-GCM store keyed by session `userId` + name; profiles hold `credentialRef` only; Chat remains operator `jon-local`; not BYOK UI / OAuth / Flue schema.

### Findings

1. **[warning]** `CREDENTIALS_SECRET` fail-closed lives in `resolveCredentialsSecret` (`src/config/credentials.ts`), and `app.ts` does **not** construct or env-check the store (intentional library-first). Unlike `SESSION_SECRET` (resolved at app load in Phase 1), hosted can boot without `CREDENTIALS_SECRET` until something opens the store. Fine for current Chat, but weaker “hosted start” posture than the README’s SESSION/DATABASE parallel implies.
2. **[info]** Ciphertext is not AAD-bound to `userId`/`name` (`src/server/credential-crypto.ts`). Ownership is enforced at lookup (`getByName` query; `getByRef` foreign check). Defense-in-depth gap only.
3. **[info]** Scope correctly leaves Chat/`auth.resolve` unwired — avoids fail-closing smoke sessions with no stored key (matches Phase 3’s deferred wiring).
4. **[info]** Tests are strong: hosted secret fail-closed, encrypt round-trip, owner get, foreign deny, missing/delete, rotation + old ref revoke, plaintext absent from logs/on-disk, Postgres `$1` adapter against a fake client.

### Tests / proof notes

- `pnpm test:credentials` added to `check`. Author: `pnpm check` + `pnpm smoke` passed. Merged with green verify.

### Overall judgment

**PASS (merged, solid library).** Follow up the startup fail-closed asymmetry when wiring into production resolve.

## PR #8 — Phase 1: signed HttpOnly session cookie, not BYOK

- **Status:** merged 2026-09-15 · head `d71ce9cb968ae129d04f36ae927a96d0302f522f`
- **URL:** https://github.com/jon-devlapaz/socratink/pull/8
- **CI (head):** `verify` success
- **Intent:** Replace dummy `localStorage` auth with signed HttpOnly cookie; gate `/api/agents/chat/*` before Flue (401/403); `userId:nonce` conversation ids; per-user rate limit; smoke fixture cookie.

### Findings

1. **[warning]** `src/server/rate-limit.ts` — in-memory `Map` limiter is **per process**, so multi-replica / serverless deployments do not share budget. Idle keys are never evicted (growth over long uptime). Comments correctly call it a per-process cap, not a published quota; still a follow-up for hosted scale.
2. **[warning]** Logout is `GET /api/session/logout` (`src/app.ts`). Cross-site GET can clear the cookie (low impact while sessions are anonymous UUIDs; tighten when identity lands).
3. **[info]** Cookie flags look right: HttpOnly, `SameSite=Lax`, `Secure` when hosted (`src/server/session.ts` + `sessionUsesSecureCookie`).
4. **[info]** Gate order is correct: `requireChatSession` before `createAgentRouter`; foreign / missing / bare ids → 403; no cookie → 401. Ownership uses prefix-safe `conversationBelongsToUser` (rejects `user-a` matching `user-ab:…`).
5. **[info]** Anonymous `POST /api/session` mint is expected Phase 1 (no identity vendor). Public domain should stay off until later slices (README already says so).

### Tests / proof notes

- `scripts/session.test.mjs`: secret fail-closed, ownership, 401/403/429 with fake clock, HttpOnly cookie name. Smoke mints fixture cookie. Author: `pnpm check` + `pnpm smoke` passed.

### Overall judgment

**PASS (merged).** Session invariants underpin Phase 3 ALS recovery; rate-limit and GET-logout are follow-ups, not phase regressions.

## Cross-cutting / phase chain

| Phase | Delivers | Still deferred |
| --- | --- | --- |
| 1 (#8) | Signed cookie, chat gate, namespaced conversation ids | Identity vendor, shared rate limit |
| 2 (#9) | Encrypted store library + adapters | Wire into Chat resolve; startup secret check in `app.ts` |
| 3 (#10) | ALS + resolve path + concurrent mix proof (test-injected store) | Flue-instrument E2E proof; production store wiring |

Invariant chain holds: HTTP ownership (Phase 1) → ciphertext ownership (Phase 2) → per-request userId ALS for resolve (Phase 3). No evidence of BYOK paste UI or `process.env` learner-key writes landing early.

## Blockers for Firstmate

- **No error-severity merge blockers** in #8–#10.
- **PR #10:** treat as **CONCERN** until instrument-path coverage (or explicit accepted residual risk) is recorded; do not claim hotel-safety closed for live Chat solely from the current unit contract.
- **Before public BYOK:** wire store into resolve with fail-closed missing-key behavior; add shared rate limiting; identity vendor (already called out in README).

## Sources

| Item | Value |
| --- | --- |
| PR #10 | https://github.com/jon-devlapaz/socratink/pull/10 · SHA `d3612f176e8743d7709245b4f405c4f68371c082` |
| PR #9 | https://github.com/jon-devlapaz/socratink/pull/9 · SHA `71cc207dcb9dbc40bd4c5e3e535da4dfd89849c1` |
| PR #8 | https://github.com/jon-devlapaz/socratink/pull/8 · SHA `d71ce9cb968ae129d04f36ae927a96d0302f522f` |
| Files reviewed (#10) | `src/server/learner-key.ts`, `src/server/provider.ts`, `src/config/session.ts`, `scripts/learner-key.test.mjs`, `scripts/session.test.mjs` (delta), `package.json`; compared `chat-auto.ts` / `model-route.ts` instrument pattern |
| Files reviewed (#9) | `src/server/credentials.ts`, `credential-crypto.ts`, `credential-db.ts` (via PR files), `src/config/credentials.ts`, `scripts/credentials.test.mjs`, README |
| Files reviewed (#8) | `src/app.ts`, `src/server/session.ts`, `chat-access.ts`, `rate-limit.ts`, `src/config/session.ts`, `scripts/session.test.mjs`, `src/ui/session.ts` |
| Methods | GitHub MCP `user-Github` / `pull_request_read` (get, get_files, get_commits, get_check_runs, get_reviews, get_comments), `get_file_contents` |

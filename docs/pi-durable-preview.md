# Pi Durable migration and preview verification

Conversations use Pi Durable. Conversations created before the switch to Pi
are no longer served; a one-time migration, since removed, dropped their tables. The integration was verified in
an isolated preview before release. Merging to `main` automatically
deploys the normal build to production; deploying a preview alone does not.

## What stays the same

The interface, learner controls, question validation and retry
rules, assistance provenance, model picker, native provider APIs, and failure
monitoring remain. The teaching policy lives in `src/learning/` and model routing
in `src/inference/`.

Authentication still uses the existing signed session cookie and Postgres auth
tables. Guest-to-account aliases and encrypted keys use the existing stores.
Inference resolves a conversation's guest ID to its current account before
looking up a key. Provider keys are resolved afresh, never copied into
Pi execution records. Keeping the database, `SESSION_SECRET`, and
`CREDENTIALS_SECRET` preserves users, cookies, encrypted keys, and history.

Every authenticated, ownership-checked request goes to Pi. The server is a
plain Hono app built by Vite, and the browser speaks the local wire format in
`src/config/chat-wire.ts`.

## Storage and hosting

Pi 1.5 owns execution, tools, live progress, retry, and replay. The application
adapts its native storage contract to a committed log in `socratink_pi` in
Postgres, or separate `pi_*` tables in local SQLite. Native conformance tests
cover both stores. Reads reconstruct one consistent committed snapshot without
taking execution ownership. The browser POSTs a turn, then follows it over one
Server-Sent Events GET (`/api/agents/chat/:id/events`). Each connection opens
with a snapshot and streams reply text, tool results, and settlement diffed in
memory from engine snapshots; nothing extra is stored, and a reconnect simply
starts from a fresh snapshot. Raw model reasoning never leaves the server.

Only an active turn holds a dedicated owner connection. A Postgres advisory lock
prevents a second process from executing the same conversation. Neon pooled URLs
use the matching direct endpoint for that lock, preserving the exact database
and credentials; ordinary reads still use the supplied pooled URL. Other
Postgres services must supply a direct or session-pooled URL. Transaction-pooled
connections cannot safely hold a session advisory lock.

Vercel retains the active execution promise with `waitUntil`. A turn releases
ownership on settlement, cancellation, or a 240-second execution slice. The
function limit is 300 seconds. An interrupted slice remains pending; a later
authenticated read resumes it. Cancellation is persisted so another process
can request it. There is no unattended scheduler in this change.


## Repeatable verification

```sh
pnpm check
REVEAL_BROWSER=1 pnpm smoke
pnpm smoke:request-path
pnpm smoke:durable
pnpm test:durable:postgres
pnpm smoke:durable:postgres
trellis audit . --baseline .audit/baseline.json
```

The Postgres checks create and remove their own Docker database. Model and OAuth
responses are synthetic. They cover two simultaneous processes, cross-process
cancellation, process death, stale history reads, signed users, guest aliases,
key rekey/rotation/revocation, and browser restoration.

For hosted verification, use an empty task-owned database on a preview endpoint
separate from production, new session/encryption secrets, synthetic history,
and a bounded model key. Keep deployment protection enabled. Capture the current
production deployment before and after; never promote or assign production
domains during this check. Do not put private environment files in proof output.

## Operational limits

- Local SQLite lives at `.cache/socratink/local.db`.
- An events stream ends at 250 seconds; the client reconnects and resumes from
  a fresh snapshot.
- The Postgres adapter replays the full commit log. Pi context compaction is
  disabled here; long conversations and storage growth need bounded testing and
  a deliberate retention/compaction design before a broad rollout.
- A crash can repeat an external provider request that had not committed its
  result. Recovery preserves one learner admission; it does not promise one
  provider charge.
- Recovery resumes on a request. Background work without a returning client
  would need a separate deployment/worker decision.
- Synthetic contract tests establish software behavior, not learning outcomes,
  provider quality, production capacity, or universal fault tolerance.
- `pnpm audit --prod` reported no known advisories on 2026-11-10. That is a
  point-in-time reading; re-run it before relying on it.

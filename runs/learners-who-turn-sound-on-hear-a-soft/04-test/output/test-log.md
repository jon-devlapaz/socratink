
$ ["pnpm", "check"]
$ pnpm check:file-size && pnpm check:types && pnpm test:chat-model && pnpm test:model-route && pnpm test:database-config && pnpm test:session && pnpm test:session-client && pnpm test:auth-db && pnpm test:guest-turns && pnpm test:oauth && pnpm test:questionnaire && pnpm test:present-question && pnpm test:reveal && pnpm test:reveal-ui && pnpm test:conversation && pnpm test:chat-turns && pnpm test:live-reply && pnpm test:sound-cues && pnpm test:tool-card && pnpm test:thinking && pnpm test:chat-markdown && pnpm test:dictation && pnpm test:steering && pnpm test:client-id && pnpm test:runtime-monitor && pnpm test:durable && pnpm build && pnpm test:static-routing
$ node --test scripts/check-file-size.test.mjs && node scripts/check-file-size.mjs
✔ the size gate checks new source before staging and leaves ignored output alone (173.012792ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 211.47925
File size check: 146 files within 1000 lines.
$ tsc --noEmit
$ node scripts/chat-model.test.mjs
Chat model routing contract passed.
$ node --test scripts/model-route.test.mjs
✔ reads routing headers the same way the Pi harness does (9.782458ms)
✔ stamps and recovers nested socratink route metadata (0.12625ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 73.897
$ node --test scripts/database-config.test.mjs
✔ uses Postgres when DATABASE_URL is configured (0.551833ms)
✔ fails closed in production or Vercel when DATABASE_URL is missing (0.192708ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 62.561709
$ node --test scripts/session.test.mjs
✔ fails closed in production or Vercel when SESSION_SECRET is missing (0.509ms)
✔ uses SESSION_SECRET when configured and a local secret otherwise (0.067417ms)
✔ conversation ids are userId:nonce and reject foreign prefixes (0.119084ms)
✔ conversation ids honor aliases and ignore malformed alias entries (0.069375ms)
✔ rate limiter uses the injected clock and counter (0.085792ms)
✔ chat routes reject a foreign conversation id with 403 (18.073167ms)
✔ chat routes rate-limit a session with a fake clock (1.745083ms)
✔ signed session cookie is HttpOnly and named socratink-session (0.62825ms)
✔ session cookie payload is a versioned userId plus random nonce (0.148541ms)
✔ minted guest cookie carries a guest payload and reuses the session id (0.839458ms)
✔ privilege change kills the previous cookie bytes and keeps the owned id (3.41825ms)
✔ signed and Chat admission each consume exactly one shared allowance (1.062833ms)
✔ secure cookies follow only the hosted security environment (0.088167ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 112.653292
$ node --test scripts/session-client.test.mjs
✔ loadAuthProviders returns server flags and fails closed without providers (10.871084ms)
✔ readOrCreateSession mints a guest session when none exists (0.821583ms)
✔ loginErrorCopy explains known OAuth failures and ignores unknown codes (0.066459ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 72.570708
$ node --test scripts/auth-db.test.mjs
✔ resolveAuthConfig resolves google and github providers and redirectBaseUrl (0.467583ms)
✔ resolveAuthConfig rejects production redirectBaseUrl in local development (0.206708ms)
✔ resolveAuthStoreTarget uses postgres when DATABASE_URL is set, sqlite otherwise (0.317583ms)
✔ AuthDb operations: users, oauth_accounts, and aliases (7.661416ms)
✔ postgres auth store retries its table setup after a failed first attempt (0.280667ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 87.707333
$ node --test scripts/guest-turns.test.mjs
✔ guest turn gate allows registered users without turn cap (22.777667ms)
✔ guest allowance is ten turns (0.117667ms)
✔ guest turn gate enforces 10-turn limit for guests and increments counter (7.130375ms)
✔ guest quota survives raw downstream responses and keeps attempt charging and exemptions (5.44175ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 119.541583
$ node --test scripts/oauth.test.mjs
✔ OAuth login routes redirect with PKCE parameters and set oauth_state cookie (17.380792ms)
✔ OAuth callback rejects missing or invalid state parameters (2.64975ms)
✔ Google callback creates a new user from the guest session and keeps the session id (9.25325ms)
✔ Google callback links a returning guest to an existing account via alias (6.289ms)
✔ Google callback attaches a new provider to an existing email user (4.090625ms)
✔ Google callback rejects unverified email without touching the session (2.8015ms)
✔ GitHub callback creates a user from a verified primary email (3.791375ms)
✔ GitHub callback rejects when no email is verified (2.352541ms)
✔ GitHub email selection prefers verified non-noreply addresses (0.131583ms)
✔ GitHub callback accepts a verified secondary email when the primary is unverified (4.011334ms)
✔ OAuth callback redirects to auth_failed when token exchange fails (2.664459ms)
✔ OAuth callback rejects a mismatched state parameter (2.402417ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 146.678916
$ node --test scripts/questionnaire-ui.test.mjs
✔ reads a validated questionnaire from live reply data and restored history parts (0.838541ms)
✔ fails closed on malformed or oversized structured questionnaire data (0.311875ms)
✔ formats selected, freeform, skipped and help answers as explicit learner text (0.91275ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 66.977125
$ node --test scripts/present-question.test.mjs
✔ slugs duplicate labels and keeps an explicit value when it is unique (0.658709ms)
✔ treats lettered or cued lists as unboxed choices, not explanatory traces (0.347291ms)
✔ ignores skill maps, subskill lists before an open question, and command lists (0.060625ms)
✔ retries once for an unboxed choice list (0.077ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 70.184041
$ node --test scripts/reveal.test.mjs
✔ accepts a kind and optional target, and rejects unknown kinds (0.768459ms)
✔ reads the last data-reveal part (0.08725ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 63.915125
$ node --test scripts/reveal-ui.test.mjs
✔ hint survives history and labels active and earlier supplied text (1.935666ms)
✔ worked_example survives history and labels active and earlier supplied text (0.216ms)
✔ partial survives history and labels active and earlier supplied text (0.185042ms)
✔ full_answer survives history and labels active and earlier supplied text (0.16375ms)
✔ an answered card shows its question and the answer shows as the learner's (0.410917ms)
✔ completed replies use the last validated reveal write (0.235ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 83.035167
$ node --test scripts/conversation-client.test.mjs
(node:21366) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ recheck waits longer than a mid-stream FreeLLMAPI teaching reply (0.490208ms)
✔ forwards admission-read stream events to the conversation listener (0.552ms)
✔ a 404 read leaves the admission in recovery without resending (0.165834ms)
✔ cancel before observed admission stays unknown and never enables resend (0.366166ms)
✔ send interruption before observed admission recovers without resend (0.123ms)
✔ cancel after admission waits for an aborted settlement before saying Canceled (0.196167ms)
✔ renders the reply when completion wins the cancel race (0.24475ms)
✔ a bounded abort failure becomes recoverable and never claims the reply stopped (0.161875ms)
✔ bare-id recheck does not complete a marker-only reply from prior-turn tools alone (0.132417ms)
✔ an admitted observation failure reattaches to the same submission without sending again (0.110542ms)
✔ reload hydrates an unsettled admission and reads only its submissionId without overlap (0.187375ms)
✔ restore without an unsettled admission returns to idle without sending (0.045375ms)
✔ openChatConversation namespaces and reuses the stored conversation id (1.541ms)
✔ openChatConversation keeps a stored conversation id owned by an alias (0.063667ms)
✔ reload does not revive an older unsettled record after a newer submission settled (0.050291ms)
✔ Retry resends exactly once only after an aborted settlement is confirmed (0.153292ms)
✔ a confirmed failed settlement can retry once (0.075125ms)
✔ not-admitted terminal state carries the envelope error code (0.082167ms)
✔ a confirmed not-admitted send can retry once (0.064334ms)
✔ a confirmed stop can send a different message without retrying the old one (0.072333ms)
✔ rejects every overlapping admission attempt (0.084375ms)
✔ maps user-facing errors without treating cancellation as a generic failure (0.034459ms)
✔ recovery locks the composer; a confirmed stop leaves it open (0.038583ms)
✔ rejects oversized learner messages before admission (9.281875ms)
✔ treats an empty assistant reply as a confirmed failure (0.162458ms)
✔ treats a marker-only assistant reply as a confirmed failure (0.075583ms)
✔ completes marker-only text when the reply includes a questionnaire (0.413125ms)
✔ startNewChatConversation stores a shared reset token before reload (0.094584ms)
✔ watchChatConversationReset syncs other tabs to the new conversation id (0.090666ms)
✔ watchChatConversationReset reloads when both keys already hold the same id (0.061833ms)
ℹ tests 30
ℹ suites 0
ℹ pass 30
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 90.492458
$ node --test scripts/chat-turns.test.mjs
✔ projects only visible learner and assistant turns from conversation history (1.247667ms)
✔ projects assistant tool calls from dynamic-tool parts (0.168792ms)
✔ keeps mark_reveal off the card and skips a reveal-only empty turn (0.101209ms)
✔ shows card answers and steering in the learner's own words (0.126208ms)
✔ history pairs a card answer with the card it answers (0.082541ms)
✔ dedupes only an adjacent failed or aborted learner retry with the same text (0.09225ms)
✔ dedupes a contiguous aborted submission group with a partial assistant before its retry (0.076583ms)
✔ preserves a non-adjacent failed same-text attempt across another exchange (0.076ms)
✔ splits the latest learner and closing reply into the current beat (0.08875ms)
✔ groups earlier turns into learner-started steps (0.095291ms)
✔ maps the stored assistant role to the Socratink display label (0.055125ms)
✔ projects the routed model from assistant response metadata (0.076458ms)
✔ skips marker-only assistant history rows after stripping (0.04575ms)
✔ strips internal assistant markers before history is shown (0.044708ms)
✔ assistant text removes only parentheticals or sentences naming internal tools (0.400334ms)
✔ learnerVisibleAssistantText removes stacked internal markers (0.04ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 77.526583
$ node --test scripts/live-reply.test.mjs
✔ live text from the server events equals the settled reply text, across text, tool call, text (1.68775ms)
✔ a reply of several messages shows its last, as the settled reply does (0.109167ms)
✔ leading markers are stripped when complete and held while half-arrived (0.128542ms)
✔ live text hides completed and unfinished bookkeeping that names internal tools (0.47825ms)
✔ only text deltas reach the learner; reasoning and other events do not (0.107958ms)
✔ a mark_reveal call marks the live text as soon as it arrives (0.315375ms)
✔ text the server would still check for an unmarked reveal waits for the mark (0.162625ms)
✔ a reveal cue mid-stream freezes the text already shown until the mark arrives (0.080541ms)
✔ a turn held from its start still shows nothing (0.122958ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 77.061417
$ node --test scripts/sound-cues.test.mjs
✔ Sound defaults off and the plain menu toggle saves its state (2311.566708ms)
✔ saved Sound on requires a user gesture before audio can start (365.419416ms)
✔ one fresh reply ticks only after completion, quietly and briefly (2000.353083ms)
✔ marked assistance stays silent for hints and supplied answers (2649.0865ms)
✔ restored history and recovered completion stay silent (344.033792ms)
✔ Sound off stays silent, including when turned off during a reply (3048.220542ms)
✔ reduced motion stays silent even when changed during a reply (1998.876708ms)
✔ duplicate completion delivery produces one tick total (2016.991083ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14975.748
$ node --test scripts/tool-card.test.mjs
✔ projects dynamic-tool parts into name, state, and output (1.039166ms)
✔ stream events advance one tool from running to done or failed (0.163416ms)
✔ a late input event does not reopen a settled tool (0.05925ms)
✔ formats object output as JSON and labels each execution state (0.064291ms)
✔ keeps present_question output off the card once the form is up (0.062708ms)
✔ keeps mark_reveal off the card, and present_question once the form is up (0.07ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 72.965667
$ node --test scripts/thinking.test.mjs
✔ the browser snapshot never carries raw model reasoning, pending or settled (0.682292ms)
✔ live events stream reply text only, even while reasoning arrives first (0.150125ms)
✔ a reveal call reaches the browser before the text it labels, even in one poll (0.101791ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 65.5355
$ node --test scripts/chat-markdown.test.mjs
✔ malformed table-like text terminates and remains readable (55.15275ms)
✔ each code copy control resets independently (1.101667ms)
✔ repeated copies reset once and destroyed renderers clear pending resets (0.146209ms)
✔ a clipboard write resolved after destroy cannot schedule a stale reset (0.141041ms)
✔ a clipboard write resolved after update cannot schedule a stale reset (0.429583ms)
✔ a rejected clipboard write does not announce a successful copy (0.159125ms)
✔ treats raw HTML as paragraph text (0.139834ms)
✔ rejects unsafe hrefs and keeps http(s), mailto, and relative links (0.109125ms)
✔ keeps parentheses inside markdown link hrefs (0.092959ms)
✔ keeps pipes inside inline code and escaped cells (0.231667ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 127.443459
$ node --test scripts/dictation.test.mjs
✔ detects unprefixed, prefixed, and unsupported constructors (0.667583ms)
✔ starts synchronously from click and projects starting, listening, stopping, and idle (0.777416ms)
✔ a final Send message command strips itself and submits once after end (0.549791ms)
✔ matches only Send message in final command position (0.074875ms)
✔ voice send fails closed for empty, non-command, and errored transcripts (0.380375ms)
✔ trusted typing, paste, and composition edits preserve their value and invalidate late results (0.174ms)
✔ stopForReview blocks active submission until recognition ends (0.127833ms)
✔ a bounded fallback aborts capture when stop never reaches end (2050.5685ms)
✔ cancel and request locking abort capture and ignore late events (0.693791ms)
✔ permission denial disables dictation for the page session and never restarts (0.566667ms)
✔ unexpected end and backgrounding never leave a false listening state (0.319541ms)
✔ destroy removes listeners, aborts capture, and prevents late mutation (0.180166ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2123.617042
$ node --test scripts/steering.test.mjs
✔ steering messages are prefixed learner turns, not capability claims (0.341958ms)
✔ copy uses a selected snippet when present, otherwise the whole turn (0.059333ms)
✔ steering chips send once; copy writes the turn without sending (0.555917ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 72.316833
$ node --test scripts/client-id.test.mjs
(node:21760) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ openChatConversation makes a conversation id without crypto.randomUUID (1.850583ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 78.776416
$ node --test scripts/runtime-monitor.test.mjs scripts/monitor-dispatch.test.mjs scripts/monitor-cadence.test.mjs
▶ cadence check uses completed production scans and fails closed through the HTTP boundary
  ✔ recent scan (50.414458ms)
  ✔ 45-minute boundary (48.5665ms)
  ✔ stale scan (44.470084ms)
  ✔ recovery uses successful scan from failed workflow (43.089334ms)
  ✔ current run cannot hide gap (41.580667ms)
  ✔ preview cannot hide gap (43.143667ms)
  ✔ newer failed scan does not hide older success (45.437958ms)
  ✔ later run order does not hide fresh rerun (45.54375ms)
  ✔ no prior runs (40.8055ms)
  ✔ no successful scan (44.722ms)
  ✔ preview only (45.07225ms)
  ✔ missing timestamp (43.676375ms)
  ✔ invalid timestamp (45.917375ms)
  ✔ future timestamp (44.29025ms)
  ✔ wrong branch (51.638959ms)
  ✔ unfinished run (44.543625ms)
  ✔ invalid run id (42.69ms)
  ✔ missing runs (44.692209ms)
  ✔ more than10 runs (45.067292ms)
  ✔ missing jobs (44.796792ms)
  ✔ incomplete job list (44.47025ms)
  ✔ missing steps (43.839792ms)
  ✔ malformed JSON (44.700208ms)
  ✔ HTTP failure (45.523959ms)
  ✔ network failure (29.994542ms)
  ✔ oversized response is canceled (44.2335ms)
  ✔ missing token sends no request (32.792042ms)
  ✔ invalid current run sends no request (30.277125ms)
  ✔ bounded10-run search (44.710209ms)
✔ cadence check uses completed production scans and fails closed through the HTTP boundary (1268.353584ms)
▶ scheduled entry point dispatches only the production monitor
  ✔ production (11.277ms)
  ✔ preview (0.142958ms)
  ✔ missing environment (0.125042ms)
  ✔ public request (0.428417ms)
  ✔ wrong schedule (0.115167ms)
  ✔ wrong method (0.088917ms)
  ✔ missing credential (0.101042ms)
  ✔ denied dispatch (0.748042ms)
  ✔ redirect rejected (0.19975ms)
  ✔ unexpected success body (0.196375ms)
  ✔ network failure (0.127541ms)
✔ scheduled entry point dispatches only the production monitor (36.208208ms)
✔ schedule is private and fits the current Hobby interval (2.510125ms)
▶ runtime monitor fails closed and keeps log contents private through the HTTP boundary
  ✔ clean (50.3975ms)
  ✔ HTTP202 retains runtime errors with context (42.288167ms)
  ✔ HTTP5xx without runtime logs (47.690666ms)
  ✔ known pg warning (42.594084ms)
  ✔ fatal never suppressed (43.8125ms)
  ✔ other warning not suppressed (46.561583ms)
  ✔ malformed JSON (41.948459ms)
  ✔ API error body (43.243ms)
  ✔ truncated message (48.029917ms)
  ✔ more pages (42.703084ms)
  ✔ missing pagination (42.727708ms)
  ✔ missing rows (42.061209ms)
  ✔ over100 rows (46.88425ms)
  ✔ oversized body is canceled (48.86575ms)
  ✔ missing error logs (47.428333ms)
  ✔ unused extra timestamp type (44.254083ms)
  ✔ stale row (42.925083ms)
  ✔ future row (46.818917ms)
  ✔ invalid timestamp (41.578083ms)
  ✔ wrong environment (45.074958ms)
  ✔ wrong project (44.36375ms)
  ✔ unexpected log level (45.465333ms)
  ✔ wrong HTTP filter (44.135834ms)
  ✔ HTTP permission failure (45.544542ms)
  ✔ network failure (31.3625ms)
  ✔ missing token sends no request (29.419375ms)
  ✔ explicit preview (47.025416ms)
  ✔ wrong preview (43.247125ms)
  ✔ invalid target (33.105333ms)
✔ runtime monitor fails closed and keeps log contents private through the HTTP boundary (1268.280333ms)
ℹ tests 73
ℹ suites 0
ℹ pass 73
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1314.603417
$ node --test src/inference/*.test.ts src/learning/*.test.ts src/server/durable/*.test.ts scripts/durable-storage.test.mjs scripts/durable-engine.test.mjs scripts/durable-reconnect.test.mjs
✔ another instance reads live reasoning, rejects a competing turn, and ownership closes after settlement (300.952416ms)
✔ a follower opened before the conversation exists matches a fresh snapshot at every step of a turn (182.904083ms)
✔ cross-instance cancellation persists and does not abort the next admission (273.864542ms)
✔ an execution slice leaves accepted work pending, releases ownership, and a later request recovers it (241.249291ms)
✔ native retry monitoring: transient failure recovers (100.419208ms)
✔ native retry monitoring: exhausted retries settle once (192.707375ms)
✔ SIGKILL recovery logs once (308.512416ms)
✔ SIGKILL recovery logs once and still reports a later provider retry (388.449625ms)
✔ a turn log line names route, hashed session, model, latency and status, never the conversation id (1.361417ms)
✔ a reply survives the server ending the events stream at its time cap mid-turn (2075.643042ms)
✔ a reply survives the network dropping the events connection mid-reply, as the UI coordinator sees it (1963.30325ms)
✔ an uninterrupted turn needs one events connection, and a connection after settlement returns at once (1958.586375ms)
✔ a Neon pooled URL uses only its matching direct endpoint for execution ownership (3.529125ms)
✔ Postgres storage connects on first use and retries after a failed start (39.801583ms)
✔ sqlite: reserves ID 1 for the immutable root conversation (7.442625ms)
✔ sqlite: receives a durable commit once before resolving, and never a refused one (4.427459ms)
✔ sqlite: commits mixed table writes atomically and rolls all of them back on failure (5.273834ms)
✔ sqlite: detaches retained writes and every returned record (5.108542ms)
✔ sqlite: detaches prototype-like JSON keys without changing object prototypes (4.813459ms)
✔ sqlite: indexes entries committed out of ID order (4.213625ms)
✔ sqlite: continues an entry cursor below its last item after a newer commit (4.488625ms)
✔ sqlite: paginates conversations by opaque cursor in ascending ID order (4.986667ms)
✔ sqlite: filters and pages conversations by durable owner edges (3.8385ms)
✔ sqlite: scans deep fork history newest-first through every ancestor cap (6.286333ms)
✔ sqlite: scans tables in either ID order and continues a cursor in its order (5.075208ms)
✔ sqlite: replaces complete task records and pages filtered task scans (4.016459ms)
✔ sqlite: stores owners and scans waiting and completing tasks by status (3.617958ms)
✔ sqlite: stores and scans sleeping tasks by status (3.295167ms)
✔ sqlite: indexes request IDs per conversation and replaces complete submission records (4.07175ms)
✔ sqlite: stores passive write submissions without input-only lifecycle states (3.644542ms)
✔ sqlite: stores continue submissions, which have no entry and are never queued (3.401958ms)
✔ sqlite: reconstructs rewindable documents and preserves half-open incarnations (5.092208ms)
✔ sqlite: streams long document tails across root replacement deltas (16.284417ms)
✔ sqlite: copies stored document bases independently and rejects ambiguous sources (5.454917ms)
✔ sqlite: uses bases for version transitions and rejects historical reads of current-only documents (3.374917ms)
✔ sqlite: indexes logical addresses and exact-scope scans independently (4.118417ms)
✔ sqlite: keeps document lifecycle failures atomic and gives create-plus-retire an empty lifetime (3.145542ms)
✔ sqlite: refuses a creation and a change of one document in one commit, in either order (2.635667ms)
✔ sqlite: rolls back record tables and secondary indexes when a document command fails (3.2365ms)
✔ sqlite: keeps indexed string identities lossless (3.25125ms)
✔ sqlite: keeps one global record ID namespace and rejects exhausted ID minting (2.895708ms)
✔ sqlite: commits batches in order, each with its seq, checked against the earlier ones (3.957041ms)
✔ sqlite: stores the batches before the first one refused, and none after it (3.337084ms)
✔ sqlite: refuses a later batch its own malformed actions fail, keeping the batches before it (2.981084ms)
✔ sqlite: resolves a batched copy against the state the earlier batches left (3.253042ms)
✔ sqlite: rejects every operation after close (2.078667ms)
✔ sqlite: another manager reads committed progress without taking execution ownership (3.179ms)
✔ sqlite: a refreshed reader applies only later commits and refuses a gap (4.392417ms)
✔ sqlite: ownership is released on close and unused IDs remain reserved (2.388208ms)
✔ every learner uses the current operator model and limits (1.051292ms)
✔ saved learner and retired model selections fall back to the current operator route (0.225167ms)
✔ each generation resolves the current operator settings (0.133084ms)
✔ operator status reports the route and missing hosted configuration refuses every turn (0.177375ms)
✔ card help reads back as assistance on the card it asked about (0.845458ms)
✔ an unmarked turn is corrected once when help was asked for or content looks supplied (0.613042ms)
✔ the teaching policy is the vendored socratic-tutor skill followed by Socratink bindings (0.765458ms)
✔ the tutor keeps tool names and bookkeeping out of learner text (0.077334ms)
✔ questions use current validation and presentation; reveals retain provenance without ending the turn (1.291375ms)
✔ the shared correction policy permits only one extra attempt (0.407625ms)
✔ a GET reads the private history snapshot without submitting work (17.561125ms)
✔ a send with no model provider is refused before admission, with a reason the browser can show (1.448667ms)
✔ an admitted send answers with only its submission id (0.725833ms)
✔ a settled conversation sends one reset with every reply, then ends (17.319416ms)
✔ a pending reply streams from its start after the reset, then settles and ends (4.018667ms)
✔ a long pending turn gets heartbeats and ends at the time cap (65.722667ms)
✔ a failed poll errors the stream and still closes the follower (2.260625ms)
✔ a dropped client stops the snapshot loop (31.874708ms)
✔ the bridge serves events as an uncached event stream (3.078833ms)
✔ operator transport preserves keys, limits, live route headers and persisted response metadata (114.214708ms)
✔ reflected credentials are removed from live failures, route headers and reopened native records without changing retries (53.139334ms)
ℹ tests 70
ℹ suites 0
ℹ pass 70
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6236.129666
$ vite build && vite build --config vite.config.ui.ts
vite v8.2.1 building ssr environment for production...
[2Ktransforming...✓ 43 modules transformed.
rendering chunks...
computing gzip size...
dist/app.mjs                    0.09 kB │ gzip:  0.09 kB
dist/server.mjs                 0.65 kB │ gzip:  0.41 kB │ map:   1.04 kB
dist/chunks/app-Cz1hOBw6.mjs  101.09 kB │ gzip: 28.72 kB │ map: 196.40 kB

✓ built in 31ms
vite v8.2.1 building client environment for production...
[2Ktransforming...✓ 55 modules transformed.
rendering chunks...
computing gzip size...
dist/client/404.html                             1.58 kB │ gzip:  0.79 kB
dist/client/login.html                           3.13 kB │ gzip:  1.46 kB
dist/client/assets/brand-wordmark-Df9HARvW.png   8.21 kB
dist/client/index.html                           8.75 kB │ gzip:  2.64 kB
dist/client/assets/paper-mono-C37UQ3VR.woff2    53.27 kB
dist/client/assets/notFound-DOETbd0n.css        10.10 kB │ gzip:  3.01 kB
dist/client/assets/login-CZMyzbxM.css           11.89 kB │ gzip:  3.45 kB
dist/client/assets/main-CDT69Xh3.css            47.10 kB │ gzip:  9.32 kB
dist/client/assets/login-rVsjIXd5.js             0.60 kB │ gzip:  0.36 kB
dist/client/assets/session-CMUuC2Yn.js           2.63 kB │ gzip:  1.19 kB
dist/client/assets/main-ypb1xy9u.js             70.68 kB │ gzip: 22.79 kB

✓ built in 59ms
$ node --test scripts/static-routing.test.mjs
✔ hosted login alias reaches the static login document without a loop (0.600208ms)
✔ Vercel keeps API ownership and native filesystem/404 handling (0.083125ms)
✔ production build ships branded recovery and existing static entries (2.461708ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 44.548958

# seed check seed-1
$ ["bash", "-c", "pnpm install --frozen-lockfile && node --test scripts/sound-cues.test.mjs && node -e \"const s=require('./package.json').scripts; process.exit(s.check.includes('pnpm test:sound-cues') && (s['test:sound-cues']||'').includes('scripts/sound-cues.test.mjs') ? 0 : 1)\""]
cwd: .
expect (operator confirms): Proposed, not run. With the package-specified Node and pnpm versions, install dependencies and run the new exact test file. Start with empty preference storage and no user gesture: assert Sound off and no audio start. Activate the plain menu Sound control through a user gesture, reload and assert the preference persists without replaying history. Submit 'How does photosynthesis store energy?' through production UI integration with deterministic external responses; assert exactly one quiet, short tick after the unmarked reply finishes. Supply a reply marked as a hint, then a marked answer: assert no tick. Restore saved history: assert no tick. Repeat with Sound off, then prefers-reduced-motion set: assert no tick. Repeat completion delivery for one reply: assert one tick total. Verify each planted fault is caught: a tick on a marked hint, a tick on restored history, a tick with Sound off, a tick with reduced motion, and two ticks for one reply. The corresponding zero-start or one-start assertion must fail for each fault. There is no chime clause. The final wiring assertion exits zero only when pnpm check includes pnpm test:sound-cues and that script names scripts/sound-cues.test.mjs. Scope and preview evidence are supplied by the separate records.
Already up to date
Done in 167ms using pnpm v11.1.1
✔ Sound defaults off and the plain menu toggle saves its state (2325.173208ms)
✔ saved Sound on requires a user gesture before audio can start (380.929334ms)
✔ one fresh reply ticks only after completion, quietly and briefly (2000.478875ms)
✔ marked assistance stays silent for hints and supplied answers (2665.014708ms)
✔ restored history and recovered completion stay silent (332.753541ms)
✔ Sound off stays silent, including when turned off during a reply (3065.381917ms)
✔ reduced motion stays silent even when changed during a reply (1999.709625ms)
✔ duplicate completion delivery produces one tick total (1985.306084ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14992.613625

# seed-1 at base efa55c7d679eff5f5d67e45d64c9d6c74014ec4a, with scripts/sound-cues.test.mjs from the candidate
Lockfile is up to date, resolution step is skipped
Progress: resolved 1, reused 0, downloaded 0, added 0
Packages: +156
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 156, reused 156, downloaded 0, added 133
Progress: resolved 156, reused 156, downloaded 0, added 156, done

dependencies:
+ @earendil-works/chord 1.5.0
+ @earendil-works/pi-ai 1.5.0
+ @earendil-works/pi-durable 1.5.0
+ @hono/node-server 2.1.6
+ @valibot/to-json-schema 1.3.0
+ @vercel/functions 3.9.5
+ hono 4.13.17
+ pg 8.23.0
+ valibot 1.4.2

devDependencies:
+ @types/node 26.2.0
+ @types/pg 8.23.1
+ playwright 1.65.0
+ typescript 7.0.2
+ vite 8.2.1

Done in 1.8s using pnpm v11.1.1
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

[Error: ENOENT: no such file or directory, open '/Users/jondev/dev/worktrees/tink-sdlc-setup/learners-who-turn-sound-on-hear-a-soft/.cache/tmp/sdlc-base-2i36mc4h/src/ui/sound-cues.ts'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/Users/jondev/dev/worktrees/tink-sdlc-setup/learners-who-turn-sound-on-hear-a-soft/.cache/tmp/sdlc-base-2i36mc4h/src/ui/sound-cues.ts'
}

Node.js v26.8.1
✖ scripts/sound-cues.test.mjs (616.364917ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 620.634583

✖ failing tests:

test at scripts/sound-cues.test.mjs:1:1
✖ scripts/sound-cues.test.mjs (616.364917ms)
  'test failed'

exit 1 at base

# seed check seed-2
$ ["bash", "-c", "B=$(git merge-base HEAD origin/main) && git diff --quiet \"$B\" -- pnpm-lock.yaml src/server src/inference src/learning src/reveal.ts src/ui/reveal-mark.ts && ! git diff --name-only --diff-filter=A \"$B\" | grep -Eiq '\\.(mp3|wav|ogg|m4a|aac|flac|webm)$'"]
cwd: .
expect (operator confirms): Proposed, not run. In the candidate checkout with origin/main available, determine the merge base and inspect the diff. Exit zero with no protected-path or lockfile difference and no added audio file matching the specified extensions. This exact guard does not inspect package.json dependency declarations or top-level src/server.ts; review those separately against the same scope.

# seed check seed-3
$ ["bash", "-c", "pnpm install --frozen-lockfile && pnpm check"]
cwd: .
expect (operator confirms): Proposed, not run. Starting from the candidate checkout with the package-specified Node and pnpm versions, install locked dependencies and run the full gate. All constituent checks, including the newly wired test:sound-cues regression, exit successfully. The build may write generated output under dist. This is suite verification, not browser judgment or learner acceptance.
Already up to date
Done in 167ms using pnpm v11.1.1
$ pnpm check:file-size && pnpm check:types && pnpm test:chat-model && pnpm test:model-route && pnpm test:database-config && pnpm test:session && pnpm test:session-client && pnpm test:auth-db && pnpm test:guest-turns && pnpm test:oauth && pnpm test:questionnaire && pnpm test:present-question && pnpm test:reveal && pnpm test:reveal-ui && pnpm test:conversation && pnpm test:chat-turns && pnpm test:live-reply && pnpm test:sound-cues && pnpm test:tool-card && pnpm test:thinking && pnpm test:chat-markdown && pnpm test:dictation && pnpm test:steering && pnpm test:client-id && pnpm test:runtime-monitor && pnpm test:durable && pnpm build && pnpm test:static-routing
$ node --test scripts/check-file-size.test.mjs && node scripts/check-file-size.mjs
✔ the size gate checks new source before staging and leaves ignored output alone (170.831042ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 209.606333
File size check: 146 files within 1000 lines.
$ tsc --noEmit
$ node scripts/chat-model.test.mjs
Chat model routing contract passed.
$ node --test scripts/model-route.test.mjs
✔ reads routing headers the same way the Pi harness does (10.261792ms)
✔ stamps and recovers nested socratink route metadata (0.119125ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 70.456709
$ node --test scripts/database-config.test.mjs
✔ uses Postgres when DATABASE_URL is configured (0.676208ms)
✔ fails closed in production or Vercel when DATABASE_URL is missing (0.235208ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 63.856709
$ node --test scripts/session.test.mjs
✔ fails closed in production or Vercel when SESSION_SECRET is missing (0.514167ms)
✔ uses SESSION_SECRET when configured and a local secret otherwise (0.067459ms)
✔ conversation ids are userId:nonce and reject foreign prefixes (0.113541ms)
✔ conversation ids honor aliases and ignore malformed alias entries (0.06625ms)
✔ rate limiter uses the injected clock and counter (0.083541ms)
✔ chat routes reject a foreign conversation id with 403 (17.773167ms)
✔ chat routes rate-limit a session with a fake clock (1.836292ms)
✔ signed session cookie is HttpOnly and named socratink-session (0.747125ms)
✔ session cookie payload is a versioned userId plus random nonce (0.163125ms)
✔ minted guest cookie carries a guest payload and reuses the session id (1.012292ms)
✔ privilege change kills the previous cookie bytes and keeps the owned id (2.967542ms)
✔ signed and Chat admission each consume exactly one shared allowance (1.089584ms)
✔ secure cookies follow only the hosted security environment (0.077333ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 112.434375
$ node --test scripts/session-client.test.mjs
✔ loadAuthProviders returns server flags and fails closed without providers (10.870333ms)
✔ readOrCreateSession mints a guest session when none exists (0.804ms)
✔ loginErrorCopy explains known OAuth failures and ignores unknown codes (0.072583ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 75.714
$ node --test scripts/auth-db.test.mjs
✔ resolveAuthConfig resolves google and github providers and redirectBaseUrl (0.433292ms)
✔ resolveAuthConfig rejects production redirectBaseUrl in local development (0.199416ms)
✔ resolveAuthStoreTarget uses postgres when DATABASE_URL is set, sqlite otherwise (0.305666ms)
✔ AuthDb operations: users, oauth_accounts, and aliases (16.682ms)
✔ postgres auth store retries its table setup after a failed first attempt (0.329042ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 97.155375
$ node --test scripts/guest-turns.test.mjs
✔ guest turn gate allows registered users without turn cap (26.56075ms)
✔ guest allowance is ten turns (0.119375ms)
✔ guest turn gate enforces 10-turn limit for guests and increments counter (6.945875ms)
✔ guest quota survives raw downstream responses and keeps attempt charging and exemptions (5.434875ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 122.04225
$ node --test scripts/oauth.test.mjs
✔ OAuth login routes redirect with PKCE parameters and set oauth_state cookie (17.93175ms)
✔ OAuth callback rejects missing or invalid state parameters (2.754375ms)
✔ Google callback creates a new user from the guest session and keeps the session id (9.484042ms)
✔ Google callback links a returning guest to an existing account via alias (6.033625ms)
✔ Google callback attaches a new provider to an existing email user (4.588292ms)
✔ Google callback rejects unverified email without touching the session (2.72075ms)
✔ GitHub callback creates a user from a verified primary email (3.713042ms)
✔ GitHub callback rejects when no email is verified (2.382959ms)
✔ GitHub email selection prefers verified non-noreply addresses (0.110791ms)
✔ GitHub callback accepts a verified secondary email when the primary is unverified (3.864125ms)
✔ OAuth callback redirects to auth_failed when token exchange fails (2.771542ms)
✔ OAuth callback rejects a mismatched state parameter (2.416833ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 148.59525
$ node --test scripts/questionnaire-ui.test.mjs
✔ reads a validated questionnaire from live reply data and restored history parts (0.626916ms)
✔ fails closed on malformed or oversized structured questionnaire data (0.24825ms)
✔ formats selected, freeform, skipped and help answers as explicit learner text (0.668583ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 69.888
$ node --test scripts/present-question.test.mjs
✔ slugs duplicate labels and keeps an explicit value when it is unique (0.68575ms)
✔ treats lettered or cued lists as unboxed choices, not explanatory traces (0.365125ms)
✔ ignores skill maps, subskill lists before an open question, and command lists (0.51925ms)
✔ retries once for an unboxed choice list (0.11125ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 68.030083
$ node --test scripts/reveal.test.mjs
✔ accepts a kind and optional target, and rejects unknown kinds (0.770292ms)
✔ reads the last data-reveal part (0.085209ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 67.805666
$ node --test scripts/reveal-ui.test.mjs
✔ hint survives history and labels active and earlier supplied text (2.48175ms)
✔ worked_example survives history and labels active and earlier supplied text (0.254334ms)
✔ partial survives history and labels active and earlier supplied text (0.233375ms)
✔ full_answer survives history and labels active and earlier supplied text (0.182333ms)
✔ an answered card shows its question and the answer shows as the learner's (0.502208ms)
✔ completed replies use the last validated reveal write (0.110042ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 81.632834
$ node --test scripts/conversation-client.test.mjs
(node:22926) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ recheck waits longer than a mid-stream FreeLLMAPI teaching reply (0.466917ms)
✔ forwards admission-read stream events to the conversation listener (0.643083ms)
✔ a 404 read leaves the admission in recovery without resending (0.258125ms)
✔ cancel before observed admission stays unknown and never enables resend (0.536458ms)
✔ send interruption before observed admission recovers without resend (0.173916ms)
✔ cancel after admission waits for an aborted settlement before saying Canceled (0.255458ms)
✔ renders the reply when completion wins the cancel race (0.299ms)
✔ a bounded abort failure becomes recoverable and never claims the reply stopped (0.174625ms)
✔ bare-id recheck does not complete a marker-only reply from prior-turn tools alone (0.170625ms)
✔ an admitted observation failure reattaches to the same submission without sending again (0.137083ms)
✔ reload hydrates an unsettled admission and reads only its submissionId without overlap (0.25525ms)
✔ restore without an unsettled admission returns to idle without sending (0.059292ms)
✔ openChatConversation namespaces and reuses the stored conversation id (1.864917ms)
✔ openChatConversation keeps a stored conversation id owned by an alias (0.074875ms)
✔ reload does not revive an older unsettled record after a newer submission settled (0.038833ms)
✔ Retry resends exactly once only after an aborted settlement is confirmed (0.161167ms)
✔ a confirmed failed settlement can retry once (0.091042ms)
✔ not-admitted terminal state carries the envelope error code (0.106292ms)
✔ a confirmed not-admitted send can retry once (0.083209ms)
✔ a confirmed stop can send a different message without retrying the old one (0.093666ms)
✔ rejects every overlapping admission attempt (0.11275ms)
✔ maps user-facing errors without treating cancellation as a generic failure (0.046166ms)
✔ recovery locks the composer; a confirmed stop leaves it open (0.050083ms)
✔ rejects oversized learner messages before admission (8.369875ms)
✔ treats an empty assistant reply as a confirmed failure (0.153083ms)
✔ treats a marker-only assistant reply as a confirmed failure (0.062167ms)
✔ completes marker-only text when the reply includes a questionnaire (0.343041ms)
✔ startNewChatConversation stores a shared reset token before reload (0.076667ms)
✔ watchChatConversationReset syncs other tabs to the new conversation id (0.075625ms)
✔ watchChatConversationReset reloads when both keys already hold the same id (0.050084ms)
ℹ tests 30
ℹ suites 0
ℹ pass 30
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 95.523833
$ node --test scripts/chat-turns.test.mjs
✔ projects only visible learner and assistant turns from conversation history (1.153334ms)
✔ projects assistant tool calls from dynamic-tool parts (0.159167ms)
✔ keeps mark_reveal off the card and skips a reveal-only empty turn (0.095584ms)
✔ shows card answers and steering in the learner's own words (0.130209ms)
✔ history pairs a card answer with the card it answers (0.083416ms)
✔ dedupes only an adjacent failed or aborted learner retry with the same text (0.091125ms)
✔ dedupes a contiguous aborted submission group with a partial assistant before its retry (0.073ms)
✔ preserves a non-adjacent failed same-text attempt across another exchange (0.069584ms)
✔ splits the latest learner and closing reply into the current beat (0.082125ms)
✔ groups earlier turns into learner-started steps (0.093709ms)
✔ maps the stored assistant role to the Socratink display label (0.048709ms)
✔ projects the routed model from assistant response metadata (0.07425ms)
✔ skips marker-only assistant history rows after stripping (0.045167ms)
✔ strips internal assistant markers before history is shown (0.051291ms)
✔ assistant text removes only parentheticals or sentences naming internal tools (0.357208ms)
✔ learnerVisibleAssistantText removes stacked internal markers (0.037917ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 75.806958
$ node --test scripts/live-reply.test.mjs
✔ live text from the server events equals the settled reply text, across text, tool call, text (1.277458ms)
✔ a reply of several messages shows its last, as the settled reply does (0.087791ms)
✔ leading markers are stripped when complete and held while half-arrived (0.1055ms)
✔ live text hides completed and unfinished bookkeeping that names internal tools (0.3715ms)
✔ only text deltas reach the learner; reasoning and other events do not (0.092667ms)
✔ a mark_reveal call marks the live text as soon as it arrives (0.251334ms)
✔ text the server would still check for an unmarked reveal waits for the mark (0.134292ms)
✔ a reveal cue mid-stream freezes the text already shown until the mark arrives (0.062584ms)
✔ a turn held from its start still shows nothing (0.102042ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 72.727875
$ node --test scripts/sound-cues.test.mjs
✔ Sound defaults off and the plain menu toggle saves its state (2320.794583ms)
✔ saved Sound on requires a user gesture before audio can start (380.803958ms)
✔ one fresh reply ticks only after completion, quietly and briefly (2000.567291ms)
✔ marked assistance stays silent for hints and supplied answers (2651.229ms)
✔ restored history and recovered completion stay silent (350.190791ms)
✔ Sound off stays silent, including when turned off during a reply (3068.236875ms)
✔ reduced motion stays silent even when changed during a reply (2000.36975ms)
✔ duplicate completion delivery produces one tick total (2002.484291ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 15015.014208
$ node --test scripts/tool-card.test.mjs
✔ projects dynamic-tool parts into name, state, and output (0.67775ms)
✔ stream events advance one tool from running to done or failed (0.14575ms)
✔ a late input event does not reopen a settled tool (0.051041ms)
✔ formats object output as JSON and labels each execution state (0.057083ms)
✔ keeps present_question output off the card once the form is up (0.066458ms)
✔ keeps mark_reveal off the card, and present_question once the form is up (0.072167ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 77.20725
$ node --test scripts/thinking.test.mjs
✔ the browser snapshot never carries raw model reasoning, pending or settled (0.710292ms)
✔ live events stream reply text only, even while reasoning arrives first (0.157833ms)
✔ a reveal call reaches the browser before the text it labels, even in one poll (0.11275ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 62.53425
$ node --test scripts/chat-markdown.test.mjs
✔ malformed table-like text terminates and remains readable (56.521167ms)
✔ each code copy control resets independently (0.929333ms)
✔ repeated copies reset once and destroyed renderers clear pending resets (0.137625ms)
✔ a clipboard write resolved after destroy cannot schedule a stale reset (0.137416ms)
✔ a clipboard write resolved after update cannot schedule a stale reset (0.407667ms)
✔ a rejected clipboard write does not announce a successful copy (0.146125ms)
✔ treats raw HTML as paragraph text (0.145333ms)
✔ rejects unsafe hrefs and keeps http(s), mailto, and relative links (0.093625ms)
✔ keeps parentheses inside markdown link hrefs (0.092292ms)
✔ keeps pipes inside inline code and escaped cells (0.2215ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 129.0475
$ node --test scripts/dictation.test.mjs
✔ detects unprefixed, prefixed, and unsupported constructors (0.872583ms)
✔ starts synchronously from click and projects starting, listening, stopping, and idle (0.955708ms)
✔ a final Send message command strips itself and submits once after end (0.523167ms)
✔ matches only Send message in final command position (0.073ms)
✔ voice send fails closed for empty, non-command, and errored transcripts (0.371084ms)
✔ trusted typing, paste, and composition edits preserve their value and invalidate late results (0.191417ms)
✔ stopForReview blocks active submission until recognition ends (0.122875ms)
✔ a bounded fallback aborts capture when stop never reaches end (2051.538292ms)
✔ cancel and request locking abort capture and ignore late events (0.716667ms)
✔ permission denial disables dictation for the page session and never restarts (0.762459ms)
✔ unexpected end and backgrounding never leave a false listening state (0.405542ms)
✔ destroy removes listeners, aborts capture, and prevents late mutation (0.203ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2129.710416
$ node --test scripts/steering.test.mjs
✔ steering messages are prefixed learner turns, not capability claims (0.356708ms)
✔ copy uses a selected snippet when present, otherwise the whole turn (0.068ms)
✔ steering chips send once; copy writes the turn without sending (0.563292ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 64.600334
$ node --test scripts/client-id.test.mjs
(node:23405) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ openChatConversation makes a conversation id without crypto.randomUUID (1.891416ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 76.388583
$ node --test scripts/runtime-monitor.test.mjs scripts/monitor-dispatch.test.mjs scripts/monitor-cadence.test.mjs
▶ cadence check uses completed production scans and fails closed through the HTTP boundary
  ✔ recent scan (50.508166ms)
  ✔ 45-minute boundary (45.46825ms)
  ✔ stale scan (43.461417ms)
  ✔ recovery uses successful scan from failed workflow (42.003417ms)
  ✔ current run cannot hide gap (46.011208ms)
  ✔ preview cannot hide gap (42.647875ms)
  ✔ newer failed scan does not hide older success (43.96025ms)
  ✔ later run order does not hide fresh rerun (43.220708ms)
  ✔ no prior runs (43.370834ms)
  ✔ no successful scan (47.063416ms)
  ✔ preview only (45.52925ms)
  ✔ missing timestamp (42.773375ms)
  ✔ invalid timestamp (44.365583ms)
  ✔ future timestamp (45.731125ms)
  ✔ wrong branch (44.435667ms)
  ✔ unfinished run (45.436125ms)
  ✔ invalid run id (44.547833ms)
  ✔ missing runs (42.146292ms)
  ✔ more than10 runs (43.861542ms)
  ✔ missing jobs (43.867458ms)
  ✔ incomplete job list (43.522125ms)
  ✔ missing steps (44.64ms)
  ✔ malformed JSON (45.033709ms)
  ✔ HTTP failure (44.3925ms)
  ✔ network failure (32.152917ms)
  ✔ oversized response is canceled (45.374042ms)
  ✔ missing token sends no request (31.246667ms)
  ✔ invalid current run sends no request (32.920875ms)
  ✔ bounded10-run search (44.9755ms)
✔ cadence check uses completed production scans and fails closed through the HTTP boundary (1261.248542ms)
▶ scheduled entry point dispatches only the production monitor
  ✔ production (12.968625ms)
  ✔ preview (0.179541ms)
  ✔ missing environment (0.471208ms)
  ✔ public request (0.112584ms)
  ✔ wrong schedule (0.122625ms)
  ✔ wrong method (0.086417ms)
  ✔ missing credential (0.111459ms)
  ✔ denied dispatch (0.752375ms)
  ✔ redirect rejected (0.181208ms)
  ✔ unexpected success body (0.179708ms)
  ✔ network failure (0.102625ms)
✔ scheduled entry point dispatches only the production monitor (36.1455ms)
✔ schedule is private and fits the current Hobby interval (2.382917ms)
▶ runtime monitor fails closed and keeps log contents private through the HTTP boundary
  ✔ clean (48.438375ms)
  ✔ HTTP202 retains runtime errors with context (42.114583ms)
  ✔ HTTP5xx without runtime logs (44.338666ms)
  ✔ known pg warning (46.418375ms)
  ✔ fatal never suppressed (45.121708ms)
  ✔ other warning not suppressed (43.502958ms)
  ✔ malformed JSON (43.9265ms)
  ✔ API error body (44.90125ms)
  ✔ truncated message (41.78675ms)
  ✔ more pages (46.33925ms)
  ✔ missing pagination (43.498375ms)
  ✔ missing rows (45.609583ms)
  ✔ over100 rows (44.240833ms)
  ✔ oversized body is canceled (49.028ms)
  ✔ missing error logs (43.451083ms)
  ✔ unused extra timestamp type (40.570917ms)
  ✔ stale row (47.212125ms)
  ✔ future row (44.340167ms)
  ✔ invalid timestamp (41.195917ms)
  ✔ wrong environment (44.168917ms)
  ✔ wrong project (43.685792ms)
  ✔ unexpected log level (43.844292ms)
  ✔ wrong HTTP filter (45.772166ms)
  ✔ HTTP permission failure (44.003333ms)
  ✔ network failure (32.552083ms)
  ✔ missing token sends no request (34.015208ms)
  ✔ explicit preview (46.212083ms)
  ✔ wrong preview (44.52425ms)
  ✔ invalid target (28.389708ms)
✔ runtime monitor fails closed and keeps log contents private through the HTTP boundary (1260.016042ms)
ℹ tests 73
ℹ suites 0
ℹ pass 73
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1304.355375
$ node --test src/inference/*.test.ts src/learning/*.test.ts src/server/durable/*.test.ts scripts/durable-storage.test.mjs scripts/durable-engine.test.mjs scripts/durable-reconnect.test.mjs
✔ another instance reads live reasoning, rejects a competing turn, and ownership closes after settlement (268.174958ms)
✔ a follower opened before the conversation exists matches a fresh snapshot at every step of a turn (185.704709ms)
✔ cross-instance cancellation persists and does not abort the next admission (272.041292ms)
✔ an execution slice leaves accepted work pending, releases ownership, and a later request recovers it (239.097791ms)
✔ native retry monitoring: transient failure recovers (101.847875ms)
✔ native retry monitoring: exhausted retries settle once (189.901208ms)
✔ SIGKILL recovery logs once (306.526208ms)
✔ SIGKILL recovery logs once and still reports a later provider retry (386.925917ms)
✔ a turn log line names route, hashed session, model, latency and status, never the conversation id (1.482084ms)
✔ a reply survives the server ending the events stream at its time cap mid-turn (2060.984667ms)
✔ a reply survives the network dropping the events connection mid-reply, as the UI coordinator sees it (1970.710333ms)
✔ an uninterrupted turn needs one events connection, and a connection after settlement returns at once (1981.824ms)
✔ a Neon pooled URL uses only its matching direct endpoint for execution ownership (3.070625ms)
✔ Postgres storage connects on first use and retries after a failed start (28.997916ms)
✔ sqlite: reserves ID 1 for the immutable root conversation (5.040041ms)
✔ sqlite: receives a durable commit once before resolving, and never a refused one (3.937042ms)
✔ sqlite: commits mixed table writes atomically and rolls all of them back on failure (3.64775ms)
✔ sqlite: detaches retained writes and every returned record (3.319167ms)
✔ sqlite: detaches prototype-like JSON keys without changing object prototypes (2.721042ms)
✔ sqlite: indexes entries committed out of ID order (2.916ms)
✔ sqlite: continues an entry cursor below its last item after a newer commit (3.521208ms)
✔ sqlite: paginates conversations by opaque cursor in ascending ID order (2.7615ms)
✔ sqlite: filters and pages conversations by durable owner edges (3.344333ms)
✔ sqlite: scans deep fork history newest-first through every ancestor cap (5.52275ms)
✔ sqlite: scans tables in either ID order and continues a cursor in its order (4.048ms)
✔ sqlite: replaces complete task records and pages filtered task scans (3.393584ms)
✔ sqlite: stores owners and scans waiting and completing tasks by status (3.057542ms)
✔ sqlite: stores and scans sleeping tasks by status (2.391916ms)
✔ sqlite: indexes request IDs per conversation and replaces complete submission records (3.210833ms)
✔ sqlite: stores passive write submissions without input-only lifecycle states (2.639417ms)
✔ sqlite: stores continue submissions, which have no entry and are never queued (2.806083ms)
✔ sqlite: reconstructs rewindable documents and preserves half-open incarnations (4.5275ms)
✔ sqlite: streams long document tails across root replacement deltas (14.78875ms)
✔ sqlite: copies stored document bases independently and rejects ambiguous sources (5.090291ms)
✔ sqlite: uses bases for version transitions and rejects historical reads of current-only documents (2.785583ms)
✔ sqlite: indexes logical addresses and exact-scope scans independently (3.11725ms)
✔ sqlite: keeps document lifecycle failures atomic and gives create-plus-retire an empty lifetime (2.89675ms)
✔ sqlite: refuses a creation and a change of one document in one commit, in either order (2.491791ms)
✔ sqlite: rolls back record tables and secondary indexes when a document command fails (2.647208ms)
✔ sqlite: keeps indexed string identities lossless (2.780958ms)
✔ sqlite: keeps one global record ID namespace and rejects exhausted ID minting (2.47075ms)
✔ sqlite: commits batches in order, each with its seq, checked against the earlier ones (3.00275ms)
✔ sqlite: stores the batches before the first one refused, and none after it (2.735833ms)
✔ sqlite: refuses a later batch its own malformed actions fail, keeping the batches before it (2.67025ms)
✔ sqlite: resolves a batched copy against the state the earlier batches left (3.210625ms)
✔ sqlite: rejects every operation after close (1.860417ms)
✔ sqlite: another manager reads committed progress without taking execution ownership (2.984208ms)
✔ sqlite: a refreshed reader applies only later commits and refuses a gap (3.772583ms)
✔ sqlite: ownership is released on close and unused IDs remain reserved (2.874375ms)
✔ every learner uses the current operator model and limits (0.907042ms)
✔ saved learner and retired model selections fall back to the current operator route (0.187958ms)
✔ each generation resolves the current operator settings (0.112208ms)
✔ operator status reports the route and missing hosted configuration refuses every turn (0.130417ms)
✔ card help reads back as assistance on the card it asked about (0.73675ms)
✔ an unmarked turn is corrected once when help was asked for or content looks supplied (0.42775ms)
✔ the teaching policy is the vendored socratic-tutor skill followed by Socratink bindings (0.672625ms)
✔ the tutor keeps tool names and bookkeeping out of learner text (0.0645ms)
✔ questions use current validation and presentation; reveals retain provenance without ending the turn (1.261625ms)
✔ the shared correction policy permits only one extra attempt (0.352042ms)
✔ a GET reads the private history snapshot without submitting work (12.795291ms)
✔ a send with no model provider is refused before admission, with a reason the browser can show (0.859375ms)
✔ an admitted send answers with only its submission id (0.444542ms)
✔ a settled conversation sends one reset with every reply, then ends (12.272958ms)
✔ a pending reply streams from its start after the reset, then settles and ends (2.683791ms)
✔ a long pending turn gets heartbeats and ends at the time cap (64.051958ms)
✔ a failed poll errors the stream and still closes the follower (0.938292ms)
✔ a dropped client stops the snapshot loop (30.710542ms)
✔ the bridge serves events as an uncached event stream (1.953958ms)
✔ operator transport preserves keys, limits, live route headers and persisted response metadata (79.57025ms)
✔ reflected credentials are removed from live failures, route headers and reopened native records without changing retries (49.047209ms)
ℹ tests 70
ℹ suites 0
ℹ pass 70
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6204.664958
$ vite build && vite build --config vite.config.ui.ts
vite v8.2.1 building ssr environment for production...
[2Ktransforming...✓ 43 modules transformed.
rendering chunks...
computing gzip size...
dist/app.mjs                    0.09 kB │ gzip:  0.09 kB
dist/server.mjs                 0.65 kB │ gzip:  0.41 kB │ map:   1.04 kB
dist/chunks/app-Cz1hOBw6.mjs  101.09 kB │ gzip: 28.72 kB │ map: 196.40 kB

✓ built in 28ms
vite v8.2.1 building client environment for production...
[2Ktransforming...✓ 55 modules transformed.
rendering chunks...
computing gzip size...
dist/client/404.html                             1.58 kB │ gzip:  0.79 kB
dist/client/login.html                           3.13 kB │ gzip:  1.46 kB
dist/client/assets/brand-wordmark-Df9HARvW.png   8.21 kB
dist/client/index.html                           8.75 kB │ gzip:  2.64 kB
dist/client/assets/paper-mono-C37UQ3VR.woff2    53.27 kB
dist/client/assets/notFound-DOETbd0n.css        10.10 kB │ gzip:  3.01 kB
dist/client/assets/login-CZMyzbxM.css           11.89 kB │ gzip:  3.45 kB
dist/client/assets/main-CDT69Xh3.css            47.10 kB │ gzip:  9.32 kB
dist/client/assets/login-rVsjIXd5.js             0.60 kB │ gzip:  0.36 kB
dist/client/assets/session-CMUuC2Yn.js           2.63 kB │ gzip:  1.19 kB
dist/client/assets/main-ypb1xy9u.js             70.68 kB │ gzip: 22.79 kB

✓ built in 61ms
$ node --test scripts/static-routing.test.mjs
✔ hosted login alias reaches the static login document without a loop (0.925334ms)
✔ Vercel keeps API ownership and native filesystem/404 handling (0.120875ms)
✔ production build ships branded recovery and existing static entries (2.890625ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 57.119708

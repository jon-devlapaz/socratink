
$ ["pnpm", "check"]
$ pnpm check:file-size && pnpm check:types && pnpm test:chat-model && pnpm test:model-route && pnpm test:database-config && pnpm test:session && pnpm test:session-client && pnpm test:auth-db && pnpm test:guest-turns && pnpm test:oauth && pnpm test:questionnaire && pnpm test:present-question && pnpm test:reveal && pnpm test:reveal-ui && pnpm test:conversation && pnpm test:chat-turns && pnpm test:live-reply && pnpm test:sound-cues && pnpm test:tool-card && pnpm test:thinking && pnpm test:chat-markdown && pnpm test:dictation && pnpm test:steering && pnpm test:client-id && pnpm test:runtime-monitor && pnpm test:durable && pnpm build && pnpm test:static-routing
$ node --test scripts/check-file-size.test.mjs && node scripts/check-file-size.mjs
✔ the size gate checks new source before staging and leaves ignored output alone (219.780458ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 257.070583
File size check: 156 files within 1000 lines.
$ tsc --noEmit
$ node scripts/chat-model.test.mjs
Chat model routing contract passed.
$ node --test scripts/model-route.test.mjs
✔ reads routing headers the same way the Pi harness does (10.043333ms)
✔ stamps and recovers nested socratink route metadata (0.143291ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 63.727792
$ node --test scripts/database-config.test.mjs
✔ uses Postgres when DATABASE_URL is configured (0.57925ms)
✔ fails closed in production or Vercel when DATABASE_URL is missing (0.179583ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 58.551459
$ node --test scripts/session.test.mjs
✔ fails closed in production or Vercel when SESSION_SECRET is missing (0.441667ms)
✔ uses SESSION_SECRET when configured and a local secret otherwise (0.057084ms)
✔ conversation ids are userId:nonce and reject foreign prefixes (0.100125ms)
✔ conversation ids honor aliases and ignore malformed alias entries (0.055666ms)
✔ rate limiter uses the injected clock and counter (0.076417ms)
✔ chat routes reject a foreign conversation id with 403 (14.120459ms)
✔ chat routes rate-limit a session with a fake clock (1.769375ms)
✔ signed session cookie is HttpOnly and named socratink-session (0.677416ms)
✔ session cookie payload is a versioned userId plus random nonce (0.144125ms)
✔ minted guest cookie carries a guest payload and reuses the session id (0.854ms)
✔ privilege change kills the previous cookie bytes and keeps the owned id (2.822333ms)
✔ signed and Chat admission each consume exactly one shared allowance (1.055125ms)
✔ secure cookies follow only the hosted security environment (0.077084ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 118.115583
$ node --test scripts/session-client.test.mjs
✔ loadAuthProviders returns server flags and fails closed without providers (9.316125ms)
✔ readOrCreateSession mints a guest session when none exists (0.690792ms)
✔ loginErrorCopy explains known OAuth failures and ignores unknown codes (0.04925ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 69.412167
$ node --test scripts/auth-db.test.mjs
✔ resolveAuthConfig resolves google and github providers and redirectBaseUrl (0.47125ms)
✔ resolveAuthConfig rejects production redirectBaseUrl in local development (0.20175ms)
✔ resolveAuthStoreTarget uses postgres when DATABASE_URL is set, sqlite otherwise (0.303625ms)
✔ AuthDb operations: users, oauth_accounts, and aliases (6.343625ms)
✔ postgres auth store retries its table setup after a failed first attempt (0.222583ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 76.957084
$ node --test scripts/guest-turns.test.mjs
✔ guest turn gate allows registered users without turn cap (18.413209ms)
✔ guest allowance is ten turns (0.113916ms)
✔ guest turn gate enforces 10-turn limit for guests and increments counter (6.526125ms)
✔ guest quota survives raw downstream responses and keeps attempt charging and exemptions (4.903667ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 107.762417
$ node --test scripts/oauth.test.mjs
✔ OAuth login routes redirect with PKCE parameters and set oauth_state cookie (13.989083ms)
✔ OAuth callback rejects missing or invalid state parameters (2.242917ms)
✔ Google callback creates a new user from the guest session and keeps the session id (8.135167ms)
✔ Google callback links a returning guest to an existing account via alias (5.183334ms)
✔ Google callback attaches a new provider to an existing email user (3.84075ms)
✔ Google callback rejects unverified email without touching the session (2.52425ms)
✔ GitHub callback creates a user from a verified primary email (3.329041ms)
✔ GitHub callback rejects when no email is verified (1.997584ms)
✔ GitHub email selection prefers verified non-noreply addresses (0.105167ms)
✔ GitHub callback accepts a verified secondary email when the primary is unverified (3.4945ms)
✔ OAuth callback redirects to auth_failed when token exchange fails (2.192417ms)
✔ OAuth callback rejects a mismatched state parameter (1.946417ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 131.492292
$ node --test scripts/questionnaire-ui.test.mjs
✔ reads a validated questionnaire from live reply data and restored history parts (0.5525ms)
✔ fails closed on malformed or oversized structured questionnaire data (0.562833ms)
✔ formats selected, freeform, skipped and help answers as explicit learner text (0.290875ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 65.125459
$ node --test scripts/present-question.test.mjs
✔ slugs duplicate labels and keeps an explicit value when it is unique (0.556125ms)
✔ treats lettered or cued lists as unboxed choices, not explanatory traces (0.320083ms)
✔ ignores skill maps, subskill lists before an open question, and command lists (0.401625ms)
✔ retries once for an unboxed choice list (0.058291ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 60.356167
$ node --test scripts/reveal.test.mjs
✔ accepts a kind and optional target, and rejects unknown kinds (0.743334ms)
✔ reads the last data-reveal part (0.083375ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 59.848958
$ node --test scripts/reveal-ui.test.mjs
✔ hint survives history and labels active and earlier supplied text (1.818959ms)
✔ worked_example survives history and labels active and earlier supplied text (0.183708ms)
✔ partial survives history and labels active and earlier supplied text (0.160167ms)
✔ full_answer survives history and labels active and earlier supplied text (0.134292ms)
✔ an answered card shows its question and the answer shows as the learner's (0.35475ms)
✔ completed replies use the last validated reveal write (0.068708ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 78.002917
$ node --test scripts/conversation-client.test.mjs
(node:74479) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ recheck waits longer than a mid-stream FreeLLMAPI teaching reply (0.414167ms)
✔ forwards admission-read stream events to the conversation listener (0.48825ms)
✔ a 404 read leaves the admission in recovery without resending (0.142083ms)
✔ cancel before observed admission stays unknown and never enables resend (0.326708ms)
✔ send interruption before observed admission recovers without resend (0.113417ms)
✔ cancel after admission waits for an aborted settlement before saying Canceled (0.166792ms)
✔ renders the reply when completion wins the cancel race (0.21375ms)
✔ a bounded abort failure becomes recoverable and never claims the reply stopped (0.127958ms)
✔ bare-id recheck does not complete a marker-only reply from prior-turn tools alone (0.13325ms)
✔ an admitted observation failure reattaches to the same submission without sending again (0.09725ms)
✔ reload hydrates an unsettled admission and reads only its submissionId without overlap (0.154083ms)
✔ restore without an unsettled admission returns to idle without sending (0.054292ms)
✔ openChatConversation namespaces and reuses the stored conversation id (1.266916ms)
✔ openChatConversation keeps a stored conversation id owned by an alias (0.049708ms)
✔ reload does not revive an older unsettled record after a newer submission settled (0.024875ms)
✔ Retry resends exactly once only after an aborted settlement is confirmed (0.108875ms)
✔ a confirmed failed settlement can retry once (0.06375ms)
✔ not-admitted terminal state carries the envelope error code (0.074709ms)
✔ a confirmed not-admitted send can retry once (0.052667ms)
✔ a confirmed stop can send a different message without retrying the old one (0.062042ms)
✔ rejects every overlapping admission attempt (0.069708ms)
✔ maps user-facing errors without treating cancellation as a generic failure (0.030291ms)
✔ recovery locks the composer; a confirmed stop leaves it open (0.032125ms)
✔ rejects oversized learner messages before admission (7.246834ms)
✔ treats an empty assistant reply as a confirmed failure (0.140833ms)
✔ treats a marker-only assistant reply as a confirmed failure (0.059375ms)
✔ completes marker-only text when the reply includes a questionnaire (0.34825ms)
✔ startNewChatConversation stores a shared reset token before reload (0.075334ms)
✔ watchChatConversationReset syncs other tabs to the new conversation id (0.076458ms)
✔ watchChatConversationReset reloads when both keys already hold the same id (0.052584ms)
ℹ tests 30
ℹ suites 0
ℹ pass 30
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 83.1415
$ node --test scripts/chat-turns.test.mjs
✔ projects only visible learner and assistant turns from conversation history (1.185042ms)
✔ projects assistant tool calls from dynamic-tool parts (0.164833ms)
✔ keeps mark_reveal off the card and skips a reveal-only empty turn (0.097125ms)
✔ shows card answers and steering in the learner's own words (0.126875ms)
✔ history pairs a card answer with the card it answers (0.081709ms)
✔ dedupes only an adjacent failed or aborted learner retry with the same text (0.089458ms)
✔ dedupes a contiguous aborted submission group with a partial assistant before its retry (0.0745ms)
✔ preserves a non-adjacent failed same-text attempt across another exchange (0.072125ms)
✔ splits the latest learner and closing reply into the current beat (0.082708ms)
✔ groups earlier turns into learner-started steps (0.095708ms)
✔ maps the stored assistant role to the Socratink display label (0.048375ms)
✔ projects the routed model from assistant response metadata (0.073792ms)
✔ skips marker-only assistant history rows after stripping (0.046ms)
✔ strips internal assistant markers before history is shown (0.052042ms)
✔ assistant text removes only parentheticals or sentences naming internal tools (0.353042ms)
✔ learnerVisibleAssistantText removes stacked internal markers (0.034792ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 70.00325
$ node --test scripts/live-reply.test.mjs
✔ live text from the server events equals the settled reply text, across text, tool call, text (1.313041ms)
✔ a reply of several messages shows its last, as the settled reply does (0.085667ms)
✔ leading markers are stripped when complete and held while half-arrived (0.107041ms)
✔ live text hides completed and unfinished bookkeeping that names internal tools (0.344875ms)
✔ only text deltas reach the learner; reasoning and other events do not (0.087917ms)
✔ a mark_reveal call marks the live text as soon as it arrives (0.246208ms)
✔ text the server would still check for an unmarked reveal waits for the mark (0.13775ms)
✔ a reveal cue mid-stream freezes the text already shown until the mark arrives (0.063792ms)
✔ a turn held from its start still shows nothing (0.100792ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 69.849042
$ node --test scripts/sound-cues.test.mjs
✔ Sound defaults off and the plain menu toggle saves its state (2381.407333ms)
✔ saved Sound on requires a user gesture before audio can start (361.944459ms)
✔ one fresh reply ticks only after completion, quietly and briefly (1973.268083ms)
✔ marked assistance stays silent for hints and supplied answers (2626.113917ms)
✔ restored history and recovered completion stay silent (309.770917ms)
✔ Sound off stays silent, including when turned off during a reply (3047.949083ms)
✔ reduced motion stays silent even when changed during a reply (1978.248042ms)
✔ duplicate completion delivery produces one tick total (1982.097583ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14915.618667
$ node --test scripts/tool-card.test.mjs
✔ projects dynamic-tool parts into name, state, and output (0.684375ms)
✔ stream events advance one tool from running to done or failed (0.146583ms)
✔ a late input event does not reopen a settled tool (0.053917ms)
✔ formats object output as JSON and labels each execution state (0.0565ms)
✔ keeps present_question output off the card once the form is up (0.064ms)
✔ keeps mark_reveal off the card, and present_question once the form is up (0.075917ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 64.4725
$ node --test scripts/thinking.test.mjs
✔ the browser snapshot never carries raw model reasoning, pending or settled (0.610542ms)
✔ live events stream reply text only, even while reasoning arrives first (0.136334ms)
✔ a reveal call reaches the browser before the text it labels, even in one poll (0.095417ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 58.039375
$ node --test scripts/chat-markdown.test.mjs
✔ malformed table-like text terminates and remains readable (50.725167ms)
✔ each code copy control resets independently (0.954667ms)
✔ repeated copies reset once and destroyed renderers clear pending resets (0.103459ms)
✔ a clipboard write resolved after destroy cannot schedule a stale reset (0.102291ms)
✔ a clipboard write resolved after update cannot schedule a stale reset (0.344917ms)
✔ a rejected clipboard write does not announce a successful copy (0.140917ms)
✔ treats raw HTML as paragraph text (0.128042ms)
✔ rejects unsafe hrefs and keeps http(s), mailto, and relative links (0.083917ms)
✔ keeps parentheses inside markdown link hrefs (0.081042ms)
✔ keeps pipes inside inline code and escaped cells (0.198416ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 113.001708
$ node --test scripts/dictation.test.mjs
✔ detects unprefixed, prefixed, and unsupported constructors (0.588375ms)
✔ starts synchronously from click and projects starting, listening, stopping, and idle (0.317167ms)
✔ a final Send message command strips itself and submits once after end (0.620125ms)
✔ matches only Send message in final command position (0.0745ms)
✔ voice send fails closed for empty, non-command, and errored transcripts (0.374667ms)
✔ trusted typing, paste, and composition edits preserve their value and invalidate late results (0.171417ms)
✔ stopForReview blocks active submission until recognition ends (0.115459ms)
✔ a bounded fallback aborts capture when stop never reaches end (2051.332459ms)
✔ cancel and request locking abort capture and ignore late events (0.694208ms)
✔ permission denial disables dictation for the page session and never restarts (0.583958ms)
✔ unexpected end and backgrounding never leave a false listening state (0.334959ms)
✔ destroy removes listeners, aborts capture, and prevents late mutation (0.195791ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2113.721917
$ node --test scripts/steering.test.mjs
✔ steering messages are prefixed learner turns, not capability claims (0.327042ms)
✔ copy uses a selected snippet when present, otherwise the whole turn (0.06175ms)
✔ steering chips send once; copy writes the turn without sending (0.564375ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 60.203542
$ node --test scripts/client-id.test.mjs
(node:74789) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ openChatConversation makes a conversation id without crypto.randomUUID (4.070334ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 70.848291
$ node --test scripts/runtime-monitor.test.mjs scripts/monitor-dispatch.test.mjs scripts/monitor-cadence.test.mjs
▶ cadence check uses completed production scans and fails closed through the HTTP boundary
  ✔ recent scan (43.113959ms)
  ✔ 45-minute boundary (45.528417ms)
  ✔ stale scan (40.709333ms)
  ✔ recovery uses successful scan from failed workflow (40.716208ms)
  ✔ current run cannot hide gap (39.403041ms)
  ✔ preview cannot hide gap (41.293875ms)
  ✔ newer failed scan does not hide older success (40.630375ms)
  ✔ later run order does not hide fresh rerun (40.771ms)
  ✔ no prior runs (43.582292ms)
  ✔ no successful scan (40.158208ms)
  ✔ preview only (42.063625ms)
  ✔ missing timestamp (40.958333ms)
  ✔ invalid timestamp (38.611916ms)
  ✔ future timestamp (45.057917ms)
  ✔ wrong branch (40.08975ms)
  ✔ unfinished run (39.719625ms)
  ✔ invalid run id (39.9965ms)
  ✔ missing runs (45.017666ms)
  ✔ more than10 runs (40.573625ms)
  ✔ missing jobs (42.109375ms)
  ✔ incomplete job list (40.612667ms)
  ✔ missing steps (40.954916ms)
  ✔ malformed JSON (39.73875ms)
  ✔ HTTP failure (40.062833ms)
  ✔ network failure (30.49725ms)
  ✔ oversized response is canceled (40.441041ms)
  ✔ missing token sends no request (30.24625ms)
  ✔ invalid current run sends no request (29.471417ms)
  ✔ bounded10-run search (41.588ms)
✔ cadence check uses completed production scans and fails closed through the HTTP boundary (1170.407291ms)
▶ scheduled entry point dispatches only the production monitor
  ✔ production (9.478459ms)
  ✔ preview (0.1265ms)
  ✔ missing environment (0.432208ms)
  ✔ public request (0.094208ms)
  ✔ wrong schedule (0.091083ms)
  ✔ wrong method (0.072667ms)
  ✔ missing credential (0.091125ms)
  ✔ denied dispatch (0.648083ms)
  ✔ redirect rejected (0.165959ms)
  ✔ unexpected success body (0.181125ms)
  ✔ network failure (0.091ms)
✔ scheduled entry point dispatches only the production monitor (30.61875ms)
✔ schedule is private and fits the current Hobby interval (2.760833ms)
▶ runtime monitor fails closed and keeps log contents private through the HTTP boundary
  ✔ clean (42.11825ms)
  ✔ HTTP202 retains runtime errors with context (46.928542ms)
  ✔ HTTP5xx without runtime logs (43.538792ms)
  ✔ known pg warning (37.888ms)
  ✔ fatal never suppressed (39.126875ms)
  ✔ other warning not suppressed (36.765416ms)
  ✔ malformed JSON (40.456875ms)
  ✔ API error body (38.621792ms)
  ✔ truncated message (40.393375ms)
  ✔ more pages (39.728625ms)
  ✔ missing pagination (42.250625ms)
  ✔ missing rows (39.588541ms)
  ✔ over100 rows (38.87125ms)
  ✔ oversized body is canceled (44.277916ms)
  ✔ missing error logs (38.410042ms)
  ✔ unused extra timestamp type (37.977375ms)
  ✔ stale row (38.063333ms)
  ✔ future row (40.469875ms)
  ✔ invalid timestamp (39.453208ms)
  ✔ wrong environment (40.145916ms)
  ✔ wrong project (38.183ms)
  ✔ unexpected log level (40.073292ms)
  ✔ wrong HTTP filter (41.136375ms)
  ✔ HTTP permission failure (37.872542ms)
  ✔ network failure (28.332625ms)
  ✔ missing token sends no request (26.220291ms)
  ✔ explicit preview (43.048292ms)
  ✔ wrong preview (41.515833ms)
  ✔ invalid target (26.996625ms)
✔ runtime monitor fails closed and keeps log contents private through the HTTP boundary (1134.734625ms)
ℹ tests 73
ℹ suites 0
ℹ pass 73
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1208.058292
$ node --test src/inference/*.test.ts src/learning/*.test.ts src/server/durable/*.test.ts scripts/durable-storage.test.mjs scripts/durable-engine.test.mjs scripts/durable-reconnect.test.mjs scripts/feedback-agent.test.mjs
✔ another instance reads live reasoning, rejects a competing turn, and ownership closes after settlement (410.585375ms)
✔ a follower opened before the conversation exists matches a fresh snapshot at every step of a turn (165.633541ms)
✔ cross-instance cancellation persists and does not abort the next admission (277.492ms)
✔ an execution slice leaves accepted work pending, releases ownership, and a later request recovers it (243.067375ms)
✔ native retry monitoring: transient failure recovers (77.774167ms)
✔ native retry monitoring: exhausted retries settle once (180.485916ms)
✔ SIGKILL recovery logs once (273.79775ms)
✔ SIGKILL recovery logs once and still reports a later provider retry (383.258416ms)
✔ a turn log line names route, hashed session, model, latency and status, never the conversation id (1.222584ms)
✔ a reply survives the server ending the events stream at its time cap mid-turn (2180.189792ms)
✔ a reply survives the network dropping the events connection mid-reply, as the UI coordinator sees it (1959.784083ms)
✔ an uninterrupted turn needs one events connection, and a connection after settlement returns at once (1963.085458ms)
✔ a Neon pooled URL uses only its matching direct endpoint for execution ownership (2.642542ms)
✔ Postgres storage connects on first use and retries after a failed start (29.765625ms)
✔ sqlite: reserves ID 1 for the immutable root conversation (6.306333ms)
✔ sqlite: receives a durable commit once before resolving, and never a refused one (2.539334ms)
✔ sqlite: commits mixed table writes atomically and rolls all of them back on failure (2.813708ms)
✔ sqlite: detaches retained writes and every returned record (2.389958ms)
✔ sqlite: detaches prototype-like JSON keys without changing object prototypes (1.843583ms)
✔ sqlite: indexes entries committed out of ID order (1.814875ms)
✔ sqlite: continues an entry cursor below its last item after a newer commit (2.032667ms)
✔ sqlite: paginates conversations by opaque cursor in ascending ID order (1.776208ms)
✔ sqlite: filters and pages conversations by durable owner edges (2.968834ms)
✔ sqlite: scans deep fork history newest-first through every ancestor cap (4.332375ms)
✔ sqlite: scans tables in either ID order and continues a cursor in its order (3.245958ms)
✔ sqlite: replaces complete task records and pages filtered task scans (2.577958ms)
✔ sqlite: stores owners and scans waiting and completing tasks by status (2.121792ms)
✔ sqlite: stores and scans sleeping tasks by status (1.90025ms)
✔ sqlite: indexes request IDs per conversation and replaces complete submission records (2.371333ms)
✔ sqlite: stores passive write submissions without input-only lifecycle states (3.2905ms)
✔ sqlite: stores continue submissions, which have no entry and are never queued (1.883625ms)
✔ sqlite: reconstructs rewindable documents and preserves half-open incarnations (4.353291ms)
✔ sqlite: streams long document tails across root replacement deltas (9.148959ms)
✔ sqlite: copies stored document bases independently and rejects ambiguous sources (3.324792ms)
✔ sqlite: uses bases for version transitions and rejects historical reads of current-only documents (1.808583ms)
✔ sqlite: indexes logical addresses and exact-scope scans independently (2.751291ms)
✔ sqlite: keeps document lifecycle failures atomic and gives create-plus-retire an empty lifetime (3.443208ms)
✔ sqlite: refuses a creation and a change of one document in one commit, in either order (1.6585ms)
✔ sqlite: rolls back record tables and secondary indexes when a document command fails (2.429958ms)
✔ sqlite: keeps indexed string identities lossless (2.896ms)
✔ sqlite: keeps one global record ID namespace and rejects exhausted ID minting (2.015667ms)
✔ sqlite: commits batches in order, each with its seq, checked against the earlier ones (2.363708ms)
✔ sqlite: stores the batches before the first one refused, and none after it (1.930083ms)
✔ sqlite: refuses a later batch its own malformed actions fail, keeping the batches before it (3.801ms)
✔ sqlite: resolves a batched copy against the state the earlier batches left (4.555417ms)
✔ sqlite: rejects every operation after close (1.49175ms)
✔ sqlite: another manager reads committed progress without taking execution ownership (3.138958ms)
✔ sqlite: a refreshed reader applies only later commits and refuses a gap (3.485583ms)
✔ sqlite: ownership is released on close and unused IDs remain reserved (4.533834ms)
✔ tutor sends one approved draft with the right account on its Modem connection (589.863666ms)
✔ every learner uses the current operator model and limits (0.936375ms)
✔ saved learner and retired model selections fall back to the current operator route (0.155209ms)
✔ each generation resolves the current operator settings (0.092959ms)
✔ operator status reports the route and missing hosted configuration refuses every turn (0.862959ms)
✔ card help reads back as assistance on the card it asked about (2.133917ms)
✔ an unmarked turn is corrected once when help was asked for or content looks supplied (0.451125ms)
✔ the teaching policy is the vendored socratic-tutor skill followed by Socratink bindings (0.936417ms)
✔ the tutor keeps tool names and bookkeeping out of learner text (0.110833ms)
✔ questions use current validation and presentation; reveals retain provenance without ending the turn (1.036834ms)
✔ the shared correction policy permits only one extra attempt (0.357584ms)
✔ a GET reads the private history snapshot without submitting work (14.444166ms)
✔ a send with no model provider is refused before admission, with a reason the browser can show (3.734ms)
✔ an admitted send answers with only its submission id (0.564917ms)
✔ a settled conversation sends one reset with every reply, then ends (11.859125ms)
✔ a pending reply streams from its start after the reset, then settles and ends (2.980625ms)
✔ a long pending turn gets heartbeats and ends at the time cap (59.966583ms)
✔ a failed poll errors the stream and still closes the follower (2.173417ms)
✔ a dropped client stops the snapshot loop (33.210917ms)
✔ the bridge serves events as an uncached event stream (2.079792ms)
✔ operator transport preserves keys, limits, live route headers and persisted response metadata (220.801625ms)
✔ reflected credentials are removed from live failures, route headers and reopened native records without changing retries (32.746417ms)
ℹ tests 71
ℹ suites 0
ℹ pass 71
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6307.666958
$ vite build && vite build --config vite.config.ui.ts
vite v8.2.1 building ssr environment for production...
[2Ktransforming...✓ 49 modules transformed.
rendering chunks...
computing gzip size...
dist/app.mjs                    0.09 kB │ gzip:  0.09 kB
dist/server.mjs                 0.65 kB │ gzip:  0.41 kB │ map:   1.04 kB
dist/chunks/app-M1Cv3Qc3.mjs  113.92 kB │ gzip: 32.35 kB │ map: 222.21 kB

✓ built in 21ms
vite v8.2.1 building client environment for production...
[2Ktransforming...✓ 60 modules transformed.
rendering chunks...
computing gzip size...
dist/client/404.html                             1.50 kB │ gzip:  0.73 kB
dist/client/login.html                           3.16 kB │ gzip:  1.48 kB
dist/client/assets/brand-wordmark-Df9HARvW.png   8.21 kB
dist/client/index.html                          10.42 kB │ gzip:  3.10 kB
dist/client/assets/paper-mono-C37UQ3VR.woff2    53.27 kB
dist/client/assets/notFound-CgNnqslE.css        10.41 kB │ gzip:  3.10 kB
dist/client/assets/login-BiFuefOY.css           12.23 kB │ gzip:  3.55 kB
dist/client/assets/main-BWs6QYTm.css            48.34 kB │ gzip:  9.62 kB
dist/client/assets/login-DSXAZxfo.js             0.60 kB │ gzip:  0.36 kB
dist/client/assets/session-CMUuC2Yn.js           2.63 kB │ gzip:  1.19 kB
dist/client/assets/main-De4GD2Ms.js             71.23 kB │ gzip: 22.99 kB

✓ built in 75ms
$ node --test scripts/static-routing.test.mjs
✔ hosted login alias reaches the static login document without a loop (0.603ms)
✔ Vercel keeps API ownership and native filesystem/404 handling (0.075875ms)
✔ production build ships branded recovery and existing static entries (2.376ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 39.632167

# seed check seed-1
$ ["bash", "-c", "pnpm install --frozen-lockfile && node --test scripts/sound-cues.test.mjs && node -e \"const s=require('./package.json').scripts; process.exit(s.check.includes('pnpm test:sound-cues') && (s['test:sound-cues']||'').includes('scripts/sound-cues.test.mjs') ? 0 : 1)\""]
cwd: .
expect (operator confirms): Proposed, not run. With the package-specified Node and pnpm versions, install dependencies and run the new exact test file. Start with empty preference storage and no user gesture: assert Sound off and no audio start. Activate the plain menu Sound control through a user gesture, reload and assert the preference persists without replaying history. Submit 'How does photosynthesis store energy?' through production UI integration with deterministic external responses; assert exactly one quiet, short tick after the unmarked reply finishes. Supply a reply marked as a hint, then a marked answer: assert no tick. Restore saved history: assert no tick. Repeat with Sound off, then prefers-reduced-motion set: assert no tick. Repeat completion delivery for one reply: assert one tick total. Verify each planted fault is caught: a tick on a marked hint, a tick on restored history, a tick with Sound off, a tick with reduced motion, and two ticks for one reply. The corresponding zero-start or one-start assertion must fail for each fault. There is no chime clause. The final wiring assertion exits zero only when pnpm check includes pnpm test:sound-cues and that script names scripts/sound-cues.test.mjs. Scope and preview evidence are supplied by the separate records.
Already up to date
Done in 132ms using pnpm v11.1.1
✔ Sound defaults off and the plain menu toggle saves its state (2262.806375ms)
✔ saved Sound on requires a user gesture before audio can start (363.24125ms)
✔ one fresh reply ticks only after completion, quietly and briefly (1979.242917ms)
✔ marked assistance stays silent for hints and supplied answers (2623.880208ms)
✔ restored history and recovered completion stay silent (303.559042ms)
✔ Sound off stays silent, including when turned off during a reply (3046.812958ms)
✔ reduced motion stays silent even when changed during a reply (1978.184084ms)
✔ duplicate completion delivery produces one tick total (1981.332667ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14749.971875

# seed-1 at base efa55c7d679eff5f5d67e45d64c9d6c74014ec4a, with scripts/sound-cues.test.mjs from the candidate
Lockfile is up to date, resolution step is skipped
Progress: resolved 1, reused 0, downloaded 0, added 0
Packages: +156
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 156, reused 156, downloaded 0, added 155
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

Done in 1.2s using pnpm v11.1.1
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

[Error: ENOENT: no such file or directory, open '/Users/jondev/dev/worktrees/tink-sdlc-setup/learners-who-turn-sound-on-hear-a-soft/.cache/tmp/sdlc-base-mhypyy6_/src/ui/sound-cues.ts'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/Users/jondev/dev/worktrees/tink-sdlc-setup/learners-who-turn-sound-on-hear-a-soft/.cache/tmp/sdlc-base-mhypyy6_/src/ui/sound-cues.ts'
}

Node.js v26.8.1
✖ scripts/sound-cues.test.mjs (577.021375ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 580.7955

✖ failing tests:

test at scripts/sound-cues.test.mjs:1:1
✖ scripts/sound-cues.test.mjs (577.021375ms)
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
Done in 135ms using pnpm v11.1.1
$ pnpm check:file-size && pnpm check:types && pnpm test:chat-model && pnpm test:model-route && pnpm test:database-config && pnpm test:session && pnpm test:session-client && pnpm test:auth-db && pnpm test:guest-turns && pnpm test:oauth && pnpm test:questionnaire && pnpm test:present-question && pnpm test:reveal && pnpm test:reveal-ui && pnpm test:conversation && pnpm test:chat-turns && pnpm test:live-reply && pnpm test:sound-cues && pnpm test:tool-card && pnpm test:thinking && pnpm test:chat-markdown && pnpm test:dictation && pnpm test:steering && pnpm test:client-id && pnpm test:runtime-monitor && pnpm test:durable && pnpm build && pnpm test:static-routing
$ node --test scripts/check-file-size.test.mjs && node scripts/check-file-size.mjs
✔ the size gate checks new source before staging and leaves ignored output alone (206.823917ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 242.432417
File size check: 156 files within 1000 lines.
$ tsc --noEmit
$ node scripts/chat-model.test.mjs
Chat model routing contract passed.
$ node --test scripts/model-route.test.mjs
✔ reads routing headers the same way the Pi harness does (10.175542ms)
✔ stamps and recovers nested socratink route metadata (0.1335ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 68.141833
$ node --test scripts/database-config.test.mjs
✔ uses Postgres when DATABASE_URL is configured (0.576333ms)
✔ fails closed in production or Vercel when DATABASE_URL is missing (0.176ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 57.549375
$ node --test scripts/session.test.mjs
✔ fails closed in production or Vercel when SESSION_SECRET is missing (0.509084ms)
✔ uses SESSION_SECRET when configured and a local secret otherwise (0.067041ms)
✔ conversation ids are userId:nonce and reject foreign prefixes (0.11675ms)
✔ conversation ids honor aliases and ignore malformed alias entries (0.0665ms)
✔ rate limiter uses the injected clock and counter (0.088083ms)
✔ chat routes reject a foreign conversation id with 403 (15.23825ms)
✔ chat routes rate-limit a session with a fake clock (1.377667ms)
✔ signed session cookie is HttpOnly and named socratink-session (0.510458ms)
✔ session cookie payload is a versioned userId plus random nonce (0.109666ms)
✔ minted guest cookie carries a guest payload and reuses the session id (0.740333ms)
✔ privilege change kills the previous cookie bytes and keeps the owned id (2.004542ms)
✔ signed and Chat admission each consume exactly one shared allowance (0.635459ms)
✔ secure cookies follow only the hosted security environment (0.049375ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 97.749292
$ node --test scripts/session-client.test.mjs
✔ loadAuthProviders returns server flags and fails closed without providers (11.063083ms)
✔ readOrCreateSession mints a guest session when none exists (0.781833ms)
✔ loginErrorCopy explains known OAuth failures and ignores unknown codes (0.063792ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 69.862167
$ node --test scripts/auth-db.test.mjs
✔ resolveAuthConfig resolves google and github providers and redirectBaseUrl (0.45175ms)
✔ resolveAuthConfig rejects production redirectBaseUrl in local development (0.2ms)
✔ resolveAuthStoreTarget uses postgres when DATABASE_URL is set, sqlite otherwise (0.305167ms)
✔ AuthDb operations: users, oauth_accounts, and aliases (6.967583ms)
✔ postgres auth store retries its table setup after a failed first attempt (0.310458ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 79.169042
$ node --test scripts/guest-turns.test.mjs
✔ guest turn gate allows registered users without turn cap (21.635167ms)
✔ guest allowance is ten turns (0.11475ms)
✔ guest turn gate enforces 10-turn limit for guests and increments counter (7.8895ms)
✔ guest quota survives raw downstream responses and keeps attempt charging and exemptions (4.421583ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 108.809
$ node --test scripts/oauth.test.mjs
✔ OAuth login routes redirect with PKCE parameters and set oauth_state cookie (14.947667ms)
✔ OAuth callback rejects missing or invalid state parameters (2.194834ms)
✔ Google callback creates a new user from the guest session and keeps the session id (8.172041ms)
✔ Google callback links a returning guest to an existing account via alias (4.962542ms)
✔ Google callback attaches a new provider to an existing email user (4.037125ms)
✔ Google callback rejects unverified email without touching the session (2.545666ms)
✔ GitHub callback creates a user from a verified primary email (3.193875ms)
✔ GitHub callback rejects when no email is verified (1.869584ms)
✔ GitHub email selection prefers verified non-noreply addresses (0.089042ms)
✔ GitHub callback accepts a verified secondary email when the primary is unverified (3.324375ms)
✔ OAuth callback redirects to auth_failed when token exchange fails (2.204875ms)
✔ OAuth callback rejects a mismatched state parameter (3.214417ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 131.901542
$ node --test scripts/questionnaire-ui.test.mjs
✔ reads a validated questionnaire from live reply data and restored history parts (0.600834ms)
✔ fails closed on malformed or oversized structured questionnaire data (0.241166ms)
✔ formats selected, freeform, skipped and help answers as explicit learner text (0.6205ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 61.113958
$ node --test scripts/present-question.test.mjs
✔ slugs duplicate labels and keeps an explicit value when it is unique (0.563667ms)
✔ treats lettered or cued lists as unboxed choices, not explanatory traces (0.629791ms)
✔ ignores skill maps, subskill lists before an open question, and command lists (0.050584ms)
✔ retries once for an unboxed choice list (0.055ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 59.307833
$ node --test scripts/reveal.test.mjs
✔ accepts a kind and optional target, and rejects unknown kinds (0.76275ms)
✔ reads the last data-reveal part (0.088375ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 60.482084
$ node --test scripts/reveal-ui.test.mjs
✔ hint survives history and labels active and earlier supplied text (1.742125ms)
✔ worked_example survives history and labels active and earlier supplied text (0.180875ms)
✔ partial survives history and labels active and earlier supplied text (0.157959ms)
✔ full_answer survives history and labels active and earlier supplied text (0.132458ms)
✔ an answered card shows its question and the answer shows as the learner's (0.362ms)
✔ completed replies use the last validated reveal write (0.069375ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 74.408666
$ node --test scripts/conversation-client.test.mjs
(node:75791) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ recheck waits longer than a mid-stream FreeLLMAPI teaching reply (0.481959ms)
✔ forwards admission-read stream events to the conversation listener (0.544917ms)
✔ a 404 read leaves the admission in recovery without resending (0.159209ms)
✔ cancel before observed admission stays unknown and never enables resend (0.366125ms)
✔ send interruption before observed admission recovers without resend (0.123833ms)
✔ cancel after admission waits for an aborted settlement before saying Canceled (0.201834ms)
✔ renders the reply when completion wins the cancel race (0.253583ms)
✔ a bounded abort failure becomes recoverable and never claims the reply stopped (0.13925ms)
✔ bare-id recheck does not complete a marker-only reply from prior-turn tools alone (0.148042ms)
✔ an admitted observation failure reattaches to the same submission without sending again (0.117334ms)
✔ reload hydrates an unsettled admission and reads only its submissionId without overlap (0.198ms)
✔ restore without an unsettled admission returns to idle without sending (0.048291ms)
✔ openChatConversation namespaces and reuses the stored conversation id (1.558ms)
✔ openChatConversation keeps a stored conversation id owned by an alias (0.073417ms)
✔ reload does not revive an older unsettled record after a newer submission settled (0.03075ms)
✔ Retry resends exactly once only after an aborted settlement is confirmed (0.144917ms)
✔ a confirmed failed settlement can retry once (0.074333ms)
✔ not-admitted terminal state carries the envelope error code (0.084875ms)
✔ a confirmed not-admitted send can retry once (0.062ms)
✔ a confirmed stop can send a different message without retrying the old one (0.070833ms)
✔ rejects every overlapping admission attempt (0.078667ms)
✔ maps user-facing errors without treating cancellation as a generic failure (0.035292ms)
✔ recovery locks the composer; a confirmed stop leaves it open (0.03775ms)
✔ rejects oversized learner messages before admission (6.707584ms)
✔ treats an empty assistant reply as a confirmed failure (0.103333ms)
✔ treats a marker-only assistant reply as a confirmed failure (0.052083ms)
✔ completes marker-only text when the reply includes a questionnaire (0.28125ms)
✔ startNewChatConversation stores a shared reset token before reload (0.064375ms)
✔ watchChatConversationReset syncs other tabs to the new conversation id (0.06625ms)
✔ watchChatConversationReset reloads when both keys already hold the same id (0.040167ms)
ℹ tests 30
ℹ suites 0
ℹ pass 30
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 89.367042
$ node --test scripts/chat-turns.test.mjs
✔ projects only visible learner and assistant turns from conversation history (1.169833ms)
✔ projects assistant tool calls from dynamic-tool parts (0.162208ms)
✔ keeps mark_reveal off the card and skips a reveal-only empty turn (0.096917ms)
✔ shows card answers and steering in the learner's own words (0.125042ms)
✔ history pairs a card answer with the card it answers (0.103208ms)
✔ dedupes only an adjacent failed or aborted learner retry with the same text (0.097042ms)
✔ dedupes a contiguous aborted submission group with a partial assistant before its retry (0.078042ms)
✔ preserves a non-adjacent failed same-text attempt across another exchange (0.074084ms)
✔ splits the latest learner and closing reply into the current beat (0.086375ms)
✔ groups earlier turns into learner-started steps (0.095833ms)
✔ maps the stored assistant role to the Socratink display label (0.048291ms)
✔ projects the routed model from assistant response metadata (0.071458ms)
✔ skips marker-only assistant history rows after stripping (0.048792ms)
✔ strips internal assistant markers before history is shown (0.053125ms)
✔ assistant text removes only parentheticals or sentences naming internal tools (0.37275ms)
✔ learnerVisibleAssistantText removes stacked internal markers (0.037042ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 69.876583
$ node --test scripts/live-reply.test.mjs
✔ live text from the server events equals the settled reply text, across text, tool call, text (1.309125ms)
✔ a reply of several messages shows its last, as the settled reply does (0.085625ms)
✔ leading markers are stripped when complete and held while half-arrived (0.104625ms)
✔ live text hides completed and unfinished bookkeeping that names internal tools (0.445417ms)
✔ only text deltas reach the learner; reasoning and other events do not (0.09775ms)
✔ a mark_reveal call marks the live text as soon as it arrives (0.2415ms)
✔ text the server would still check for an unmarked reveal waits for the mark (0.129917ms)
✔ a reveal cue mid-stream freezes the text already shown until the mark arrives (0.055333ms)
✔ a turn held from its start still shows nothing (0.092334ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 67.888584
$ node --test scripts/sound-cues.test.mjs
✔ Sound defaults off and the plain menu toggle saves its state (2260.306167ms)
✔ saved Sound on requires a user gesture before audio can start (360.6ms)
✔ one fresh reply ticks only after completion, quietly and briefly (1978.059125ms)
✔ marked assistance stays silent for hints and supplied answers (2628.187ms)
✔ restored history and recovered completion stay silent (307.638166ms)
✔ Sound off stays silent, including when turned off during a reply (3046.118583ms)
✔ reduced motion stays silent even when changed during a reply (1980.531708ms)
✔ duplicate completion delivery produces one tick total (1979.362791ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14748.171875
$ node --test scripts/tool-card.test.mjs
✔ projects dynamic-tool parts into name, state, and output (0.926167ms)
✔ stream events advance one tool from running to done or failed (0.129ms)
✔ a late input event does not reopen a settled tool (0.044083ms)
✔ formats object output as JSON and labels each execution state (0.046542ms)
✔ keeps present_question output off the card once the form is up (0.053417ms)
✔ keeps mark_reveal off the card, and present_question once the form is up (0.059916ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 62.795667
$ node --test scripts/thinking.test.mjs
✔ the browser snapshot never carries raw model reasoning, pending or settled (0.733958ms)
✔ live events stream reply text only, even while reasoning arrives first (0.159166ms)
✔ a reveal call reaches the browser before the text it labels, even in one poll (0.109625ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 58.957708
$ node --test scripts/chat-markdown.test.mjs
✔ malformed table-like text terminates and remains readable (49.949833ms)
✔ each code copy control resets independently (1.14025ms)
✔ repeated copies reset once and destroyed renderers clear pending resets (0.129833ms)
✔ a clipboard write resolved after destroy cannot schedule a stale reset (0.119667ms)
✔ a clipboard write resolved after update cannot schedule a stale reset (0.389ms)
✔ a rejected clipboard write does not announce a successful copy (0.151209ms)
✔ treats raw HTML as paragraph text (0.136875ms)
✔ rejects unsafe hrefs and keeps http(s), mailto, and relative links (0.092125ms)
✔ keeps parentheses inside markdown link hrefs (0.095625ms)
✔ keeps pipes inside inline code and escaped cells (0.224834ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 113.203375
$ node --test scripts/dictation.test.mjs
✔ detects unprefixed, prefixed, and unsupported constructors (0.696583ms)
✔ starts synchronously from click and projects starting, listening, stopping, and idle (0.735542ms)
✔ a final Send message command strips itself and submits once after end (0.491167ms)
✔ matches only Send message in final command position (0.067167ms)
✔ voice send fails closed for empty, non-command, and errored transcripts (0.354791ms)
✔ trusted typing, paste, and composition edits preserve their value and invalidate late results (0.161917ms)
✔ stopForReview blocks active submission until recognition ends (0.109125ms)
✔ a bounded fallback aborts capture when stop never reaches end (2050.761ms)
✔ cancel and request locking abort capture and ignore late events (0.260333ms)
✔ permission denial disables dictation for the page session and never restarts (0.180458ms)
✔ unexpected end and backgrounding never leave a false listening state (0.103167ms)
✔ destroy removes listeners, aborts capture, and prevents late mutation (0.0565ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2113.696375
$ node --test scripts/steering.test.mjs
✔ steering messages are prefixed learner turns, not capability claims (0.3375ms)
✔ copy uses a selected snippet when present, otherwise the whole turn (0.061542ms)
✔ steering chips send once; copy writes the turn without sending (0.556833ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 61.149166
$ node --test scripts/client-id.test.mjs
(node:76141) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
(Use `node --trace-warnings ...` to show where the warning was created)
✔ openChatConversation makes a conversation id without crypto.randomUUID (1.867125ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 71.233083
$ node --test scripts/runtime-monitor.test.mjs scripts/monitor-dispatch.test.mjs scripts/monitor-cadence.test.mjs
▶ cadence check uses completed production scans and fails closed through the HTTP boundary
  ✔ recent scan (41.950125ms)
  ✔ 45-minute boundary (43.727292ms)
  ✔ stale scan (39.174208ms)
  ✔ recovery uses successful scan from failed workflow (41.383625ms)
  ✔ current run cannot hide gap (40.461875ms)
  ✔ preview cannot hide gap (40.274708ms)
  ✔ newer failed scan does not hide older success (46.60175ms)
  ✔ later run order does not hide fresh rerun (43.594291ms)
  ✔ no prior runs (40.675875ms)
  ✔ no successful scan (39.94725ms)
  ✔ preview only (41.373666ms)
  ✔ missing timestamp (40.385583ms)
  ✔ invalid timestamp (40.625375ms)
  ✔ future timestamp (40.064875ms)
  ✔ wrong branch (40.621084ms)
  ✔ unfinished run (40.806042ms)
  ✔ invalid run id (40.367125ms)
  ✔ missing runs (41.957208ms)
  ✔ more than10 runs (40.35425ms)
  ✔ missing jobs (42.863292ms)
  ✔ incomplete job list (40.105625ms)
  ✔ missing steps (45.5365ms)
  ✔ malformed JSON (39.5405ms)
  ✔ HTTP failure (41.318667ms)
  ✔ network failure (32.255958ms)
  ✔ oversized response is canceled (41.733833ms)
  ✔ missing token sends no request (31.192458ms)
  ✔ invalid current run sends no request (30.186125ms)
  ✔ bounded10-run search (42.0545ms)
✔ cadence check uses completed production scans and fails closed through the HTTP boundary (1178.142125ms)
▶ scheduled entry point dispatches only the production monitor
  ✔ production (12.277041ms)
  ✔ preview (0.123583ms)
  ✔ missing environment (0.560542ms)
  ✔ public request (0.137125ms)
  ✔ wrong schedule (0.134959ms)
  ✔ wrong method (0.101125ms)
  ✔ missing credential (0.139042ms)
  ✔ denied dispatch (0.873417ms)
  ✔ redirect rejected (0.218625ms)
  ✔ unexpected success body (0.199333ms)
  ✔ network failure (0.168459ms)
✔ scheduled entry point dispatches only the production monitor (33.08575ms)
✔ schedule is private and fits the current Hobby interval (2.05175ms)
▶ runtime monitor fails closed and keeps log contents private through the HTTP boundary
  ✔ clean (43.183333ms)
  ✔ HTTP202 retains runtime errors with context (39.314959ms)
  ✔ HTTP5xx without runtime logs (40.8555ms)
  ✔ known pg warning (38.909875ms)
  ✔ fatal never suppressed (39.642167ms)
  ✔ other warning not suppressed (39.500916ms)
  ✔ malformed JSON (38.579333ms)
  ✔ API error body (39.66525ms)
  ✔ truncated message (41.54125ms)
  ✔ more pages (43.150875ms)
  ✔ missing pagination (40.92925ms)
  ✔ missing rows (40.441083ms)
  ✔ over100 rows (40.058709ms)
  ✔ oversized body is canceled (42.78925ms)
  ✔ missing error logs (41.13375ms)
  ✔ unused extra timestamp type (41.405291ms)
  ✔ stale row (40.619375ms)
  ✔ future row (41.705875ms)
  ✔ invalid timestamp (39.248125ms)
  ✔ wrong environment (39.366625ms)
  ✔ wrong project (39.178ms)
  ✔ unexpected log level (39.76675ms)
  ✔ wrong HTTP filter (40.018458ms)
  ✔ HTTP permission failure (40.426208ms)
  ✔ network failure (28.833625ms)
  ✔ missing token sends no request (26.490667ms)
  ✔ explicit preview (41.309833ms)
  ✔ wrong preview (38.425584ms)
  ✔ invalid target (28.208375ms)
✔ runtime monitor fails closed and keeps log contents private through the HTTP boundary (1140.9935ms)
ℹ tests 73
ℹ suites 0
ℹ pass 73
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1214.989167
$ node --test src/inference/*.test.ts src/learning/*.test.ts src/server/durable/*.test.ts scripts/durable-storage.test.mjs scripts/durable-engine.test.mjs scripts/durable-reconnect.test.mjs scripts/feedback-agent.test.mjs
✔ another instance reads live reasoning, rejects a competing turn, and ownership closes after settlement (261.688208ms)
✔ a follower opened before the conversation exists matches a fresh snapshot at every step of a turn (165.295459ms)
✔ cross-instance cancellation persists and does not abort the next admission (279.445125ms)
✔ an execution slice leaves accepted work pending, releases ownership, and a later request recovers it (237.532125ms)
✔ native retry monitoring: transient failure recovers (74.048333ms)
✔ native retry monitoring: exhausted retries settle once (178.609833ms)
✔ SIGKILL recovery logs once (273.554125ms)
✔ SIGKILL recovery logs once and still reports a later provider retry (379.454ms)
✔ a turn log line names route, hashed session, model, latency and status, never the conversation id (1.195291ms)
✔ a reply survives the server ending the events stream at its time cap mid-turn (2059.531916ms)
✔ a reply survives the network dropping the events connection mid-reply, as the UI coordinator sees it (1974.730792ms)
✔ an uninterrupted turn needs one events connection, and a connection after settlement returns at once (1974.442375ms)
✔ a Neon pooled URL uses only its matching direct endpoint for execution ownership (2.683791ms)
✔ Postgres storage connects on first use and retries after a failed start (29.183042ms)
✔ sqlite: reserves ID 1 for the immutable root conversation (5.001125ms)
✔ sqlite: receives a durable commit once before resolving, and never a refused one (2.692125ms)
✔ sqlite: commits mixed table writes atomically and rolls all of them back on failure (2.740292ms)
✔ sqlite: detaches retained writes and every returned record (2.639083ms)
✔ sqlite: detaches prototype-like JSON keys without changing object prototypes (2.0595ms)
✔ sqlite: indexes entries committed out of ID order (3.337167ms)
✔ sqlite: continues an entry cursor below its last item after a newer commit (2.939208ms)
✔ sqlite: paginates conversations by opaque cursor in ascending ID order (2.282708ms)
✔ sqlite: filters and pages conversations by durable owner edges (5.241792ms)
✔ sqlite: scans deep fork history newest-first through every ancestor cap (4.08325ms)
✔ sqlite: scans tables in either ID order and continues a cursor in its order (3.187167ms)
✔ sqlite: replaces complete task records and pages filtered task scans (2.753625ms)
✔ sqlite: stores owners and scans waiting and completing tasks by status (2.555625ms)
✔ sqlite: stores and scans sleeping tasks by status (3.121583ms)
✔ sqlite: indexes request IDs per conversation and replaces complete submission records (2.870375ms)
✔ sqlite: stores passive write submissions without input-only lifecycle states (3.076083ms)
✔ sqlite: stores continue submissions, which have no entry and are never queued (2.298334ms)
✔ sqlite: reconstructs rewindable documents and preserves half-open incarnations (3.335ms)
✔ sqlite: streams long document tails across root replacement deltas (11.609042ms)
✔ sqlite: copies stored document bases independently and rejects ambiguous sources (3.27675ms)
✔ sqlite: uses bases for version transitions and rejects historical reads of current-only documents (1.979292ms)
✔ sqlite: indexes logical addresses and exact-scope scans independently (2.347ms)
✔ sqlite: keeps document lifecycle failures atomic and gives create-plus-retire an empty lifetime (4.581333ms)
✔ sqlite: refuses a creation and a change of one document in one commit, in either order (2.717416ms)
✔ sqlite: rolls back record tables and secondary indexes when a document command fails (2.300333ms)
✔ sqlite: keeps indexed string identities lossless (2.603833ms)
✔ sqlite: keeps one global record ID namespace and rejects exhausted ID minting (2.604042ms)
✔ sqlite: commits batches in order, each with its seq, checked against the earlier ones (3.599459ms)
✔ sqlite: stores the batches before the first one refused, and none after it (2.030125ms)
✔ sqlite: refuses a later batch its own malformed actions fail, keeping the batches before it (2.071125ms)
✔ sqlite: resolves a batched copy against the state the earlier batches left (2.36425ms)
✔ sqlite: rejects every operation after close (1.688459ms)
✔ sqlite: another manager reads committed progress without taking execution ownership (2.68325ms)
✔ sqlite: a refreshed reader applies only later commits and refuses a gap (3.202041ms)
✔ sqlite: ownership is released on close and unused IDs remain reserved (2.076042ms)
✔ tutor sends one approved draft with the right account on its Modem connection (444.805042ms)
✔ every learner uses the current operator model and limits (0.956417ms)
✔ saved learner and retired model selections fall back to the current operator route (0.150334ms)
✔ each generation resolves the current operator settings (0.093667ms)
✔ operator status reports the route and missing hosted configuration refuses every turn (0.123875ms)
✔ card help reads back as assistance on the card it asked about (1.047208ms)
✔ an unmarked turn is corrected once when help was asked for or content looks supplied (0.384625ms)
✔ the teaching policy is the vendored socratic-tutor skill followed by Socratink bindings (0.597292ms)
✔ the tutor keeps tool names and bookkeeping out of learner text (0.066791ms)
✔ questions use current validation and presentation; reveals retain provenance without ending the turn (0.847667ms)
✔ the shared correction policy permits only one extra attempt (0.314292ms)
✔ a GET reads the private history snapshot without submitting work (11.595042ms)
✔ a send with no model provider is refused before admission, with a reason the browser can show (0.894041ms)
✔ an admitted send answers with only its submission id (0.437ms)
✔ a settled conversation sends one reset with every reply, then ends (9.66225ms)
✔ a pending reply streams from its start after the reset, then settles and ends (3.446875ms)
✔ a long pending turn gets heartbeats and ends at the time cap (64.341542ms)
✔ a failed poll errors the stream and still closes the follower (2.271625ms)
✔ a dropped client stops the snapshot loop (32.49125ms)
✔ the bridge serves events as an uncached event stream (2.097916ms)
✔ operator transport preserves keys, limits, live route headers and persisted response metadata (73.87175ms)
✔ reflected credentials are removed from live failures, route headers and reopened native records without changing retries (37.949667ms)
ℹ tests 71
ℹ suites 0
ℹ pass 71
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6197.319416
$ vite build && vite build --config vite.config.ui.ts
vite v8.2.1 building ssr environment for production...
[2Ktransforming...✓ 49 modules transformed.
rendering chunks...
computing gzip size...
dist/app.mjs                    0.09 kB │ gzip:  0.09 kB
dist/server.mjs                 0.65 kB │ gzip:  0.41 kB │ map:   1.04 kB
dist/chunks/app-M1Cv3Qc3.mjs  113.92 kB │ gzip: 32.35 kB │ map: 222.21 kB

✓ built in 19ms
vite v8.2.1 building client environment for production...
[2Ktransforming...✓ 60 modules transformed.
rendering chunks...
computing gzip size...
dist/client/404.html                             1.50 kB │ gzip:  0.73 kB
dist/client/login.html                           3.16 kB │ gzip:  1.48 kB
dist/client/assets/brand-wordmark-Df9HARvW.png   8.21 kB
dist/client/index.html                          10.42 kB │ gzip:  3.10 kB
dist/client/assets/paper-mono-C37UQ3VR.woff2    53.27 kB
dist/client/assets/notFound-CgNnqslE.css        10.41 kB │ gzip:  3.10 kB
dist/client/assets/login-BiFuefOY.css           12.23 kB │ gzip:  3.55 kB
dist/client/assets/main-BWs6QYTm.css            48.34 kB │ gzip:  9.62 kB
dist/client/assets/login-DSXAZxfo.js             0.60 kB │ gzip:  0.36 kB
dist/client/assets/session-CMUuC2Yn.js           2.63 kB │ gzip:  1.19 kB
dist/client/assets/main-De4GD2Ms.js             71.23 kB │ gzip: 22.99 kB

✓ built in 52ms
$ node --test scripts/static-routing.test.mjs
✔ hosted login alias reaches the static login document without a loop (0.575125ms)
✔ Vercel keeps API ownership and native filesystem/404 handling (0.075833ms)
✔ production build ships branded recovery and existing static entries (2.361084ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 40.909958

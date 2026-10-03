# Socratink

Socratink is a focused, model-backed learning conversation built with
[Flue](https://github.com/withastro/flue). The current interaction helps a
learner reason about agentic engineering through open dialogue and validated
in-card questionnaires.

This remains a narrow development product. It does not yet provide production
authentication, durable multi-instance hosting, or evidence for broad claims
about learning effectiveness.

## Run the current app

Requirements: Node.js 22.19+, pnpm 11, and an OpenAI-compatible model endpoint.

```sh
pnpm install
pnpm dev
```

The app reads these local environment settings without committing their values:

- `JON_LOCAL_BASE_URL` — the model endpoint; defaults to
  `http://127.0.0.1:3001/v1`
- `JON_LOCAL_API_KEY` — the endpoint's API key when required

Hosted Chat (`NODE_ENV=production`, `VERCEL=1`, or Northflank) uses AI Gateway
with the fixed model in `src/config/app.config.ts` and an 8,192-token output
limit. `AI_GATEWAY_API_KEY` is mandatory. Hosted routing ignores `JON_LOCAL_*`,
OIDC credentials, learner keys, and browser model selections: they cannot bypass
the operator key's budget. Local development retains its existing routing.

Hosted Node deployments require `DATABASE_URL` and `SESSION_SECRET`; the process
refuses to start without durable conversation storage or a session signing
secret. Local development uses file-backed SQLite at `.cache/flue/local.db` and
a local session secret when `SESSION_SECRET` is unset.

Opening the credential store requires `CREDENTIALS_SECRET` on hosted
environments and uses `socratink-local-credentials-secret` when that env is
unset locally. The store is keyed by session `userId` plus name. Local
Chat uses one exclusive learner route: an OpenRouter PKCE row drives
`openrouter/openai/gpt-5-nano`; otherwise an OpenAI paste row drives
`openai/gpt-5-nano`. Unsigned local Chat and smoke stay on operator
`jon-local`. Rows live in the product table `socratink_credentials`
(Postgres when `DATABASE_URL` is set;
otherwise `.cache/socratink/credentials.db`). That file is not Flue's
conversation database, and secrets are not stored in `flue_*` tables. Profiles
hold a `credentialRef`, never a raw key.

Chat requires a signed HttpOnly session cookie. Conversation ids are
`${userId}:${nonce}` so one session cannot resume another. Agent routes are
rate-limited by that user id. OpenRouter connect is PKCE that mints a user API
key; it is not Socratink identity and not a ChatGPT or Claude login.

## Invited beta controls

Hosted replies are **paused by default**. Before enabling them:

1. Create a dedicated AI Gateway API key with a **$10 total budget and no
   refresh**, used only by this beta. With the Vercel CLI:
   `vercel ai-gateway api-keys create --name socratink-beta --limit 10 --refresh-period none`.
   Store the returned key as `AI_GATEWAY_API_KEY`, never in source or chat.
2. Inspect the key's budget and usage in the gateway. Allow time for enforcement
   to activate and verify that no BYOK route bypasses the budget. Gateway budgets
   are [soft caps](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets):
   in-flight requests can exceed $10 and reporting is delayed. This is an accepted
   beta tradeoff, **not an app-enforced hard dollar limit**. The application does
   not provision or verify the remote budget configuration.
3. Configure an existing Google or GitHub OAuth integration and an explicit
   HTTPS `AUTH_REDIRECT_BASE_URL` for this deployment.
4. Set `SOCRATINK_BETA_INVITED_EMAILS` to exact comma-separated verified account
   emails, for example `learner@example.com`. Wildcards are rejected. Only
   registered invited accounts may start paid replies.
5. After verifying the above, set `SOCRATINK_BETA_PAUSED=0` and restart/redeploy.
   Set it back to `1` and restart/redeploy to pause new paid work. No reset or
   budget increase is automatic; either requires operator approval.

Ownership checks still protect history and cancellation while replies are
paused. Each model call also checks invited ownership, including queued work,
retries, tool-loop continuations, and restored guest conversations. Calls already
sent upstream cannot be recalled by changing configuration. The learner menu has
no provider settings, model picker, or key forms. Existing credentials do not
select the hosted model. Backend credential deletion remains available to the
owning signed session; hosted mode refuses new provider connections.

## Verify the app

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm smoke
pnpm audit --prod
```

The product source lives in `src/`. The default Vite build generates the
Node application in `dist/`, and the UI build writes its static assets to
`dist/client/`. The smoke test starts only local processes and uses a fake
OpenAI-compatible provider; it never requires external credentials.

`pnpm check` includes `pnpm test:browser`. To run just the browser regressions,
use `pnpm test:browser`; it rebuilds the UI first, launches isolated Chromium
contexts against a disposable local fixture, and checks cancellation, Retry,
history reload, sign-in prompts, and the desktop/mobile menu. The fixture uses
synthetic identities and model responses, blocks live network calls, and removes
its temporary storage on exit. CI installs Chromium with its system dependencies.
These tests do not verify live OAuth, Postgres, or gateway billing.

## Demonstrate the current interaction

Open a fresh conversation and type what you are working on into the composer;
there is no starter menu. Socratink asks the learner to explain or attempt the
problem before substantive correction, then uses a structured card when a
question has defined choices.

For an operator walkthrough:

1. Complete at least one conversational turn and one questionnaire turn.
2. Inspect the earlier-step trail, then reload to verify that the conversation
   is restored.
3. With synthetic inputs and Braintrust configured, inspect the request, model
   spans, `present_question` tool calls, timing, token use, and errors.

This demonstrates a persisted, observable interaction and its software
reliability boundaries. It does not establish agentic-engineering mastery,
durable learning, transfer, learning effectiveness, or production readiness.
Hosted Chat requires a signed session cookie, conversation ownership, invited
account access, and per-user rate limits. Keep the public domain off until live
sign-in, the dedicated gateway budget, browser recovery, and hosted persistence
are verified for the invited learners.

## Northflank staging

The root `Dockerfile` packages the built Flue Node server as a non-root
container listening on port `3000`. Configure one service replica with:

- private HTTP port `3000`, reached for staging verification through a
  Northflank CLI port-forward;
- readiness check `GET /healthz`;
- a private PostgreSQL addon;
- `DATABASE_URL` mapped from the addon's `POSTGRES_URI` secret;
- `SESSION_SECRET` stored as a Northflank runtime secret;
- `CREDENTIALS_SECRET` stored as a Northflank runtime secret;
- `AI_GATEWAY_API_KEY` stored as a Northflank runtime secret.

Use Northflank's `recreate` rollout strategy. Do not use rolling or canary
rollouts, autoscaling, or more than one replica: Flue currently requires one
live owner for a conversation, including during replacement.

Keep the PostgreSQL addon private. The current Northflank deployment is a
private staging target. Do not expose its port or attach the production domain
until the invited beta controls and real hosted learner journey above are
configured and verified. Passing local checks alone does not establish that
this deployment is ready for learners.

## Braintrust observability

Braintrust tracing is optional. Save the key once in the Git-ignored
`.env.braintrust` file:

```dotenv
BRAINTRUST_API_KEY=your-api-key
```

After that, `pnpm dev` automatically traces normal Socratink chat runs to the
`socratink` project. Open that project in Braintrust to inspect the request,
nested model calls, output, timing, token usage, and errors. Without an exported
key or a `.env.braintrust` file, Socratink runs normally and sends no traces.

Treat traces as development logs: they may contain prompts and responses. Use
synthetic inputs until access, retention, and masking are configured for real
learner data.

`pnpm test:braintrust` verifies the opt-in configuration locally without making
a network call. `pnpm smoke:braintrust-live` verifies live delivery and requires
an explicit API key. Traces go to the same `socratink` project as Chat.

## Foundation and attribution

Socratink was extracted from [Flue](https://github.com/withastro/flue) v2.0.3
at source commit
[`bf86b872`](https://github.com/withastro/flue/commit/bf86b872). The standalone
product consumes the published `@flue/*` packages and keeps those names, this
provenance statement, and the original [Apache License 2.0](LICENSE) so its
upstream lineage remains explicit.

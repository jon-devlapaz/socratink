# Socratink

Socratink is a single-learner AI conversation built with
[Flue](https://github.com/withastro/flue). It supports open dialogue, structured
question cards, and records of assistance. See [PRODUCT.md](PRODUCT.md) for
the current boundary and the Brain's
[North Star](socratink-brain/NORTH-STAR.md) for the intended direction
([source fallback](https://github.com/jon-devlapaz/socratink-brain/blob/master/NORTH-STAR.md)).

## Run locally

Use the Node.js and pnpm versions specified in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev:phone` exposes the development server to the local network and prints
its URL. The operator model defaults to an OpenAI-compatible endpoint at
`http://127.0.0.1:3001/v1`. Configure `JON_LOCAL_BASE_URL`, `JON_LOCAL_API_KEY`,
and optionally `JON_LOCAL_MODEL_ID` for your endpoint. Do not commit values.

Local conversation, authentication, and credential databases use separate
SQLite files under `.cache/`. Configuration owners are `src/config/database.ts`,
`auth.ts`, `session.ts`, `credentials.ts`, and `operator-model.ts`.

## Identity, models, and hosted configuration

The app creates a signed guest session. Its three-turn guest allowance leads
to sign-in when OAuth providers are configured. Google and GitHub sign-in use
the matching `*_CLIENT_ID` and `*_CLIENT_SECRET` settings plus
`AUTH_REDIRECT_BASE_URL`; see [the authentication flow](src/ui/auth/README.md)
for account linking and the limits of the guest allowance.

Conversations are scoped to the session user and permitted aliases. Learner
API keys are encrypted in the product credential store. The active model route
depends on the connected credentials and selected model; otherwise it uses
the operator provider. Model choices and routing are owned by
`src/config/chat-model.ts` and `src/server/learner-key.ts`; operator environment
settings are resolved separately in `src/config/operator-model.ts`.

Production, Vercel, and Northflank deployments require `DATABASE_URL`,
`SESSION_SECRET`, and `CREDENTIALS_SECRET`. On Vercel/Northflank, a public HTTPS
`JON_LOCAL_BASE_URL` with `JON_LOCAL_API_KEY` selects the operator endpoint;
otherwise the app selects AI Gateway. Gateway credentials come from
`AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`; Northflank rejects a missing
gateway credential. Inspect the configuration owners for exact resolution.

The `Dockerfile` serves the built Node app on port `3000`, with `/healthz` for
readiness. Retain the existing single-replica, recreate-deployment constraint
until Flue's conversation ownership is verified for a different topology.
Use private database connectivity. Local checks do not validate deployed
identity settings, external providers, multi-instance hosting, or suitability
for a particular learner population.

## Verify

```sh
pnpm check
pnpm smoke
pnpm audit:trellis
pnpm audit --prod
```

`pnpm check` runs the current type, contract, build, and static-routing checks.
`pnpm smoke` starts local processes with a deterministic fake model provider;
it requires no external credentials. The complete command list is in
`package.json`. Builds write generated output to `dist/` and `dist/client/`.

Set `REVEAL_BROWSER=1` when running `pnpm smoke` to include browser interaction
checks. They use installed Chrome and `playwright-core`; `CHROME_PATH` and
`PLAYWRIGHT_MODULE` can point to existing installations. Screenshots and results
are saved under `.cache/reveal/`.

To verify PostgreSQL restart and rollback, build the candidate and previous
revision in separate directories, then run:

```sh
pnpm smoke:postgres --candidate <candidate-root> --baseline <previous-root> --out .cache/postgres-proof
```

This needs a running Docker daemon and a locally available `postgres:17-alpine`
image. It creates and removes its own database container, uses synthetic OAuth
and model responses, and saves a report proving session, key, and conversation
recovery. The previous build runs against a disposable copy of that test data.

For an interaction check, start a conversation, complete an open-ended turn
and a question card, inspect the earlier-step trail, and reload to check
restoration. Check assistance markings when the tutor supplies target content.
These checks establish only the covered software behavior, not retention,
transfer, mastery, or learning effectiveness.

## Foundation and attribution

Socratink was extracted from [Flue](https://github.com/withastro/flue) v2.0.3 at
source commit [`bf86b872`](https://github.com/withastro/flue/commit/bf86b872).
The product consumes published `@flue/*` packages and preserves their names,
this provenance statement, and the original [Apache License 2.0](LICENSE).

## Runtime failure alerts

The `Socratink runtime monitor` workflow checks production availability and
queries Vercel runtime errors and HTTP 5xx responses approximately every 10 minutes
after the workflow reaches `main`. Failed or
incomplete reads fail the job and use GitHub Actions failure notifications.
The monitor uses Vercel's project log API and rejects responses with more
pages or truncated messages.
Enable email notifications for failed Actions runs in your GitHub settings.
The application logs constant failure categories for failed chat submissions
and recovery failures, including failures after an HTTP 202 admission. The
monitor publishes counts only; it never copies Vercel error bodies, request
paths, learner text, or credentials into public Actions logs. Existing Flue
runtime logs may contain raw provider errors in Vercel.

Configure `VERCEL_TOKEN` as an environment secret in `runtime-monitor`, which
is restricted to `main`. Use a token scoped to the Socratink Vercel project;
Vercel project-scoped tokens are not read-only. For a controlled preview drill,
use the separately reviewed `runtime-monitor-verification` environment and the
workflow's `preview_deployment` input. Never place this credential in source,
repository-wide secrets, or pull-request CI.

Before merging, prove a real isolated-preview failure causes this workflow to
fail and the matching notification reaches the operator. A local script test
or a failed job without received notification is insufficient proof.

GitHub schedules activate only on the default branch and can be delayed or
dropped; public-repository schedules stop after 60 days without activity. The
45-minute query window deliberately overlaps runs; the same failure can alert
more than once. Vercel Hobby retains runtime logs for one hour, so a long
scheduler outage can lose evidence. The log API does not report gaps within
returned history. This is a basic failure monitor, not an on-call guarantee or
a check of model quality. It makes no model calls.

# Socratink

Socratink is a single-learner AI conversation that runs on
[Pi Durable](https://github.com/earendil-works/pi/tree/main/packages/durable).
It supports open dialogue, structured
question cards, and records of assistance. See [PRODUCT.md](PRODUCT.md) for
the current boundary and the Brain's
[North Star](socratink-brain/NORTH-STAR.md) for the intended direction
([source fallback](https://github.com/jon-devlapaz/socratink-brain/blob/master/NORTH-STAR.md)).

See [the Pi migration notes](docs/pi-durable-preview.md) for continuity, verification,
and operational limits. Merges to `main` automatically deploy to production.

## Run locally

Use the Node.js and pnpm versions specified in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev:phone` exposes the development server to the local network. The operator model defaults to an OpenAI-compatible endpoint at
`http://127.0.0.1:3001/v1`. Configure `JON_LOCAL_BASE_URL`, `JON_LOCAL_API_KEY`,
and optionally `JON_LOCAL_MODEL_ID` for your endpoint. Do not commit values.

Local conversation, authentication, and credential databases use separate
SQLite files under `.cache/`. Configuration owners are `src/config/database.ts`,
`auth.ts`, `session.ts`, `credentials.ts`, and `src/inference/operator.ts`.

## Identity, models, and hosted configuration

The app creates a signed guest session. Its three-turn guest allowance leads
to sign-in when OAuth providers are configured. Google and GitHub sign-in use
the matching `*_CLIENT_ID` and `*_CLIENT_SECRET` settings plus
`AUTH_REDIRECT_BASE_URL`; see [the authentication flow](src/ui/auth/README.md)
for account linking and the limits of the guest allowance.

Conversations are scoped to the session user and permitted aliases. Learner
API keys are encrypted in the product credential store. The active model route
depends on the connected credentials and selected model; otherwise it uses
the operator provider. Model routing is owned by `src/inference/`: the learner's
own key first, then the operator. A route the learner chose never falls back to
the operator's key. Model choices are listed in `src/config/chat-model.ts`.

Production, Vercel, and Northflank deployments require `DATABASE_URL`,
`SESSION_SECRET`, and `CREDENTIALS_SECRET`. On Vercel/Northflank, a public HTTPS
`JON_LOCAL_BASE_URL` with `JON_LOCAL_API_KEY` selects the operator endpoint;
otherwise the app selects AI Gateway. Gateway credentials come from
`AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`. With none of these, inference is
unconfigured: `/healthz` returns 503 and a send is refused with
`inference_unconfigured` unless the learner has connected their own key.

The `Dockerfile` serves the built Node app on port `3000`, with `/healthz` for
readiness and the operator's inference route (`gateway` or `local`). Retain the
single-replica, recreate-deployment constraint until multi-instance hosting is
verified.
Use private database connectivity. Local checks do not validate deployed
identity settings, external providers, multi-instance hosting, or suitability
for a particular learner population.

## Verify

```sh
pnpm check
pnpm smoke
pnpm smoke:durable
pnpm test:durable:postgres
pnpm smoke:durable:postgres
pnpm audit:trellis
pnpm audit --prod
```

`pnpm check` runs the current type, contract, build, and static-routing checks.
`pnpm smoke` starts local processes with a deterministic fake model provider;
it requires no external credentials. The complete command list is in
`package.json`. Builds write generated output to `dist/` and `dist/client/`.

Set `REVEAL_BROWSER=1` when running `pnpm smoke` to include browser interaction
checks. They use the `playwright` dev dependency; `CHROME_PATH` and
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

## Runtime failure alerts

The `Socratink runtime monitor` workflow checks production availability and
queries Vercel runtime errors and HTTP 5xx responses each time it runs. Failed or
incomplete reads fail the job and use GitHub Actions failure notifications.
The monitor uses Vercel's project log API and rejects responses with more
pages or truncated messages.
Enable email notifications for failed Actions runs in your GitHub settings.
The application logs constant failure categories for failed chat submissions
and recovery failures, including failures after an HTTP 202 admission. The
monitor publishes counts only; it never copies Vercel error bodies, request
paths, learner text, or credentials into public Actions logs.

Pi emits the same constant failure and recovery categories, including actual
model retries and recovery of interrupted turns. It never logs provider error
bodies. Request failures also produce a constant category and generic response.

Configure `VERCEL_TOKEN` as an environment secret in `runtime-monitor`, which
is restricted to `main`. Use a token scoped to the Socratink Vercel project;
Vercel project-scoped tokens are not read-only. For a controlled preview drill,
use the separately reviewed `runtime-monitor-verification` environment and the
workflow's `preview_deployment` input. Never place this credential in source,
repository-wide secrets, or pull-request CI.

GitHub's own schedule is a fallback, not the clock. From 2026-11-09 to
2026-11-12 it started this workflow about three times a day, so most
45-minute windows went unread. An outside scheduler should start the workflow
every 10 minutes instead:

```
POST https://api.github.com/repos/jon-devlapaz/socratink/actions/workflows/runtime-monitor.yml/dispatches
Authorization: Bearer <token>
Accept: application/vnd.github+json

{"ref":"main"}
```

GitHub answers 204. Use a fine-grained token limited to this repository with
only `Actions: read and write`, and store it only in the scheduler. That token
can start and cancel this repository's workflows; it cannot read code or
secrets. Any scheduler that sends a POST with headers works.

GitHub schedules activate only on the default branch and can be delayed or
dropped; public-repository schedules stop after 60 days without activity. The
45-minute query window deliberately overlaps runs; the same failure can alert
more than once. Vercel Hobby retains runtime logs for one hour, so a long
scheduler outage can lose evidence. The log API does not report gaps within
returned history. This is a basic failure monitor, not an on-call guarantee or
a check of model quality. It makes no model calls.

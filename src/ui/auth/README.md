# Login & OAuth

## Flow

1. Visit `/` without a valid session cookie → client auto-mints a guest session
   via `POST /api/session` and starts chatting immediately (guest-first)
2. Guest users get 3 free conversational turns tracked via a signed
   `socratink-guest-turns` cookie
3. After turn 3, the chat composer locks and an inline auth gate card appears
   with sign-in buttons for the configured providers (`/api/auth/providers`);
   with no provider configured the generic failed-request turn shows instead
4. Clicking a sign-in button navigates to `/api/auth/:provider/login`, which
   initiates PKCE OAuth with the provider
5. On successful callback, the server resolves the account (new signup or
   returning user), sets the session cookie, and redirects to `/`
6. `/login.html` remains for explicit sign-in (email form is still a demo stub)
7. Menu **Sign out** goes to `/api/session/logout`, which clears the cookie

## Session Re-keying

- **New signup**: guest UUID becomes the durable `users.id`. Zero re-keying.
- **Returning user**: session cookie updates to the durable UUID. A
  `user_aliases` row maps the guest UUID so existing conversations remain
  accessible, `GET /api/session` reports the aliases so the client keeps the
  stored conversation id, and guest BYOK keys move to the durable UUID
  (names the durable user already owns keep the durable value).

Chat conversation ids are `${userId}:${nonce}`. The chat-access middleware
checks aliases for returning users. Foreign ids return 403.

## Accepted limits

- The 3-turn counter is a signed client cookie, so clearing cookies restarts
  the guest allowance. The gate is a conversion nudge, not abuse control.
- The gate increments before downstream checks, so a turn that fails
  admission still consumes guest allowance.

## Files

- `../login.html`, `../login.ts`, `../login.css` — explicit login page
- `../session.ts` — browser session helpers
- `../chat-gate.ts`, `../chat-gate.css` — inline auth gate card
- `../brand-wordmark.png` — shared product wordmark
- `../../server/oauth.ts` — in-tree OAuth module (PKCE, Google, GitHub)
- `../../server/auth-db.ts` — user, account, and alias storage
- `../../server/guest-turns.ts` — turn cap middleware
- `../../config/auth.ts` — OAuth environment configuration

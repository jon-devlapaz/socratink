# Login

Vanilla `/login.html` mints a signed HttpOnly session cookie. Email still shows a
fake “link sent” panel; Google / GitHub still skip provider OAuth. Neither is
identity verification. The cookie is the session.

## Flow

1. Visit `/` without a valid session cookie → client fetch of `/api/session`
   fails and the page redirects to `/login.html`
2. Email continues to a fake “link sent” panel, then **Continue** `POST`s
   `/api/session`
3. Google / GitHub buttons also `POST /api/session` and enter Chat
4. Menu **Sign out** goes to `/api/session/logout`, which clears the cookie

Chat conversation ids are `${userId}:${nonce}`. Foreign ids return 403.

## Files

- `../login.html`, `../login.ts`, `../login.css` — page
- `../session.ts` — browser session helpers
- `../brand-wordmark.png` — shared product wordmark

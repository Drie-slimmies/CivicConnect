# ADR-06: Signed-Cookie Sessions with jose (Authentication Session Mechanism)

- Status: Approved (M3, authentication branch)

- Date: October 2026

- Context: CR-009 added requester self-registration, so the system needs a way to remember who is signed in between requests. The application tier is stateless and serverless (ADR-05, Deployment Direction), the free-tier database has a scale-to-zero cold start (R-07), and M3 has a fixed deadline and a three-person team (R-02). Sessions must carry a role that cannot be forged, because requesters, staff and managers see different data (NFR-004).

- Alternatives considered:

  - Server-side sessions stored in a database table: a session can be revoked at any time, but it needs a new table, a migration and a database read and write on every request, which adds load to a database that may be cold.

  - An authentication library such as Auth.js: less hand-written security code, but a larger dependency and configuration surface, and the team would still have to learn and wire its adapters and callbacks within the M3 schedule.

  - A signed token in an HTTP-only cookie, created and checked with the `jose` library (chosen).

- Decision: Passwords are hashed with scrypt from Node's crypto module (random 16-byte salt, 64-byte key) in `lib/auth/password.ts`. After sign-up or sign-in the server sets one cookie, `civicconnect_session` (HTTP-only, SameSite=Lax, Secure in production, 8 hours), containing a token signed with HS256 using `SESSION_SECRET` (`lib/auth/session.ts`). The token holds the user id and role, but the role is only a hint: `lib/auth/guard.ts` loads the user from the database on each request and uses the stored role. Sign-up always creates the requester role on the server and ignores any role sent by the client.

- Consequences:

  - Pros - No session table and no extra database call to check a token's signature, which suits the stateless serverless direction. Only standard primitives are used (scrypt, HMAC signature), all in one small module that is easy to review and to unit test. Reading the role from the database means a role change or a deleted account takes effect on the next request.

  - Cons - One session cannot be revoked: a stolen cookie works until it expires (8 hours) or `SESSION_SECRET` is rotated, which signs everyone out (this is the contingency in R-13). Hand-written sign-up and sign-in can contain mistakes an established library would avoid (R-13), so it is covered by 25 automated tests and a pull request review against NFR-004. There is no rate limiting or lockout yet, and no password reset or email verification (technical debt register TD-01 to TD-03).

- Revisit when: the system holds real citizen data, per-session revocation or rate limiting becomes necessary, or a flaw is found in the hand-written code. The fallback is to switch to an established authentication library or database-backed sessions.

- Links: R-13 in the Risk Register, CR-009, NFR-004, FR-001, ED-07 in the Decision Log.

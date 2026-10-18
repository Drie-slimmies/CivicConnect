# Deployment Direction and Compatibility

Current direction: the Next.js application deploys to a serverless
hosting platform (the kind Next.js's own App Router/Route Handlers are
built for - e.g. Vercel or an equivalent Node-serverless target), with
Neon PostgreSQL as a separate managed service reached over the network.
No specific hosting provider has been contractually committed to yet;
this is recorded as a deliberately deferred decision below rather than
implemented prematurely.

- Plausibility: the chosen stack is built for this direction - Next.js
  Route Handlers run natively as serverless functions, and Neon's
  WebSocket Pool driver exists specifically to let a serverless function
  hold the kind of interactive connection FR-006/FR-008 need.

- Configuration/secrets: the Neon connection string (DATABASE_URL) and
  the session signing secret (SESSION_SECRET, at least 32 characters)
  are read from environment variables, not committed to the repo;
  .env.example lists the names with placeholders only. The seed
  passwords (SEED_STAFF_PASSWORD, SEED_MANAGER_PASSWORD,
  SEED_REQUESTER_PASSWORD) are needed only when the seed script is run.
  Each environment (development, staging, production) must have its own
  SESSION_SECRET; changing it signs every user out, which is also the
  contingency in R-13. The session cookie is marked Secure when
  NODE_ENV is production, so staging and production must be served over
  HTTPS. A serverless host's own secret-manager/env-var store is the
  intended production equivalent.

- Persistence/state implications: the application tier itself is
  stateless (each request/function invocation is independent); all
  durable state lives in Neon. Sign-in sessions are signed cookies, not
  server-side sessions (ADR-06), so no session store has to be shared
  between serverless instances. This is what makes the serverless
  deployment direction viable in the first place.

- Networking implications: outbound-only from the app tier to Neon over
  the WebSocket Pool driver; the database is not directly reachable from
  the public internet. No inbound network configuration is required on
  the database side beyond Neon's own connection allow-list.

- Material risks: Neon free-tier scale-to-zero can introduce a
  cold-start latency spike on the first request after idle, which risks
  NFR-001 (\<2s) - already logged as risk R-07; the 100 CU-hour/month
  free-tier cap (R-08) needs monitoring as usage grows.

- Deliberately deferred: the specific hosting provider/account, a
  production CI/CD deploy pipeline, and a custom domain/TLS setup are
  all deferred past M2 - none of them are needed to demonstrate the
  architecture, and committing to one now would be over-implementing
  ahead of the evidence the team will have by M3.

## M4 deployment decision (18 October 2026)

**Simulated production, with an evidence-based no-go for real citizen
data.** The application code stays frozen at `m3-rc1`. For the final
submission the team runs the production build (`next build && next
start`) with its own configuration, against a separate Neon test
branch and its own `SESSION_SECRET`, rather than development mode or
a cloud deploy. This matches the setup already described above and
reuses the hosting direction decided at M2; it is not a new
architecture decision.

This is a deliberate choice not to deploy to a public cloud host or
to hold real personal data, for reasons already recorded in this
repository rather than "ran out of time":

| Blocker | Why it blocks real use | Must be fixed before go-live | Tracked as |
|---|---|---|---|
| No login rate limiting or lockout | A password can be guessed without being slowed down | Add a per-email and per-address attempt limit | TD-01 |
| No revocation of a single session | A stolen signed cookie works for up to 8 hours | Move to database-backed sessions or a token version per user | TD-02 |
| NFR-004 (POPIA) review not done | Access control and the public-page whitelist are tested; field-level encryption and a privacy review are not | Complete the NFR-004 review; add field encryption if the review requires it | R-05, R-11 |
| NFR-001 miss on the all-requests list | p95 2067 ms against the 2000 ms target at 20 concurrent users | Apply the already-tested query fix (narrow the list to the six displayed fields) and re-run P1 | DF-08, TD-16, R-07 |

**Residual risk for the simulated-production run itself:** R-07
(cold start) and R-08 (free-tier compute cap) still apply to the Neon
test branch used for the demo; the branch is warmed before the live
presentation.

This decision is recorded in [Change Control](../change/change-control.md)
(CR-016) and carried into PED v4.0's release and deployment section.


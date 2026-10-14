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


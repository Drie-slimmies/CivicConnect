# ADR-04: Technology Stack Selection (Next.js, Neon PostgreSQL, Drizzle ORM)

- Status: Approved

- Date: September 2026

- Context: ED-02 (M1) deferred the technology-stack selection to M2,
  pending evidence on hosting options (FEC-01) and given the fixed
  free/low-cost budget constraint. The stack also has to support an
  atomic multi-step database operation for FR-006/FR-008 (status
  update + audit insert + optimistic-concurrency check).

- Decision: Monomorphic JavaScript/TypeScript stack. Next.js 16 (App
  Router, Route Handlers) for both frontend and API; PostgreSQL hosted
  on Neon (serverless, free tier, scale-to-zero); Drizzle ORM using the
  neon-serverless WebSocket Pool driver, not the HTTP driver,
  specifically because the HTTP driver cannot run the interactive
  transaction FR-006/FR-008 require.

- Consequences:

  - Pros - One language across the whole stack reduces context-switching
    for a 3-person team; Neon's free tier satisfies the Cost/Resources
    constraint; Drizzle gives SQL-level control with a smaller
    serverless footprint than Prisma.

  - Cons - Neon's scale-to-zero after 5 minutes idle risks a cold-start
    latency spike against NFR-001 (\<2s); the 100 CU-hour/month
    free-tier cap needs monitoring; the WebSocket driver needs careful
    connection handling inside serverless functions.


## Technology Alternatives and Evidence

ADR-04 names the chosen stack; the comparison below is the evidence
behind it, weighed against the ASRs and constraints above rather than
familiarity alone.

| **Concern**                | **Chosen**                                      | **Alternative(s) considered**                     | **Why chosen wins for CivicConnect**                                                                                                                                                                                                                            |
|----------------------------|-------------------------------------------------|---------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Frontend/backend framework | Next.js 16 (App Router)                         | Separate React SPA + Express API; SvelteKit       | One language/framework across the stack for a 3-person team (Cost/Resources, Schedule constraints); built-in Route Handlers avoid standing up and deploying a second API service.                                                                               |
| Database                   | Neon serverless PostgreSQL (free tier)          | Supabase Postgres; self-managed Postgres on a VPS | Scale-to-zero fits a \$0 student-project budget better than Supabase's always-on free-tier compute limits; avoids the operational/security burden of self-managing a database server (no team member has done this before).                                     |
| ORM / DB access            | Drizzle ORM + drizzle-kit                       | Prisma ORM                                        | Prisma's query engine binary adds cold-start weight that works against NFR-001 in a serverless function; Drizzle is a thinner, SQL-level layer with a smaller serverless footprint, at the cost of a less polished DX than Prisma's.                            |
| DB driver                  | @neondatabase/serverless, WebSocket Pool driver | @neondatabase/serverless HTTP driver              | The HTTP driver cannot run the interactive, multi-statement transaction FR-006/FR-008 require (status update + audit insert + concurrency check as one unit); the Pool driver can, at the cost of more careful connection handling inside serverless functions. |

Versions/dependencies of record: Next.js ^16.3.7, React/React-DOM
^19.2.8, TypeScript ^5, Drizzle ORM ^0.45.3, drizzle-kit ^0.31.11,
@neondatabase/serverless ^1.1.0 (from the M2 skeleton's package.json).
Security/licensing note: all four are OSS (MIT-family licenses) with no
known CVEs blocking use at the time of writing; this should be
re-checked before final submission rather than treated as a one-time
check.


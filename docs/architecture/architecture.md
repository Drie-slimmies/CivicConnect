# System Architecture and Design

## High level architecture overview

Logical layers: Presentation (Next.js Client/Server Components) -\>
Application (Next.js Route Handlers / Server Actions) -\> Domain (State
pattern for the request lifecycle, Decorator pattern for audit logging,
in-process domain events for module decoupling) -\> Data access (Drizzle
ORM) -\> Persistence (Neon serverless PostgreSQL).

Physical deployment: Browser -\> Next.js application on a serverless
hosting platform -\> Neon PostgreSQL, reached over the Neon WebSocket
Pool driver so that FR-006/FR-008 can run as one atomic, interactive
transaction (status update + audit insert + optimistic-concurrency check
on a version column).

Architectural style: a modular monolith. CivicConnect is built as one deployable Next.js application, organised into logical layers and domain modules that communicate through in-process domain events, with a single PostgreSQL database. Serverless hosting is the deployment target for that one deployable and is not a decision to build separate services. The alternatives (SOA/microservices, an event-driven design with a broker, and function-per-feature serverless), the trade-offs and the conditions for reconsidering are recorded in [ADR-05](../decisions/0008-architectural-style-modular-monolith.md).

| Concern            | Technology                                                                           | Why (traces to)                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend + backend | Next.js 16 (App Router, Route Handlers), TypeScript, React 19                        | Single-language stack for a 3-person team; NFR-003 mobile-first, NFR-001 performance                                                                          |
| Database           | Neon serverless PostgreSQL (free tier)                                               | Cost/Resources constraint; scale-to-zero fits a student-project budget                                                                                        |
| ORM / DB access    | Drizzle ORM + drizzle-kit, @neondatabase/serverless WebSocket Pool driver            | SQL-level control, small serverless footprint; Pool driver required for the atomic FR-006/FR-008 transaction (HTTP driver cannot do interactive transactions) |
| Module decoupling  | In-process domain events (adapted from A2's Mediator/MediatR research to TypeScript) | ADR-03; avoids tight coupling between IssueManagement and RoutingAndAssignment without an external broker                                                     |

## Architecture Diagram

![CivicConnect architecture overview: logical layers and physical deployment tiers](architecture-diagram.png)

_Figure 1: CivicConnect logical layers (left) versus physical deployment
tiers (right). The two are kept distinct per the
proportional-architecture guidance: the logical view shows where the
State (ADR-01), Decorator (ADR-02) and Mediator/domain-event (ADR-03)
patterns sit in the domain layer, and the deployment view shows there
are only two physical tiers (serverless app, managed database) rather
than a distributed set of services, which the team's size and the ASRs
above do not justify.The architectural style this view illustrates is decided in ADR-05._

## Initial API / Integration Decision

The one module-to-module interaction that has reached a meaningful
design point so far is IssueManagementService notifying
RoutingAndAssignmentService when a new service request is logged, so
this is recorded now rather than left as an unstated assumption; other
integrations (e.g. any future external/public API) are not yet
established and are left as a forward engineering consideration (FEC)
instead of being invented here.

- Responsibilities and information exchanged: IssueManagementService
  raises an IssueCreatedEvent carrying the issue ID and category;
  RoutingAndAssignmentService owns the handler that consumes it and
  routes the request to the department for that category by setting the
  request's department from a fixed category-to-department map. The
  staff queue shows it as a label; staff still see all requests. The
  handler does not assign a staff member: the request stays Submitted
  until staff assign it (FR-005). Amended by CR-006 and CR-007.

- Mechanism: in-process Mediator / domain events (ADR-03), not a network
  API. A2 compared this against an asynchronous message broker and a
  synchronous REST call; both were rejected for M2 because a network
  boundary between two modules inside the same monolith is not justified
  by CivicConnect's current scale, and would add operational complexity
  (a broker to run, or a second HTTP contract to version) with no
  corresponding benefit yet.

- Validation / error behaviour: the handler currently runs synchronously
  in-process; a handler failure must roll back with the triggering
  database write rather than leaving an issue logged with no assignment
  attempted (see ADR-03 consequences on transactional handling).

- Security boundary: none required yet - the interaction never leaves
  the server process, so there is no network-facing surface to
  authenticate or authorise separately from the request that triggered
  it.

- Change/version implications: since this is in-process, there is no
  wire contract to version; if a future milestone moves
  RoutingAndAssignmentService out-of-process, this decision would need
  to be revisited and is noted as a forward engineering consideration
  rather than acted on now.

## Authentication and Session Design

Added on 13 October 2026 (authentication branch). Decision: [ADR-06](../decisions/0009-signed-cookie-sessions-with-jose.md). Scope: [CR-009](../change/change-control.md). Risk: R-13.

- Where it lives: everything about identity is in `civic-connect/lib/auth/` so a flaw can be reviewed in one place. `password.ts` hashes and verifies passwords (scrypt from Node's crypto module). `session.ts` creates and checks the signed session token and reads and writes the cookie. `guard.ts` turns the cookie into the current user and checks roles. `client.ts` is the browser helper the sign-in and sign-up forms use.

- Routes: `POST /api/auth/register` (always creates a requester), `POST /api/auth/login`, `POST /api/auth/logout`. Staff and manager accounts are created by the seed script only.

- Session: after a successful sign-up or sign-in the server sets one cookie (`civicconnect_session`): HTTP-only, SameSite=Lax, Secure in production, valid for 8 hours. It holds a token signed with `SESSION_SECRET` (HS256, via the `jose` library) that carries the user id and role.

- Authorisation: every protected route handler calls `requireRole(...)` first. The guard verifies the token, then loads the user from the database and uses the role stored there, not the role inside the token. It answers 401 when nobody is signed in and 403 when the role is not allowed. The screens (`SessionProvider`, `RoleGate`, header) only decide what to show; the API is what enforces access.

- Security boundary: unlike the in-process event above, this is a network-facing boundary. The same response is returned for an unknown email and a wrong password, and the password hash is never returned by any route.

- Known limits: no login rate limiting and no way to revoke a single session (technical debt register TD-01 and TD-02).

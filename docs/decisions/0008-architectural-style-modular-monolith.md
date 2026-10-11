# ADR-005: Architectural Style - Modular Monolith

- **Status:** Approved
- **Date:** October 2026

## Context

ADR-01 to ADR-04 chose patterns and a stack, but the architectural style itself was only described, not decided.

The drivers are the architecturally significant requirements (ASRs) listed above:

- **NFR-001:** response time under 2 seconds
- **NFR-002:** more than 99% uptime during operating hours
- **NFR-004:** POPIA access control
- **FR-006 / FR-008:** a status change and its audit record must commit as one atomic transaction

The constraints are a 3-person team, four fixed milestones (Schedule), and a free or low-cost budget (Cost/Resources).

**Evidence from A2:** The comparison of in-process Mediator, asynchronous broker, and synchronous REST, for the one module pair that interacts so far (IssueManagement -> RoutingAndAssignment), found no benefit from a network boundary at this scale (see Initial API / Integration Decision). No independent-scaling need has been evidenced, and real usage numbers are still unknown (FEC-04).

## Concern

Distribution should be earned by evidence, not by architecture fashion. Every service boundary:

- adds latency (against NFR-001),
- adds another pipeline and monitoring burden for three people,
- turns the FR-006 / FR-008 transaction into a distributed one.

## Alternatives Considered

Architecture style, deployment, and infrastructure are judged separately. The style is the modular monolith, the deployment target is a single serverless deployable, and the infrastructure is a managed Neon PostgreSQL (ADR-04).

| Option                                                                            | What it would give us                                                                                                                                                | What it would cost us                                                                                                                                                                                            | Verdict                                                                                                                           |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Modular monolith** (layered, in-process modules, one deployable, one database)  | Single ACID transaction for FR-006 / FR-008. One pipeline and deploy for a 3-person team. No inter-module network latency (NFR-001). Module boundaries kept in code. | No independent scaling or deployment. Boundaries depend on discipline. One database is a single point of failure.                                                                                                | **Chosen**                                                                                                                        |
| **SOA / microservices** (separate Issue, Routing, and Audit services)             | Independent scaling and deployment. Fault isolation. Team autonomy.                                                                                                  | FR-006 / FR-008 become a distributed transaction or saga. Network hops threaten NFR-001. Several pipelines, monitors, and attack surfaces (NFR-004) beyond what 3 people can run. No scaling need evidenced yet. | Rejected: benefits not evidenced                                                                                                  |
| **Event-driven with an external broker**                                          | Asynchronous decoupling, retries, and buffering for assignment and notifications.                                                                                    | A broker to run and pay for (Cost/Resources). Eventual consistency against FR-006 / FR-008. Harder debugging.                                                                                                    | Rejected for M2. A2 rejected a broker for the same module pair (ADR-03). In-process events keep the decoupling without being EDA. |
| **Function-per-feature serverless** (each feature its own function and data path) | Per-request scaling and pay-per-use cost.                                                                                                                            | Cold starts multiply the NFR-001 risk (R-07). More connection pools against Neon multiply R-09. Domain rules are harder to keep consistent.                                                                      | Rejected as a style. Serverless is kept as a deployment target for the single deployable, not as the style.                       |

## Decision

Adopt a **modular monolith**.

- One Next.js deployable, organised into the logical layers shown in Figure 1.
- Domain modules (IssueManagement, RoutingAndAssignment, and others as they appear) that communicate only through in-process domain events (ADR-03) and never read each other's tables directly.
- One PostgreSQL database, reached only through the data-access layer.
- Serverless hosting is the deployment target for that single deployable. It is not a decision to build the system as separate services.

## Trade-off and Judgement

We accept all-or-nothing scaling and a shared database in exchange for atomic consistency, one pipeline, and delivery within four fixed milestones. For this team and these ASRs, this is the more proportionate choice, not the less advanced one.

## Consequences

### Pros

- **NFR-001:** No network hop between modules, so the main remaining latency risk is the Neon cold start (R-07).
- **FR-006 / FR-008:** A single ACID transaction instead of a saga across services.
- **NFR-004:** One trust boundary and one place to enforce role-based checks.
- **NFR-002:** No always-on process to keep alive on the serverless tier.
- **Delivery:** One repository, one CI pipeline, one deployment to maintain.

### Cons

- Modules cannot be scaled or deployed independently.
- Module boundaries rely on team discipline and code review rather than a network wall, so coupling can creep in.
- The single database remains a single point of failure. Its backup and recovery treatment belongs in the data and persistence baseline (`docs/architecture/data-persistence-baseline.md`), which is still outstanding and is tracked as a known gap.
- Connection handling in serverless functions remains a risk (R-09), and concurrent updates a risk (R-10).

## When to Reconsider

1. Lighthouse tests show NFR-001 is breached by the routing/assignment workload rather than by cold start. In that case, extract RoutingAndAssignment behind an API.
2. Usage evidence (FEC-04) shows one module needs to scale independently.
3. More than one team needs to release modules independently.
4. Deferred notification features (e.g. SMS) need retry and buffering that justify a broker.
5. If only the Neon free tier is outgrown (R-08), revisit hosting, not the architectural style.

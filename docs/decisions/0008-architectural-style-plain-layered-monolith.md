# ADR-05: Architectural Style - Plain Layered Monolith on a Serverless Deployment Target

- **Status:** Approved. Revised in M3 from a modular monolith to a plain layered monolith by [CR-010](../change/change-control.md).
- **Date:** October 2026

## Context

ADR-01 to ADR-04 chose patterns and a stack, but the architectural style itself was only described, not decided.

The drivers are the architecturally significant requirements (ASRs) listed in the quality drivers document:

- **NFR-001:** response time under 2 seconds
- **NFR-002:** more than 99% uptime during operating hours
- **NFR-004:** POPIA access control
- **FR-006 / FR-008:** a status change and its audit record must commit as one atomic transaction

The constraints are a 3-person team, four fixed milestones (Schedule), and a free or low-cost budget (Cost/Resources).

**Evidence from A2:** The comparison of in-process Mediator, asynchronous broker, and synchronous REST, for the one interaction that needed routing (request intake -> department routing), found no benefit from a network boundary at this scale (see Initial API / Integration Decision). No independent-scaling need has been evidenced, and real usage numbers are still unknown (FEC-04).

**Revision (CR-010, M3):** the first version of this decision was a modular monolith with domain modules communicating through in-process events. The event pattern and module boundaries were not built and would not be finished by M3/M4, so the style was revised to a plain layered monolith. The same atomicity (FR-006 / FR-008) and performance (NFR-001) goals still hold.

## Concern

Distribution should be earned by evidence, not by architecture fashion. Every service boundary:

- adds latency (against NFR-001),
- adds another pipeline and monitoring burden for three people,
- turns the FR-006 / FR-008 transaction into a distributed one.

## Alternatives Considered

Architecture style, deployment, and infrastructure are judged separately. The style is a plain layered monolith, the deployment target is a single serverless deployable, and the infrastructure is a managed Neon PostgreSQL (ADR-04).

| Option | What it would give us | What it would cost us | Verdict |
| --- | --- | --- | --- |
| **Plain layered monolith** (one deployable, one database) | Single ACID transaction for FR-006 / FR-008. One pipeline and deploy for a 3-person team. No network latency between layers or features (NFR-001). Layer and feature structure kept in code. | No independent scaling or deployment. No enforced boundaries between features. One database is a single point of failure. | **Chosen** |
| **Modular monolith** (previous choice, superseded by CR-010: one deployable, enforced domain modules talking through in-process events) | Single ACID transaction for FR-006 / FR-008. No network latency. Feature boundaries enforced by structure, so coupling is controlled by design. Routing through an event keeps intake and routing apart. | Event plumbing, module wiring and rollback handling for event handlers, plus extra tests, for a team of 3 and four fixed milestones. The pattern was documented but never built, and would not be finished by M3/M4. | Rejected by CR-010: same atomicity and latency as the chosen option for a higher build cost |
| **SOA / microservices** (separate Issue, Routing, and Audit services) | Independent scaling and deployment. Fault isolation. Team autonomy. | FR-006 / FR-008 become a distributed transaction or saga. Network hops threaten NFR-001. Several pipelines, monitors, and attack surfaces (NFR-004) beyond what 3 people can run. No scaling need evidenced yet. | Rejected: benefits not evidenced |
| **Event-driven with an external broker** | Asynchronous decoupling, retries, and buffering for assignment and notifications. | A broker to run and pay for (Cost/Resources). Eventual consistency against FR-006 / FR-008. Harder debugging. A2 rejected a broker for the same request-to-routing interaction (ADR-03). A direct in-process call needs no broker and is not EDA. | Rejected for M2 |
| **Function-per-feature serverless** (each feature its own function and data path) | Per-request scaling and pay-per-use cost. | Cold starts multiply the NFR-001 risk (R-07). More connection pools against Neon multiply R-09. Domain rules are harder to keep consistent. | Rejected as a style. Serverless is kept as a deployment target for the single deployable, not as the style. |

## Comparison with the Modular Monolith (CR-010)

The earlier version of this ADR chose a modular monolith. Both options keep one deployable, one database and one ACID transaction, so they score the same on the drivers that matter most (FR-006 / FR-008 atomicity, NFR-001 latency, NFR-002 availability, NFR-004 one trust boundary). They differ in four ways:

- **Boundaries:** the modular monolith enforces them (modules, events, no cross-module table access); the plain monolith relies on the layer structure and code review.
- **Routing:** the modular monolith routes through an event, mediator and handler; the plain monolith uses one direct call inside the creation transaction, which is simpler to read, test and debug.
- **Cost:** the modular monolith needs event plumbing, module wiring and extra tests that were never built; the plain monolith needs none of that.
- **Evolution:** the modular monolith is easier to split into services later; the plain monolith would need its routing logic extracted first (see When to Reconsider).

**Judgement:** the extra enforcement buys little for a single team of three working on one slice at a time, and the effort did not fit the schedule. The plain monolith meets the same drivers at a lower cost. The price is that coupling can grow unchecked, so code review and the layer structure are the controls, and the reconsider triggers below apply.

## Decision

Adopt a **plain (layered) monolith**.

- One Next.js deployable, organised into the logical layers shown in Figure 1 (presentation, application, domain, data access).
- Code is organised by layer and feature area (requests, staff workflow, auth, audit) for readability, but no domain modules are enforced: a feature may call another feature's service in-process.
- One PostgreSQL database, reached only through the data-access layer.
- Serverless hosting is the deployment target for that single deployable. It is not a decision to build the system as separate services.
- Revised from a modular monolith by CR-010.

## Trade-off and Judgement

We accept all-or-nothing scaling and a shared database in exchange for atomic consistency, one pipeline, and delivery within four fixed milestones. For this team and these ASRs, this is the more proportionate choice, not the less advanced one.

## Consequences

### Pros

- **NFR-001:** No network hop between layers or features, so the main remaining latency risk is the Neon cold start (R-07).
- **FR-006 / FR-008:** A single ACID transaction instead of a saga across services.
- **NFR-004:** One trust boundary and one place to enforce role-based checks.
- **NFR-002:** No always-on process to keep alive on the serverless tier.
- **Delivery:** One repository, one CI pipeline, one deployment to maintain.

### Cons

- Features cannot be scaled or deployed independently.
- There are no enforced boundaries between features, so coupling can grow; code review and the layer structure are the controls.
- The single database remains a single point of failure. Its backup and recovery treatment is in the data and persistence baseline (`docs/architecture/data-persistence-baseline.md`), which is written.
- Connection handling in serverless functions remains a risk (R-09), and concurrent updates a risk (R-10).

## When to Reconsider

1. Lighthouse tests show NFR-001 is breached by the routing/assignment workload rather than by cold start. In that case, extract the request routing logic behind an API.
2. Usage evidence (FEC-04) shows one feature needs to scale independently.
3. More than one team needs to release features independently.
4. Deferred notification features (e.g. SMS) need retry and buffering that justify a broker.
5. If only the Neon free tier is outgrown (R-08), revisit hosting, not the architectural style.

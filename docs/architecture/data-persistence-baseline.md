# Data and Persistence Baseline

**Status: not yet written.** Deliberately deferred past the M2 submission deadline due to time constraints — logged as a known gap, not silently skipped. To be completed before this is treated as done.

Required content (brief section 5.4), for whoever picks this up:

- Identify the important data entities/aggregates, their relationships, ownership, and lifecycle implications.
- Provide an initial data model/schema (even a simple ERD or table-by-table sketch is enough at this stage).
- Justify the persistence model(s) chosen, from structure, relationships, access patterns, integrity, consistency, sensitivity and expected growth.
- Address database bottleneck/SPOF, scalability, availability and backup/recovery implications at an architectural level.
- Where A2 persistence research is relevant to an operation already being implemented, use it to strengthen the transaction, validation, integrity/concurrency or responsibility decisions.
- Record any significant decisions/risks that come out of this as their own entries in [Risk Register](../risk/risk-register.md) and [Decision Log](../decisions/), and update the [RTM](../requirements/rtm.md) accordingly.

Related context already recorded elsewhere: the atomic FR-006/FR-008 transaction requirement in [ADR-04](../decisions/0007-technology-stack-nextjs-neon-drizzle.md), and risks R-07 to R-11 in the [Risk Register](../risk/risk-register.md).

# ADR-02: Decorator Pattern for Cross-Cutting Audit Logging

- Status: Approved

- Date: September 2026

- Context: To meet regulatory compliance and satisfy requirement FR-008,
  every status change and critical action must generate an unchangeable
  audit log. Stuffing logging logic directly inside our core business
  service pollutes the code and mixes distinct responsibilities.

- Alternatives considered (A2 research): Aspect-Oriented Programming
  (AOP), intercepting @AuditLog-annotated methods at runtime. A2 found
  AOP eliminates repeated wrapper code across every service, but hides
  execution flow (harder to debug) and pulls in a framework dependency
  the team has no prior experience with. The Decorator Pattern was
  recommended instead for CivicConnect because it keeps the audit
  wrapping explicit and testable for a 3-person team still learning the
  stack, at the cost of one extra decorator class per wrapped service.

- Decision: We are using the Decorator Pattern by creating an
  AuditServiceDecorator. This decorator wraps around our core service
  implementations, automatically handling the audit logging before and
  after the core domain logic runs.

- Consequences:

  - Pros – Keeps core services focused strictly on business logic. Makes
    audit logging modular, so we can update or test it without touching
    core business code.

  - Cons – Adds an extra wrapper layer to look through when stepping
    through code in a debugger.

- Implementation note (M3, staff slice, [CR-014](../change/change-control.md)): the audit write is built as a function, `logAuditAction(tx, ...)` in `lib/decorators/auditDecorator.ts`, that the request service calls inside its own database transaction, and not as an `AuditServiceDecorator` class wrapping the service. A wrapper that runs before and after the service cannot share the service's transaction, and FR-006, FR-008 and ADR-04 need the change and its audit row to commit or roll back together. The aim of the decision is kept: audit writing lives in one file and the business rules in `lib/states/` do not log. The cost is that each service action has to call it, so the service tests assert the audit row for every action (assign, transfer, unassign and each status change). The database also rejects UPDATE, DELETE and TRUNCATE on `audit_logs` (migration 0001).

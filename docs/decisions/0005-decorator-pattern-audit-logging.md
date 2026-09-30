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


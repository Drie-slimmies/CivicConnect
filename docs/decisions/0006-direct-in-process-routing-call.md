# ADR-03: Direct In-Process Routing Call (Mediator Pattern Superseded by CR-010)

- Status: Superseded by CR-010 (M3). Originally approved; amended earlier in M3 by CR-006 and CR-007.

- Date: September 2026

- Context: When a request is logged it must be routed to the department for its category in the same transaction. Originally this was specified as a Mediator event between two modules (IssueManagement firing an IssueCreatedEvent, caught by a RouteToDepartmentHandler); under the plain monolith ([ADR-05](0008-architectural-style-plain-layered-monolith.md), CR-010) it is a direct call.

- Decision: Superseded by CR-010; the architectural style is decided in ADR-05. A new request is routed by a direct function call in the request service, inside the same database transaction that creates it. The request's department is set from the fixed category-to-department map; the staff queue shows the department as a label. No in-memory event, mediator or handler is built.

- Consequences:

  - Pros - A direct call is simpler to read, test and debug, with no event plumbing, and the creation write and the routing write share one transaction without extra rollback handling.

  - Cons - Creation and routing live in one function, so a future change to routing touches the request service. This is accepted for a plain monolith with one team.


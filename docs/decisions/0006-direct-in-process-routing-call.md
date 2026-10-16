# ADR-03: Department Routing (Mediator Pattern Superseded by CR-010; Routing Step Removed by CR-013)

- Status: Superseded by CR-010 (M3), then simplified by CR-013 (M3). Originally approved; amended earlier in M3 by CR-006 and CR-007.

- Date: September 2026

- Context: When a request is logged it must reach the department responsible for its category. Originally this was specified as a Mediator event between two modules (IssueManagement firing an IssueCreatedEvent, caught by a RouteToDepartmentHandler). CR-010 replaced the event with a direct call in the request service under the plain monolith ([ADR-05](0008-architectural-style-plain-layered-monolith.md)).

- Decision: No routing step is built. Each category belongs to exactly one department (`categories.department_id`, filled by the seed script), so a request's department is read through its category. The column `service_requests.assigned_department_id` that was meant to store the result is dropped (migration 0003, [CR-013](../change/change-control.md)). No in-memory event, mediator, handler or routing call exists. Staff are still assigned by hand (FR-005); the department does not assign anyone.

- Consequences:

  - Pros - Nothing to build, test or keep in step: the department cannot disagree with the category, and the creation transaction writes only the request and its first audit row.

  - Cons - If the team later wants a request moved to a different department than its category's, or a category handled by several departments, the department has to be stored on the request again. This is accepted because neither is a requirement.

# ADR-03: In Process Mediator Pattern for Internal Module Decoupling

- Status: Approved

- Date: September 2026

- Context: Different modules in the system need to talk to each other
  when key events happen for instance, IssueManagement needs to tell
  RoutingAndAssignment to assign a staff member as soon as a ticket is
  created. Direct calls between these modules create tight compile time
  coupling.

- Decision: We are adopting an In Progress Mediator/ Domain Event model.
  When a new ticket is logged, IssueManagement fires off an
  IssueCreatedEvent in memory. A decoupled handler (AssignStaffHandler)
  catches the event and process the assignment independently.

- Consequences:

  - Pros – Modules stay loosely coupled inside our monolith without the
    extra cost, setup or overhead of running an external message broker
    like RabbitMQ.

  - Cons – Since events run in memory, we need to handle database
    transactions carefully to make sure event failures roll back cleanly
    with database changes.


# ADR-01: Adoption of State Pattern for Service Request Lifecycles

- Status: Approved

- Date: September 2026

- Context: Service requests in CivicConnect have to follow a strict
  lifecycle(Submitted -\> InProgress -\> Resolved). Each transition
  needs proper business validation for example, we can’t let someone
  resolve a ticket without adding resolution notes or skip steps in the
  workflow. Trying to control these state change with nested if/else or
  switch blocks inside our service code quickly turns into messy,
  fragile logic that is hard to test and maintain.

- Alternatives considered (A2 research): Command Pattern, wrapping each
  transition in a standalone command object (action + parameters +
  execution logic). A2's comparison found this decouples invoker from
  handler and makes undo/queueing easier, but shifts the focus onto
  action execution rather than per-state rules, which is a weaker fit
  for FR-006's need to block illegal transitions - so A2 recommended the
  State Pattern for this problem, and that recommendation is adopted
  here because the CivicConnect lifecycle is a small, fixed set of
  states (not an extensible command queue).

- Decision: We are using the State Design Pattern. We defined an
  IRequestState interface with dedicated classes for each state
  (SubmittedState, InProgressState, ResolvedState). Each class has its
  specific business rules and handles its own transition logic.

- Consequences:

  - Pros- Keeps transition logic clean, isolated and easy to maintain
    without cluttering the main service layer. Fits nicely with the
    Single Responsibility and Open/Closed principles.

  - Cons - Adds a few extra class files to the domain folder.


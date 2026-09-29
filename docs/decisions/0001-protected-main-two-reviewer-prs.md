# ED-01: Protected main branch with two-reviewer pull requests

**Status:** Accepted (Milestone 1)

## Context

We needed a way to control changes to the shared repo from day one.

## Alternatives considered

- No restrictions on pushing to main
- Single reviewer approval
- Protected main with two independent reviewer approvals

## Decision

Protected main branch, pull requests required, two reviewer approvals.

## Rationale

A single reviewer (often the author reviewing their own change, or one other person) is more likely to miss their own mistakes than two independent reviewers checking a change.

## Trade-offs / risks

Slower merges and more coordination needed between the three of us (see risk R-03 in the [risk register](../risk/risk-register.md)).

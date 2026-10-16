# Evidence: Q5, concurrent edits lose a change

Part of the [Quality Strategy](../quality-strategy.md) (risk Q5, cases U4 and A3; R-10). Records one verification run and what it shows.

| Item | Value |
|---|---|
| Date | 16 October 2026 |
| Branch and base | `Viable-tests-to-address-quality-gates`, base commit `4ef2c92`, with the Q1 to Q5 changes not yet committed (replace with the pull request's commit SHA when it is merged) |
| Environment | Verification copy of `civic-connect/` in a Linux workspace, Node v22.23.2, Vitest 4.1.11, database mocked. This is not a CI run: confirm with `npm test` on a team machine and with the CI run on the pull request |
| Commands | `npx vitest run`, `npx eslint`, `npx tsc --noEmit` |

## Result

- `npx vitest run`: 18 files, 184 tests, 184 passed (130 after Q1, 90 before the quality work).
- `npx eslint`: no findings. `npx tsc --noEmit`: no errors.

## What was added and tagged

| Case | File | Tests | Technique |
|---|---|---|---|
| U4 lost race on assign and unassign | `tests/unit/requests/service.test.ts` | 2 | Negative: the version check passes but the update matches no row |
| A3 stale version is 409 on every route | `tests/api/requests/actions.test.ts` | 3 | Table: assign, unassign, status |

Existing tests tagged `[Q5]`: the stale-version service tests and the status-route stale-version test (replaced by the three-route table).

The service has two defences: it compares the version it read, and the update only matches the row at that version. The lost-race tests simulate the second one (the update returns no row) and check the answer is a conflict and no audit row is written. The status route's lost race was already tested.

## Do the tests fail when the rule breaks?

Each change below was made in the verification copy only, the tests were run, and the file was restored.

| Change made to the code | Tests that failed |
|---|---|
| Ignored a lost race on assign | 1: U4 assign |
| Ignored a lost race on unassign | 1: U4 unassign |
| Ignored a lost race on a status change | 1: the existing lost-race status test in `service.test.ts` |

## Interpretation

**What it shows:** a stale or lost save is reported as a conflict (409) on all three routes, and the audit log is not written for it.

**What it does not show:** a real race between two sessions on Neon, because the database is mocked. The unassign lost race is covered by U4; the version check on its own is covered by the stale-version tests. A two-session check on Neon is optional and not yet written.

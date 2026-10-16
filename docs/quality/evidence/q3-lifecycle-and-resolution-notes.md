# Evidence: Q3, lifecycle skipped or resolved without notes

Part of the [Quality Strategy](../quality-strategy.md) (risk Q3, cases U1, U2, B3, B4 and A3). Records one verification run and what it shows.

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
| B3 every current status x next status | `tests/blackbox/requests/lifecycle.test.ts` | 25 | State transition table |
| B4 resolution notes classes | `tests/blackbox/requests/lifecycle.test.ts` | 7 | Equivalence classes and boundary |

Existing tests tagged `[Q3]`: the state tests (U1, U2), the status-route 400, 422 and pass-through tests, and the service tests for resolving with and without notes.

B3 and B4 call the service function behind the status route, so they check the rule itself; the route's own answers (400, 422) are in `actions.test.ts`.

## Do the tests fail when the rule breaks?

Each change below was made in the verification copy only, the tests were run, and the file was restored.

| Change made to the code | Tests that failed |
|---|---|
| Let a Submitted request change status | 6: B3 submitted to each other status, and existing state and service tests |
| Stopped requiring resolution notes | 9: B4 empty, spaces, tabs, omitted notes, and the U2 tests |
| Let a Resolved request go back to In progress | 2: B3 Resolved to In progress, existing state test |
| Saved resolution notes without trimming them | 2: B4 notes with spaces around them, service test |

## Test design: B3

Only the next step is legal, and resolving needs notes (B3 supplies notes when the target is Resolved, so the notes rule does not hide a transition error).

| # | From | To | Expected result |
|---|---|---|---|
| 1 | Submitted | Submitted | Refused, ILLEGAL_TRANSITION, nothing saved |
| 2 | Submitted | Assigned | Refused, ILLEGAL_TRANSITION, nothing saved |
| 3 | Submitted | In progress | Refused, ILLEGAL_TRANSITION, nothing saved |
| 4 | Submitted | Resolved | Refused, ILLEGAL_TRANSITION, nothing saved |
| 5 | Submitted | Closed | Refused, ILLEGAL_TRANSITION, nothing saved |
| 6 | Assigned | Submitted | Refused, ILLEGAL_TRANSITION, nothing saved |
| 7 | Assigned | Assigned | Refused, ILLEGAL_TRANSITION, nothing saved |
| 8 | Assigned | In progress | Allowed (Start work); status saved and audit row 'in_progress' |
| 9 | Assigned | Resolved | Refused, ILLEGAL_TRANSITION, nothing saved |
| 10 | Assigned | Closed | Refused, ILLEGAL_TRANSITION, nothing saved |
| 11 | In progress | Submitted | Refused, ILLEGAL_TRANSITION, nothing saved |
| 12 | In progress | Assigned | Refused, ILLEGAL_TRANSITION, nothing saved |
| 13 | In progress | In progress | Refused, ILLEGAL_TRANSITION, nothing saved |
| 14 | In progress | Resolved | Allowed (Resolve with notes); status saved and audit row 'resolved' |
| 15 | In progress | Closed | Refused, ILLEGAL_TRANSITION, nothing saved |
| 16 | Resolved | Submitted | Refused, ILLEGAL_TRANSITION, nothing saved |
| 17 | Resolved | Assigned | Refused, ILLEGAL_TRANSITION, nothing saved |
| 18 | Resolved | In progress | Refused, ILLEGAL_TRANSITION, nothing saved |
| 19 | Resolved | Resolved | Refused, ILLEGAL_TRANSITION, nothing saved |
| 20 | Resolved | Closed | Allowed (Close); status saved and audit row 'closed' |
| 21 | Closed | Submitted | Refused, ILLEGAL_TRANSITION, nothing saved |
| 22 | Closed | Assigned | Refused, ILLEGAL_TRANSITION, nothing saved |
| 23 | Closed | In progress | Refused, ILLEGAL_TRANSITION, nothing saved |
| 24 | Closed | Resolved | Refused, ILLEGAL_TRANSITION, nothing saved |
| 25 | Closed | Closed | Refused, ILLEGAL_TRANSITION, nothing saved |

## Test design: B4

Request in progress, moving to Resolved.

| # | Notes | Class | Expected result |
|---|---|---|---|
| 1 | omitted | Missing | Refused, nothing saved |
| 2 | empty | Empty | Refused, nothing saved |
| 3 | 3 spaces | Blank | Refused, nothing saved |
| 4 | tab, new line, space | Blank | Refused, nothing saved |
| 5 | `x` | Smallest valid | Saved as `x` |
| 6 | `  Filled the pothole  ` | Padded | Saved trimmed |
| 7 | 2000 characters | Long | Saved in full |

## Interpretation

**What it shows:** of the 25 status pairs only the three legal ones succeed, and a request cannot be resolved with no real notes. Each refusal leaves the request and the audit log untouched.

**What it does not show:** that the buttons on the staff screen only offer legal moves, and the real database writes (E1). The 2000 character case is an example of a long input, not a stated limit; there is no maximum length rule yet.

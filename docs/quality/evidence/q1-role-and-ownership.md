# Evidence: Q1, role or ownership rule bypassed

Part of the [Quality Strategy](../quality-strategy.md) (risk Q1, cases B1, B2 and A1). Records one verification run and what it shows.

| Item | Value |
|---|---|
| Date | 16 October 2026 |
| Branch and base | `Viable-tests-to-address-quality-gates`, base commit `4ef2c92`, with the Q1 changes not yet committed (replace with the pull request's commit SHA when it is merged) |
| Environment | Verification copy of `civic-connect/` in a Linux workspace, Node v22.23.2, Vitest 4.1.11, database mocked. This is not a CI run: confirm with `npm test` on a team machine and with the CI run on the pull request |
| Commands | `npx vitest run`, `npx eslint`, `npx tsc --noEmit` |

## What was added and removed

| Case | File | Rows | Technique |
|---|---|---|---|
| B1 unassign: actor role x holder x status | `tests/blackbox/requests/roles.test.ts` | 17 | Decision table |
| B2 assign: assignee role x status | `tests/blackbox/requests/roles.test.ts` | 13 | Decision table |
| A1 role matrix: assign, unassign and status routes x signed out, requester, staff, manager, admin | `tests/api/requests/actions.test.ts` | 15 | Decision table at API level |

Existing tests tagged `[Q1]`: the three guard tests, the manager and own-request unassign tests, and the unassign and assign API cases for 403 and 422. Five tests were removed because the tables cover them completely: the requester-as-assignee, staff-on-a-colleague's-request and unassigned-or-finished service tests, and the two API 401/403 tests for assign and unassign.

## Result

- `npx vitest run`: 15 files, 130 tests, 130 passed (90 before this change).
- `npx eslint`: no findings. `npx tsc --noEmit`: no errors.

## Do the tests fail when the rule breaks?

Each change below was made in the verification copy only, the tests were run, and the file was restored.

| Change made to the code | Tests that failed |
|---|---|
| Removed the check that staff may unassign only their own request | 2: B1 staff on a colleague's assigned and in-progress request |
| Allowed managers as assignees | 3: B2 manager assignee on submitted, assigned and in-progress requests |
| Removed "admin" from the roles allowed on the staff routes | 3: A1 admin on the assign, unassign and status routes |
| Skipped the role guard in the shared route handler | 6: A1 signed out and requester on all three routes |
| Allowed unassigning a resolved or closed request | 6: B1 staff, manager and admin on resolved and closed requests |

## Test design: the decision tables

The tables below are generated from the arrays in `civic-connect/tests/blackbox/requests/roles.test.ts` (`unassignTable`, `assignTable`) and the matrix in `civic-connect/tests/api/requests/actions.test.ts` (block `[Q1][A1]`), so each row here is one test. If a rule changes, change the test array and this section together.

**Why these inputs.** The rules depend on three things: who is acting (or being assigned), who holds the request, and where the request is in its life. The status values form three classes: Submitted (nobody holds it), open and held (Assigned, In progress) and finished (Resolved, Closed). Both members of the open and finished classes are used, so a rule that is wrong for only one status is still caught. Every rule has at least one row that allows it and one that refuses it. Combinations that cannot exist are left out: a Submitted request always has nobody holding it, and managers and admins never hold a request, so "manager, held by themselves" is not a row.

### B1: who may unassign a request (FR-005, CR-012)

Request body: the version of the request. Actor ids are staff 7, manager 9, admin 10; "the same staff member" means the holder is the actor.

| # | Actor | Request status | Held by | Expected result | Rule |
|---|---|---|---|---|---|
| 1 | staff | Assigned | the same staff member | Allowed: back to Submitted, nobody assigned, audit row 'unassigned' | Staff may unassign a request they hold while it is open |
| 2 | staff | In progress | the same staff member | Allowed: back to Submitted, nobody assigned, audit row 'unassigned' | Staff may unassign a request they hold while it is open |
| 3 | staff | Assigned | someone else | Refused, 403, nothing saved | Staff may unassign only their own request (CR-012) |
| 4 | staff | In progress | someone else | Refused, 403, nothing saved | Staff may unassign only their own request (CR-012) |
| 5 | staff | Submitted | nobody | Refused, 422, nothing saved | Nobody holds a Submitted request, so there is nothing to unassign |
| 6 | staff | Resolved | the same staff member | Refused, 422, nothing saved | A finished request cannot be unassigned |
| 7 | staff | Closed | the same staff member | Refused, 422, nothing saved | A finished request cannot be unassigned |
| 8 | manager | Assigned | someone else | Allowed: back to Submitted, nobody assigned, audit row 'unassigned' | Managers and admins may unassign anyone's open request (CR-012) |
| 9 | manager | In progress | someone else | Allowed: back to Submitted, nobody assigned, audit row 'unassigned' | Managers and admins may unassign anyone's open request (CR-012) |
| 10 | manager | Submitted | nobody | Refused, 422, nothing saved | Nobody holds a Submitted request, so there is nothing to unassign |
| 11 | manager | Resolved | someone else | Refused, 422, nothing saved | A finished request cannot be unassigned |
| 12 | manager | Closed | someone else | Refused, 422, nothing saved | A finished request cannot be unassigned |
| 13 | admin | Assigned | someone else | Allowed: back to Submitted, nobody assigned, audit row 'unassigned' | Managers and admins may unassign anyone's open request (CR-012) |
| 14 | admin | In progress | someone else | Allowed: back to Submitted, nobody assigned, audit row 'unassigned' | Managers and admins may unassign anyone's open request (CR-012) |
| 15 | admin | Submitted | nobody | Refused, 422, nothing saved | Nobody holds a Submitted request, so there is nothing to unassign |
| 16 | admin | Resolved | someone else | Refused, 422, nothing saved | A finished request cannot be unassigned |
| 17 | admin | Closed | someone else | Refused, 422, nothing saved | A finished request cannot be unassigned |

### B2: who may be assigned a request (FR-005, CR-012)

The acting user is fixed (id 4), because the service does not check the actor's role on assign; the route guard does (see A1). The assignee is user 7 with the role in the first column; "someone else" holds the request when it is already held.

| # | Assignee | Request status | Held by | Expected result | Rule |
|---|---|---|---|---|---|
| 1 | staff | Submitted | nobody | Allowed: Assigned, audit row 'assigned' | A Submitted request moves to Assigned |
| 2 | staff | Assigned | someone else | Allowed: status unchanged, audit row 'transferred' | An open held request is transferred and keeps its status |
| 3 | staff | In progress | someone else | Allowed: status unchanged, audit row 'transferred' | An open held request is transferred and keeps its status |
| 4 | staff | Resolved | someone else | Refused, 422, nothing saved | Resolved and Closed requests cannot be reassigned (checked before the assignee) |
| 5 | staff | Closed | someone else | Refused, 422, nothing saved | Resolved and Closed requests cannot be reassigned (checked before the assignee) |
| 6 | manager | Submitted | nobody | Refused, 422, nothing saved | Managers and admins cannot hold requests (CR-012) |
| 7 | manager | Assigned | someone else | Refused, 422, nothing saved | Managers and admins cannot hold requests (CR-012) |
| 8 | manager | In progress | someone else | Refused, 422, nothing saved | Managers and admins cannot hold requests (CR-012) |
| 9 | manager | Resolved | someone else | Refused, 422, nothing saved | Resolved and Closed requests cannot be reassigned (checked before the assignee) |
| 10 | admin | Submitted | nobody | Refused, 422, nothing saved | Managers and admins cannot hold requests (CR-012) |
| 11 | admin | Assigned | someone else | Refused, 422, nothing saved | Managers and admins cannot hold requests (CR-012) |
| 12 | requester | Submitted | nobody | Refused, 422, nothing saved | Only staff accounts can hold requests |
| 13 | unknown user | Submitted | nobody | Refused, 422, nothing saved | An unknown user cannot be assigned |

### A1: who may call each staff route (NFR-004, FR-005, FR-006)

The three routes (assign, unassign, status) share one handler that allows only staff, manager and admin. Each route is called by each kind of actor:

| Actor | Result | Service called |
|---|---|---|
| Signed out | 401 | No |
| Requester | 403 | No |
| Staff | 200 | Yes |
| Manager | 200 | Yes |
| Admin | 200 | Yes |

That is 5 actors x 3 routes = 15 tests. The ownership rule (staff and a colleague's request) is covered in B1 at the service level and by the existing `[Q1]` API case that a FORBIDDEN answer from the service becomes a 403.

## Interpretation

- **What this shows:** the unassign and assign rules are checked for every combination of role, holder and status that the requirement defines, and the role list on every staff route is pinned for all five kinds of caller. A change to any of these rules turns a named `[Q1]` test red, so the CI gate would block the merge.
- **What it does not show:** the database is mocked, so the real roles in the `users` table, the SQL and the queue screens are not exercised. The role is also read from the database on each request (ADR-06), which only a real run can confirm. The end-to-end negative case E2 (a manager has no "Assign to me", staff B cannot unassign staff A's request) is still to be run before release. The service itself does not check the actor's role on assign; the route guard does, which is why the A1 matrix matters.
- **Status of Q1:** covered at gate level; the residual risk is the mocked database; E2 passed against a Neon branch on 16 October 2026 ([run evidence](e1-e2-end-to-end-run.md)).

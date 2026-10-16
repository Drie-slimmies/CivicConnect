# Evidence: Q4, audit trail incomplete or editable

Part of the [Quality Strategy](../quality-strategy.md) (risk Q4, cases U3, U5 and A4). Records one verification run and what it shows.

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
| U3 one audit row per action | `tests/unit/requests/service.test.ts` | 6 | Table: assign, transfer, unassign, start work, resolve, close |
| A4 audit rows cannot be changed | `scripts/verify-audit-immutable.mjs` (`npm run verify:audit`) | 3 statements | Database integration, negative |

Existing tests tagged `[Q4]`: the audit wording tests in `tests/unit/manager/audit.test.ts`, the timeline tests in `tests/unit/requests/history.test.ts`, the history query test and the assign and status audit tests in `service.test.ts`.

U3 checks that each successful action inserts exactly one audit row naming the acting user and the action.

**A4 status: run on a Neon branch on 16 October 2026, all three statements rejected ([run evidence](q4-audit-immutability-run.md)).** It opens a transaction on the database in `DATABASE_URL`, adds one test request and audit row, tries an UPDATE, a DELETE and a TRUNCATE on `audit_logs` each inside a savepoint, expects the error `audit_logs is append-only`, and always rolls back, so nothing is kept. It needs the seed data and the audit migration. Run it against a Neon test branch, not production, save the console output here with the date and commit SHA, and keep failures too.

## Do the tests fail when the rule breaks?

Each change below was made in the verification copy only, the tests were run, and the file was restored.

| Change made to the code | Tests that failed |
|---|---|
| Removed the audit row on a status change | 7: U3 start work, resolve and close, B3 allowed moves, and the service resolve test |
| Removed the audit row on assign | 7: U3 assign and transfer, two service assign tests, three B2 rows for staff assignees |
| Wrote the wrong user on the unassign audit row | 9: U3 unassign, six B1 rows, two service unassign tests |

## Interpretation

**What it shows:** every action path writes its audit row with the right actor, so removing a call to the audit step is caught.

**What it does not show:** that the audit rows are actually stored, and that the database refuses edits. Both depend on Neon, so the mocked tests cannot show them. Immutability is shown by the A4 run on a Neon branch, which passed; it should be repeated before the release candidate is tagged.

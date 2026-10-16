# Evidence: Q2, public tracking page leaks private data

Part of the [Quality Strategy](../quality-strategy.md) (risk Q2, cases U6, B5 and A2). Records one verification run and what it shows.

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
| B5 lookup ID classes | `tests/blackbox/requests/publicTracking.test.ts` | 9 | Equivalence classes |
| A2 public lookup response | `tests/api/requests/publicLookup.test.ts` | 3 | Negative, whitelist check |

Existing tests tagged `[Q2]`: the public-view test in `tests/unit/requests/rules.test.ts` (U6) and the tracking ID test in `tests/unit/requests/queries.test.ts`.

A2 calls the same lookup function the tracking page uses (`getPublicRequest`) with a mocked database row that holds a title, description, location, requester, staff name and resolution notes. It checks the keys of the result are exactly the six public ones, that none of the private keys exist, and that none of the private values appear anywhere in the serialised response. There is no public API route; the page itself has no automated test and is covered by E1.

## Do the tests fail when the rule breaks?

Each change below was made in the verification copy only, the tests were run, and the file was restored.

| Change made to the code | Tests that failed |
|---|---|
| Added the title to the public view | 3: A2 keys, A2 serialised response, U6 public view |
| Returned the whole stored request as the public view | 3: A2 keys, A2 serialised response, U6 public view |

## Test design: B5

| # | Lookup ID | Class | Expected result |
|---|---|---|---|
| 1 | `CC-7H3K9P` | Well-formed | Accepted by the format check |
| 2 | `XX-7H3K9P` | Wrong prefix | Rejected |
| 3 | `CC-7H3K9` | Too short | Rejected |
| 4 | `CC-7H3K9PX` | Too long | Rejected |
| 5 | `CC-7H3K9!` | Symbol inside | Rejected |
| 6 | `CC-A';--B` | SQL characters | Rejected |
| 7 | (empty) | Empty | Rejected |
| 8 | `CC-7H3K9P`, exists | Well-formed and real | Public view returned |
| 9 | `CC-ZZZZZZ`, does not exist | Well-formed and unknown | Nothing returned |

## Interpretation

**What it shows:** the public view is an allow-list, so a field added to the stored request does not reach an anonymous visitor unless someone adds it to the list on purpose and the A2 test then fails. Malformed IDs are separated from unknown ones by the format check.

**What it does not show:** the real SQL and the tracking page rendering (E1). A2 uses a mocked row, so it proves the shaping of the response, not the query.

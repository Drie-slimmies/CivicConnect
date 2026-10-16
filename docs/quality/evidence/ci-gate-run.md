# Evidence: CI gate run (checks 1 to 8)

Part of the [Quality Strategy](../quality-strategy.md) (gate checks 6 to 8, and the saved evidence for the gate as a whole). Records one run of the required `checks` job on GitHub and what it shows.

| Item            | Value                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 16 October 2026, about 17:20 (South Africa); the saved results are timestamped 15:19 UTC                                                            |
| Run by          | GitHub Actions, on a pull request from `Viable-tests-to-address-quality-gates`                                                                      |
| Code under test | Commit `9a4884d` on branch `Viable-tests-to-address-quality-gates`; run #33: https://github.com/Drie-slimmies/CivicConnect/actions/runs/38922953191 |
| Environment     | GitHub-hosted Ubuntu runner, Node 22, `npm ci` from `package-lock.json`                                                                             |
| Saved evidence  | The artifact `ci-evidence`: `junit.xml`, `audit.txt`, `gitleaks.txt`                                                                                |

## Result

| Check                          | Result                                         |
| ------------------------------ | ---------------------------------------------- |
| Skipped-test guard             | passed, nothing found under `tests/` or `e2e/` |
| Secrets scan (gitleaks 8.18.4) | 35 commits scanned, no leaks found             |
| Lint, build, typecheck         | passed                                         |
| Tests (Vitest)                 | 184 run, 0 failed, 0 errors, 0 skipped, 1.2 s  |
| Production dependency audit    | 0 vulnerabilities                              |

Verdict: PASS.

## An earlier failure on the same branch

The first run on the pull request failed at `npm ci` because `package-lock.json` did not list the esbuild 0.28.2 packages that npm expects on Linux. The lockfile was regenerated, `npm ci` was confirmed on a copy, and the next run passed. This is the gate working: nothing after the install step ran on a broken dependency tree.

## Interpretation

**What it shows:** the gate runs every time on GitHub from a clean install, the unit, black-box and API tests all pass there, and the results are kept for 90 days in a form that can be cited (the test run in `junit.xml` lists every case, including the `[Qn]` risk tags).

**What it does not show:**

- The tests use a mocked database. Behaviour against a real database is covered by the hand-run A4, E1, E2 and P1 evidence, not by this run.
- A green run proves nothing slipped past the checks that exist. It does not prove the checks are complete.
- The secrets scan covers committed history. A secret that was never committed is outside its reach.
- That a failure blocks the merge is shown by the separate blocked-merge evidence, not by this passing run.

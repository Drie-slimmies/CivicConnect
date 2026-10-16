# Defect Register

Defects and findings the team has found and what happened to each. It continues the record that was kept in commit messages and evidence notes before M3; each row links to the evidence. A finding is something the verification showed that is not yet a fix (an unmet target). Severity is the effect on the person using the system or on the release: High (data exposed or the system unusable), Medium (a feature or the pipeline fails or a target is missed), Low (a gap with no wrong behaviour seen).

Last updated 16 October 2026. Status is Open or Closed.

| ID | Date found | Found by | Defect or finding | Severity | Status | Fix and evidence | Linked |
|---|---|---|---|---|---|---|---|
| DF-01 | 11 October 2026 | CI run after the Next.js upgrade | The CI pipeline failed after the Next.js upgrade (the commit message records it as CI issues related to the new Next.js version) | Medium | Closed | Fixed in `a446e83` (workflow, `package.json` and lockfile changes) | ED-06, R-12 |
| DF-02 | 13 October 2026 | CI run on the authentication branch | `next build` failed in CI on `/_not-found`: the root layout now reads the session, so `lib/db` loaded during the build and threw because `DATABASE_URL` was not set. Local builds passed only because `.env` supplied the variable | Medium | Closed | Fixed in `fa8814a`: a placeholder `DATABASE_URL` for the Build step (never used to connect, not a secret) | TD-05 |
| DF-03 | 13 October 2026 | CI run | `package-lock.json` out of sync with `package.json`; `npm ci` refused to install | Medium | Closed | Fixed in `d3e6002` | R-12 |
| DF-04 | 15 October 2026 | Team, during the staff slice | A queue initialisation bug in the staff screens, recorded in the commit message of the staff workflow | Medium | Closed | Fixed in `f6eec85` with the staff workflow; the screens were run by hand against Neon on 16 October 2026 and end to end by E1 and E2 | FR-004, FR-005 |
| DF-05 | 16 October 2026 | Writing the Q1 role tests | The status route had no test for the 401 (signed out) and 403 (requester) answers, so a regression in its role check would have passed the gate | Medium | Closed | Role matrix added for all three staff routes (`tests/api/requests/actions.test.ts`, case A1); every route is now tested for 401, 403 and the allowed roles | Q1, [Q1 evidence](evidence/q1-role-and-ownership.md) |
| DF-06 | 16 October 2026 | E1, first run | E1 (end-to-end) looped on the sign-in screen until it timed out: the test clicked "Sign in" before the page had finished loading its scripts, so the browser submitted the form natively. A defect in the test, not in the application | Low | Closed | The tests wait for the page to be fully loaded before interacting, and the app is run as a production build. No application change | [E1 and E2 evidence](evidence/e1-e2-end-to-end-run.md) |
| DF-07 | 16 October 2026 | the first CI run on the pull request (`checks`) | `npm ci` failed: the lockfile lacked the esbuild 0.28.2 packages npm expects on Linux (the lockfile had been generated on Windows). Nothing after the install step ran | Medium | Closed | Lockfile regenerated, `npm ci` confirmed, fixed in `9a4884d`; run #33 passed. This is also the clearest example of the gate stopping a broken change | [CI evidence](evidence/ci-gate-run.md) |
| DF-08 | 16 October 2026 | P1 performance run | The all-requests list has a 95th percentile of 2067 ms against the 2000 ms target (NFR-001) with 20 users on a free-tier database; zero failed requests. The list loads every request and audit row with no limit | Medium | **Open** | Not fixed for M3; the target was not changed and the run was not repeated until it passed. Next step: limit and page the list and re-run P1 | NFR-001, R-07, TD-16, [P1 evidence](evidence/p1-performance-run.md) |

## Summary

- 8 entries: 7 closed, 1 open (DF-08, a missed performance target).
- No open defect is known that makes the application show wrong data, expose private data or lose a change. This is not proof that none exists; the limits of the evidence are in the [Release Evidence Summary](release-evidence-summary.md).
- DF-01 and DF-04 are recorded from the commit messages only; add the symptom as it was seen if the team remembers it.

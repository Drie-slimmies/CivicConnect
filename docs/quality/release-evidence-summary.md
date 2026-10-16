# Release Evidence Summary (M3)

This page turns the separate pieces of evidence into one argument about whether the M3 release candidate can be released. It links to the evidence; it does not repeat it. Part of [PED v3.0](../PED/PED.md).

| Item | Value |
|---|---|
| Release candidate | Git tag `m3-rc1` on `main` (commit hash in the PED submission block) |
| Scope | Requester sign-up and sign-in, request submission, public tracking, staff queue, assign, unassign and status changes with mandatory resolution notes, manager dashboard and audit log (FR-001 to FR-008, NFR-004) |
| Date | 16 October 2026 |
| Classification | **CONDITIONALLY READY** |

## 1. Evidence by area

| Evidence area | Result | Interpretation | Concern / action |
|---|---|---|---|
| Build and CI | **Pass.** The required job `checks` passed on the pull request (run #33, commit `9a4884d`, 1 minute): skipped-test guard, gitleaks over 35 commits (no leaks), lint, 184 tests, build, typecheck, production dependency audit. Results saved as the artifact `ci-evidence` ([CI evidence](evidence/ci-gate-run.md)) | The mandatory checks run from a clean install and pass. An earlier run on the same pull request failed at `npm ci` (DF-07) and stopped everything after it, which shows the gate blocks a broken change | Repeat on the exact release-candidate commit before tagging. `checks` is a required status check on `main` |
| Automated regression | **Pass.** 184 tests in 18 files, 0 failed, 0 skipped, in about 1.2 s. Tests carry the quality-risk tags Q1 to Q5 in their titles | Critical rules are protected: role and ownership (Q1), no private data on the public page (Q2), lifecycle and resolution notes (Q3), one audit row per action (Q4), stale version refused (Q5) | The database is mocked in these tests (TD-05), so they prove the rules in code, not the SQL. TD-10: queue search, filter and sort have no automated test |
| API / integration | **Pass.** 45 route-level cases (login, register, create, assign, unassign, status, public lookup) including a role matrix of every actor on every staff route and a 409 on every route for a stale version | Each route answers 400, 401, 403, 404, 409 and 422 as designed, and no private field reaches the public lookup | Run against mocks. A4, E1 and E2 are the evidence against the real database |
| System / end-to-end | **Pass.** E1 and E2 (Playwright 1.64.1, production build, Neon test branch) passed on the second run; the first run failed because of the test itself (DF-06) ([evidence](evidence/e1-e2-end-to-end-run.md)). A4 (audit table refuses UPDATE, DELETE, TRUNCATE) passed ([evidence](evidence/q4-audit-immutability-run.md)) | The critical journey works through the real screens, session, SQL and audit trigger: submit, track, assign, resolve with notes, close, five audit entries, nothing private on the public page; a staff member cannot unassign a colleague's request | One browser (Chromium), one run, a local production build, not a deployed site. Not covered: two people editing at once, failed sign-ins, other categories. Repeat on `m3-rc1` |
| Static / security | **Pass.** ESLint and TypeScript clean; `npm audit --omit=dev --audit-level=high` found 0 vulnerabilities; gitleaks found no secrets in the history; sessions are signed, HTTP-only cookies; role checked on the server on every request-data route | No known high-severity production dependency issue and no committed secret | Development tooling has known advisories with no upstream fix (R-12, not shipped). No login rate limiting (TD-01) and a stolen cookie works for up to 8 hours (TD-02). POPIA review (NFR-004, R-05) still open |
| Performance | **Fail against the target, recorded as found.** P1: 20 users for 30 s on `/queue/all` with 215 requests: 0 failed requests, median 1338 ms, 95th percentile **2067 ms** against under 2000 ms ([evidence](evidence/p1-performance-run.md)) | The page is correct under load but the slowest 5 percent exceeded the goal by 67 ms (3.4 percent). The list loads every request and audit row with no limit, and the run was on a free-tier database across the Atlantic with the load generator on the same laptop | Not repeated until it passed and the target was not changed. NFR-001 is not demonstrated for this page (DF-08, TD-16, R-07). Next step: limit and page the list, run P1 again |
| Known defects | **8 recorded, 7 closed, 1 open** ([Defect Register](defect-register.md)) | The one open item is the performance miss above. No open defect is known that shows wrong data, exposes private data or loses a change | Absence of known defects is not proof of absence |
| Run environment | **No separate staging** (not required for M3, confirmed by the lecturer). `m3-rc1` is run as a production build with its own configuration against a Neon test branch ([release-verification.md](../deployment/release-verification.md)) | The candidate runs apart from development and the critical journey passes against it (E1, E2) | Not a cloud site and does not reproduce serverless cold starts or HTTPS. Documented differences and a rollback approach are in the release verification page |
| Acceptance | **Evidence for FR-001 to FR-003 and FR-005 to FR-008 and NFR-004** (automated tests plus E1 or E2 or A4 as listed in the [RTM](../requirements/rtm.md)) | The agreed behaviour was demonstrated for each of these | FR-004 (staff search, filter and sort) is implemented and used by E1 and E2 but its filtering has no automated test (TD-10). NFR-001 not demonstrated (above). No evidence is recorded in this summary for NFR-002 (availability) or NFR-003 (360 px layout) |

Minimum test baseline from the brief: unit/component at least 5 (met), black-box at least 5 (71 cases from decision tables, a state transition table and equivalence classes with boundaries), API/integration at least 3 (45), end-to-end at least 2 (E1, E2), negative or unauthorised cases at least 3 (met many times over, for example every 401 and 403 answer and every illegal transition), high-priority requirement or risk cases at least 5 (Q1 to Q5), black-box techniques at least 2 (decision table, state transition, equivalence partitioning, boundary values), one performance exercise (P1). Counts alone are not the argument; the table above is.

## 2. Classification and reasoning

**CONDITIONALLY READY.** The core evidence is credible and agrees across independent sources: the gate, the route tests, the real-database check and the browser journeys all show that role rules, the lifecycle, the public page and the audit trail behave as specified, and no open defect is known in those areas. It is not READY because one agreed target is not met: NFR-001 on the all-requests list. It is not NOT READY because the miss is small, the page returns correct results with no failed request, the cause is understood and the fix is local (limit and page one query), and it concerns one screen on an unrealistic test setup.

**Conditions that must hold for this classification:**
1. The release is a student increment for evaluation, not a service holding real citizens' personal data. Before any real use: login rate limiting (TD-01), session revocation (TD-02), the POPIA review (R-05, R-11), a deployed environment and a re-run of P1 with the list limited.
2. A4, E1 and E2 are repeated on the exact `m3-rc1` commit (R-14), and the CI run on that commit is green.

**Release blockers:** none known. **Accepted limitations:** no deployed environment (not required for M3), one run of each hand-run check, mocked database in the gate, DF-08.

## 3. Residual risks

| Residual risk | Why it remains | Current mitigation | Next action / owner |
|---|---|---|---|
| The all-requests screen may be too slow with real data | P1 missed its target at 215 requests and the list has no limit, so it slows as requests grow | Finding recorded (DF-08), target kept; other queue views are smaller | Limit and page `listAllRequests`, run P1 again (TD-16); Ruan Jordaan |
| Defects hidden by the mocked database | The 184 gate tests replace the database with a mock, so SQL, constraints and transactions are not exercised by them | A4, E1, E2 against Neon; one audit row per action tested in code | Add a database-backed test job if the project continues (TD-05) |
| Concurrent edits are only tested in code | Q5 has unit and route tests but no two-browser run against the real database | Version check on every update, 409 and a message to reload; R-10 Low | Run a two-session check on Neon before real use |
| Hand-run evidence goes stale | A4, E1, E2 and P1 are outside CI and were run before the final commit | Evidence notes record the commit and what each does not show (R-14) | Re-run on `m3-rc1`; whole team |
| Production behaviour differs from the local run | Local run, free-tier database in another continent, no HTTPS domain, no serverless cold start | Differences listed in the release verification page; R-07 and R-09 open | Deploy and test on a real host when one is chosen |
| Account security gaps | No rate limiting, no password reset, a stolen session cookie works up to 8 hours | Scrypt hashing, signed HTTP-only cookies, server-side role checks, role set only on the server (R-13) | TD-01 to TD-03 before real users |
| Personal-data compliance not reviewed | NFR-004 is covered by access-control tests, not by a POPIA review | Role tests, public page whitelist (Q2), no private field in the public response | Complete the review (R-05, R-11) |
| Staff can change any request's status | FR-006 does not limit who updates a request (TD-12); each change is audited | Audit rows record the actor | Restrict to the holder and managers if it causes problems |

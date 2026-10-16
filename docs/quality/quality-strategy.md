# Quality Strategy and Quality Gate

**Status:** draft for team review, 16 October 2026 (Milestone 3). The gate test cases for Q1 to Q5 are built and verified; the gate additions in `ci.yml` and the release-quality evidence are not. Every item below says whether it exists or is planned.

This document does three things: it records which quality risks the team chose to verify and why (M3 work plan step 4, "risk-based, not test-count based"), it defines the single CI quality gate and the thresholds it uses, and it says how the evidence is stored and read. It extends the [ASRs and Quality Drivers](quality-drivers.md) and is indexed from the [PED](../PED/PED.md).

## 1. Quality risks

Each risk follows the reasoning chain from the course: requirement, failure scenario, likelihood, impact, priority, verification and evidence, residual risk. Priority is set mainly by impact, because the team is three people and the data is low volume.

| ID | Risk | Requirement | Likelihood | Impact | Priority |
|---|---|---|---|---|---|
| Q1 | A role or ownership rule is bypassed | FR-005, NFR-004 | Medium | High | **High** |
| Q2 | The public tracking page leaks private data | FR-003, NFR-004 | Low | High | **High** |
| Q3 | A request skips a step or is resolved without notes | FR-006 | Medium | High | **High** |
| Q4 | The audit trail is incomplete or can be edited | FR-008 | Medium | High | **High** |
| Q5 | Two staff change the same request and one change is lost | FR-005, FR-006 | Low to medium | Medium | Medium |

### Q1: A role or ownership rule is bypassed

- **Requirement:** FR-005 (AC-STF-02) with [CR-012](../change/change-control.md), and NFR-004 (AC-SEC-02). Only staff accounts can hold a request; managers and admins assign, transfer and unassign but never hold; staff unassign only their own.
- **Failure scenario:** a staff member unassigns a colleague's request; a manager or admin ends up holding a request or assigns it to themselves; a requester account calls a staff route.
- **Likelihood, medium:** the rules were added late and sit in the service, the state classes and the screens. The screens hide buttons, but the server is the real control.
- **Impact, high:** the wrong person changes work, managers stop being view-oriented, and POPIA access control (NFR-004) is weakened.
- **Verification:** decision tables B1 and B2, the negative API cases A1, and the end-to-end negative case E2.
- **Residual risk:** the gate tests replace the database with a mock, so roles are checked against the real database only in the release-quality runs (E1, E2). Related: R-05, R-13.

### Q2: The public tracking page leaks private data

- **Requirement:** FR-003 (AC-REQ-02) and NFR-004. Anyone with a tracking ID sees the status history only, never the title, description, location or names (the title is hidden by the M3 scope decision).
- **Failure scenario:** a field is added to the public query and reaches the page, or a lookup returns another requester's details.
- **Likelihood, low:** one function, `toPublic` in `lib/requests/rules.ts`, chooses the fields.
- **Impact, high:** the page is anonymous and public, so a leak is a POPIA exposure. Impact is why this is High despite the low likelihood.
- **Verification:** the existing whitelist test U6, the lookup ID classes B5, and the response check A2.
- **Residual risk:** low. A field that bypasses `toPublic` is caught only by A2. Related: R-05.

### Q3: A request skips a step or is resolved without notes

- **Requirement:** FR-006 (AC-STF-03). Only the next status is allowed, Resolved needs resolution notes, Closed is final.
- **Failure scenario:** Submitted to Closed is accepted; Resolved is saved with empty or blank notes; a Closed request is changed.
- **Likelihood, medium:** the rule is enforced in three places (state classes, service, screen) and any one can drift.
- **Impact, high:** it breaks the accountability the module exists to give, and the resolution notes are the feedback the requester sees.
- **Verification:** U1 and U2 (existing), the status-pair table B3, the notes classes B4, the API cases A3, and the end-to-end journey E1.
- **Residual risk:** low once every status pair is table-tested. Related: R-04.

### Q4: The audit trail is incomplete or can be edited

- **Requirement:** FR-008 (AC-AUD-01), [CR-014](../change/change-control.md), migration `0001_audit_immutable.sql`.
- **Failure scenario:** an action commits without an audit row; an audit row can be updated, deleted or truncated; the audit row is written outside the transaction so the change and its log disagree.
- **Likelihood, medium:** each new action must remember to call `logAuditAction`.
- **Impact, high:** the audit trail is the accountability and legal record.
- **Verification:** U3 (an audit row is asserted for every action, in the same transaction), U5 (the timeline is rebuilt from audit rows), the database check A4 on Neon (UPDATE, DELETE and TRUNCATE are rejected), and E1 (the manager sees the entries).
- **Residual risk:** the immutability trigger cannot be tested without a real database, so it is proven only in the release-quality run. A database owner could still drop the trigger, as the [data and persistence baseline](../architecture/data-persistence-baseline.md) already records.

### Q5: Two staff change the same request and one change is lost

- **Requirement:** FR-005 and FR-006, with risk R-10 (optimistic concurrency on the `version` column).
- **Failure scenario:** two staff act on one request and the second silently overwrites the first.
- **Likelihood, low to medium:** there is one shared queue, so simultaneous edits are possible. R-10 rates the probability Low for a three-person team, and this document follows it with a small step up for the shared queue.
- **Impact, medium:** a wrong status or assignee, though both changes would still appear in the audit trail.
- **Verification:** U4 and A3 (a stale version answers 409 and saves nothing).
- **Residual risk:** proven with a mocked database only; no two-session test against Neon exists. Related: R-10.

### Considered and not prioritised

- **Tracking ID collisions (TD-14):** 32^6 combinations make a clash very unlikely and the unique index keeps the data safe.
- **Audit page shows only the newest 200 entries (TD-11):** a display limit, no data is lost.
- **Any staff member can change any request (TD-12):** FR-006 allows it and every change is audited.
- **Input validation:** low impact. It already has boundary tests in `tests/unit/requests/rules.test.ts` and supports the black-box cases without being a headline risk.
- **Authentication hardening (rate limiting, session revocation, TD-01 and TD-02):** accepted debt with its own tests in `tests/unit/auth` and `tests/api/auth`; they run in the gate but are not tied to Q1 to Q5.

## 2. Test cases and what they protect

Test names carry the risk ID in square brackets, for example `[Q1] returns 403 when staff try to unassign someone else's request`, so a failed run names the risk. Every gate test of Q1 to Q5 is tagged. Each case has a requirement or risk basis, deliberately chosen data and a defined expected result. Execution evidence and an interpretation of what the result demonstrates are recorded per run (section 5), which is what the brief's "meaningful test" rule asks for.

| ID | Level and technique | Risk | Input and precondition | Expected result | Runs in | State |
|---|---|---|---|---|---|---|
| U1 | Unit, state transition | Q3 | Each status against each next status | Only the next step is valid; Closed refuses everything | Gate | Exists: `tests/unit/states/states.test.ts` |
| U2 | Unit, negative | Q3 | In progress to Resolved with empty or blank notes | Refused, nothing saved | Gate | Exists: `states.test.ts`, `tests/unit/requests/service.test.ts` |
| U3 | Unit | Q4 | Assign, transfer, unassign and each status change | One audit row each, in the same transaction | Gate | Exists: `service.test.ts` (one row per action, a table of six) |
| U4 | Unit, negative | Q5 | Stale version on assign, unassign and status | Conflict, nothing saved, no audit row, including a lost race on assign and unassign | Gate | Exists: `service.test.ts` |
| U5 | Unit, regression | Q3, Q4 | A request is unassigned | The progress timeline steps back to Submitted | Gate | Exists: `tests/unit/requests/history.test.ts` |
| U6 | Unit | Q2 | A full request converted to its public view | Only whitelisted fields remain | Gate | Exists: `tests/unit/requests/rules.test.ts` |
| B1 | Black-box, decision table | Q1 | Actor role (staff, manager, admin) x request holder (self, someone else, nobody) x status: can unassign? | Manager and admin while open; staff only their own; never Resolved or Closed | Gate | Exists: `tests/blackbox/requests/roles.test.ts` (17 rows) |
| B2 | Black-box, decision table | Q1 | Assignee role (staff, manager, admin, requester, unknown user) x request status | Only staff accepted; Resolved and Closed refuse assignment | Gate | Exists: `tests/blackbox/requests/roles.test.ts` (13 rows) |
| B3 | Black-box, state transition | Q3 | Every status pair through the status route | Exactly the legal moves pass; the rest are refused as illegal (the route answers 422) | Gate | Exists: `tests/blackbox/requests/lifecycle.test.ts` (25 rows) |
| B4 | Black-box, equivalence classes | Q3 | Notes: empty, spaces only, one character, long text | Empty and spaces rejected; the rest accepted | Gate | Exists: `lifecycle.test.ts` (7 rows) |
| B5 | Black-box, equivalence classes | Q2 | Lookup ID: real, unknown, malformed | Public fields only; nothing for an unknown ID; malformed IDs refused by the format check | Gate | Exists: `tests/blackbox/requests/publicTracking.test.ts` (9 rows) |
| A1 | API, negative | Q1 | Every staff route (assign, unassign, status) x actor (signed out, requester, staff, manager, admin); staff unassigning a colleague's request | 401, 403, then the service is called for staff, manager and admin; 403 when staff unassign a colleague's request | Gate | Exists: `tests/api/requests/actions.test.ts` |
| A2 | API, negative | Q2 | Public lookup of a real request | Response contains no title, location or names | Gate | Exists: `tests/api/requests/publicLookup.test.ts` (calls the lookup function the page uses; there is no public route) |
| A3 | API integration | Q3, Q5 | Illegal step and stale version through the handlers | 422 and 409 with a clear message | Gate | Exists: `actions.test.ts` (409 on all three routes) |
| A4 | Database integration, negative | Q4 | UPDATE, DELETE and TRUNCATE on `audit_logs` on Neon | The trigger rejects each | Release-quality run | Exists: `civic-connect/scripts/verify-audit-immutable.mjs` (`npm run verify:audit`). Run on a Neon branch on 16 October 2026: passed, [evidence](evidence/q4-audit-immutability-run.md). Repeat before the release candidate is tagged |
| E1 | End-to-end, acceptance | Q1 to Q4 | Requester submits, public page shows Submitted only, staff assigns, starts and resolves with notes, manager closes and sees the dashboard and audit entries | Every step passes; the requester sees the notes; the public page never shows private fields; the audit log has five entries for the request | Release-quality run | Exists: `civic-connect/e2e/e1-acceptance.e2e.ts` (`npm run test:e2e`). Run on a Neon branch on 16 October 2026: passed on the second run, [evidence](evidence/e1-e2-end-to-end-run.md). Repeat on the release candidate |
| E2 | End-to-end, negative | Q1, Q3 | Manager has no "Assign to me"; staff B cannot unassign staff A's request; staff A unassigns and the progress bar steps back | Matches the role rules (also a 403 from the API for staff B); timeline rolls back | Release-quality run | Exists: `civic-connect/e2e/e2-role-rules.e2e.ts`. Run on a Neon branch on 16 October 2026: passed on the second run, [evidence](evidence/e1-e2-end-to-end-run.md). Repeat on the release candidate |
| P1 | Performance | none (NFR-001, R-07) | See section 4 | See section 4 | Release-quality run | Exists: `civic-connect/scripts/perf-queue.mjs` (`npm run perf:queue`). Run on a Neon free-tier branch on 16 October 2026: **FAIL**, p95 2067 ms against the 2000 ms target, no errors, [evidence](evidence/p1-performance-run.md) |

The authentication tests, the dashboard test and the creation tests also run in the gate. They protect FR-001, FR-002, FR-007 and NFR-004 and are listed in the [RTM](../requirements/rtm.md) test evidence section, but they are not tied to Q1 to Q5.

### Check against the M3 verification baseline

| Baseline (brief section 9) | Needed | Today | When the planned cases exist |
|---|---|---|---|
| Unit/component | 5 | 6 (U1 to U6) | 6 |
| Black-box functional | 5 | 5 (B1 to B5) | 5 |
| API/integration | 3 | 4 (A1 to A3, and the existing creation and auth handlers) | 5 (A1 to A4) |
| End-to-end/system | 2 | 2 (E1, E2, run once on a Neon branch) | 2 |
| Negative/failure/unauthorised | 3 | 7 or more (U2, U4, A1, A2, A3, B3, B4) | 8 with A4 |
| High-priority risk coverage | 5 | 5 (Q1 to Q5 each have gate cases) | 5, plus E1, E2 and A4 |
| Black-box techniques | 2 | 3 (decision table B1, B2; state transition B3; equivalence classes B4, B5) | 3 |
| Performance | 1 | 0 | 1 (P1) |

## 3. The CI quality gate

**Principle:** the pipeline produces evidence and the gate decides whether the evidence is sufficient. A green gate means the defined conditions were met; it does not mean the product is perfect.

**Gate:** one required CI job, `checks`, in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). It runs on every pull request to `main` and every push to `main`. Thresholds below are fixed in advance and change only through a reviewed pull request.

| # | Check | Evidence | Threshold | If not met | State |
|---|---|---|---|---|---|
| 1 | Lint (ESLint) | Lint log | Zero errors | BLOCK | In place |
| 2 | Risk-regression tests (`npm test`, Vitest): the gate cases of section 2 | Test report | All pass | BLOCK | In place (184 tests in 18 files on 16 October 2026) |
| 3 | Build (`npm run build`) | Build log | Succeeds | BLOCK | In place |
| 4 | Typecheck (`npx tsc --noEmit`, after the build) | Compiler output | Zero errors | BLOCK | In place |
| 5 | Dependency audit (`npm audit --omit=dev --audit-level=high`) | Audit output | No high or critical findings in production dependencies | BLOCK on high or critical; moderate findings are recorded and investigated | In place (0 vulnerabilities on 16 October 2026) |
| 6 | Skipped-test guard: no `.skip(`, `.skipIf(`, `.todo(` or `.only(` (and no `xit`, `xdescribe` or `xtest`) under `tests/` or `e2e/` | Check output | None found | BLOCK | In place (workflow change, to be confirmed by the first green run on the pull request) |
| 7 | Secrets scan: gitleaks 8.18.4 (binary, checksum verified) over the full git history | Scan log | Zero findings | BLOCK | In place (workflow change, to be confirmed by the first green run). Run by hand on 16 October 2026: 34 commits scanned, no leaks |
| 8 | Saved evidence: test report and audit output uploaded as artifacts on every run | Artifacts | Present | Not blocking, but the run is not citable without them | In place: the artifact `ci-evidence` holds `junit.xml`, `audit.txt` and `gitleaks.txt` for 90 days |
| 9 | Coverage report | Coverage report | Reported only, no percentage | Reported; what it does and does not show is explained in the Release Evidence Summary | Not included (optional; decided against for now) |

Outcomes: **PASS** means the change may merge; **BLOCK** means the change must not merge until the cause is corrected; **INVESTIGATE** means the result is recorded and a named person decides, with the decision written down.

Gate policies:

- **No rerun until green.** A flaky test is logged as a defect and counts as a failure until it is fixed or removed with a recorded reason.
- **Do not change a test to agree with the code.** A failed check is traced to its requirement or risk, then the code, test, test data, environment or assumption that is wrong is corrected, and the relevant and broader checks are rerun.
- **A skipped test is a failure.** Otherwise a risk case could be switched off and the gate would stay green.
- **Dev-tooling vulnerabilities** are not gated (R-12); plain `npm audit` is rerun at each milestone and the findings are recorded.
- **Pull request control** (from [CONTRIBUTING.md](../../CONTRIBUTING.md)): two approvals from non-authors, no direct pushes to `main`. Making `checks` a required status check in the ruleset is a repository setting to be confirmed.

**What a green gate does not prove:** usability and accessibility (NFR-003); performance beyond the single P1 scenario (NFR-001); behaviour against the real database, because the gate tests mock it (TD-05); the screens, which have no automated test (TD-10); and anything outside Q1 to Q5.

## 4. Release-quality evidence (outside the CI gate)

The course separates the CI gate (fast feedback per change) from a broader release-quality review. The cases below need the real database, a browser or a running build, so they would make the gate slow or flaky. They are run by hand before the release candidate is tagged and recorded as evidence.

- **A4, audit immutability on Neon:** run UPDATE, DELETE and TRUNCATE against `audit_logs` and record that each is rejected.
- **E1 and E2, end-to-end:** two journeys driven in a browser with Playwright (`@playwright/test`, Chromium), run with `npm run test:e2e` from `civic-connect/`. The tests build and start the app locally (`npm run build` and `npm run start`) against a Neon test branch, never the main database. They create requests and one test staff account there, so the run refuses to start unless `E2E_CONFIRM_TEST_DATABASE=yes` is set. They are outside the CI gate. Results are saved as JUnit and an HTML report under `civic-connect/e2e-results/` and summarised in an evidence file.
- **P1, performance:** the all-requests list `/queue/all` for staff, with 200 seeded requests (about a fifth in each status, each with its audit rows), 20 signed-in users, each requesting the page and then waiting 1 second, for 30 seconds, against a production build (`npm run perf:queue`, `civic-connect/scripts/perf-queue.mjs`). The script seeds the requests, reports the first request time separately, discards a warm-up, and saves the result as JSON under `civic-connect/perf-results/`. **Pass:** zero failed requests (a failed request is a non-200 answer or a page without the expected content) and a 95th percentile under 2 seconds (NFR-001). The limits (a single machine, a Neon free-tier branch, a client far from the database, the first request after idle not being a true cold start per R-07) are stated with the result, and it is not claimed as capacity evidence.
- **Manual walkthrough:** a team member ran the application against Neon and ran `npm run build` on 16 October 2026 without problems. The journeys were not itemised, so this counts as informal evidence; it is superseded by the recorded E1 and E2 run.
- **Static and security:** lint, typecheck, the production dependency audit and the secrets scan in the gate are the static and dependency/secrets checks asked for in the brief.

## 5. Evidence storage and evaluation

1. **CI runs:** the Actions run (logs, result, commit SHA) and the uploaded artifacts. GitHub keeps these for a limited time (90 days by default), so they are not enough on their own.
2. **Manual runs:** each saved as a file under `docs/quality/evidence/` with the date, commit SHA, environment, command or steps, result, and a short interpretation of what it shows and does not show. A failed run is kept, with a note of what was changed in response.
3. **Evaluation:** the [RTM](../requirements/rtm.md) links each requirement to its tests, result, evidence and status; the Release Evidence Summary has one row per evidence area (build and CI, regression, API/integration, system/E2E, static/security, performance) with result, interpretation and concern; the [PED](../PED/PED.md) only indexes both.

## 6. Delivery order

1. PR 1: the gate additions in `ci.yml` (checks 6 to 8; check 9 left out) and the repository setting for the required check. This strategy is already pushed.
2. One pull request per risk, in the order Q1 to Q5. Each tags that risk's existing tests, adds its planned cases, saves an evidence file under `docs/quality/evidence/` and updates the RTM. Q1 to Q5 are built and verified in the verification copy: evidence files [Q1](evidence/q1-role-and-ownership.md), [Q2](evidence/q2-public-tracking-privacy.md), [Q3](evidence/q3-lifecycle-and-resolution-notes.md), [Q4](evidence/q4-audit-trail.md) and [Q5](evidence/q5-concurrent-edits.md); they go in as one change. A4 has been run (passed); still to do for the risks: E1 and E2.
3. Release-quality evidence: A4 and E1/E2 (done once on a Neon branch, repeat on the release candidate), then P1.
4. Release Evidence Summary, RTM results, risk register and PED v3.0 final.

## 7. Open decisions

- Whether `checks` is already a required status check in the ruleset (a repository setting, not part of the workflow file).
- Decided: the secrets scan uses the gitleaks binary directly, so it needs no licence on a personal or an organisation repository; coverage (check 9) is left out; P1 measures `/queue/all`.

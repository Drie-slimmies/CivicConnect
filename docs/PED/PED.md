# Project Engineering Document (PED)

**Project Name:** CivicConnect Community Service Request Management Platform
**Document Identifier:** Project Engineering Document (PED) v3.0 (M3 submission, evidence index)
**Target Baseline:** Milestone 3 (Controlled Construction, Integration, Quality & Release Readiness); the Milestone 2 baseline gate is recorded below
**Team Identifier:** Group M (Drie-slimmies)

> This is the living engineering document for CivicConnect. It started as a Word document for Milestone 1; per lecturer feedback after the M1 presentation, it now lives here as version-controlled Markdown. Each later version extends the same document, it does not replace or silently overwrite the M1 baseline below; every change made to baselined M1 content is tracked in the [Change Control log](../change/change-control.md).

## Contents

**M1 baseline (unchanged except where logged in Change Control):**
- [Requirements Baseline](../requirements/requirements.md) — problem & business need, stakeholder analysis, scope baseline, functional/non-functional requirements, constraints
- [Forward Engineering Considerations](forward-engineering-considerations.md)

**M2 additions:**
- [RTM v2.0](../requirements/rtm.md)
- [Risk Register](../risk/risk-register.md) (R-01 to R-14)
- [Engineering Decision Log](../decisions/) — ADR-0001 to ADR-0009
- [Change Control](../change/change-control.md) — CR-001 to CR-015
- [Architecture Overview](../architecture/architecture.md) — plain layered monolith (ADR-05, CR-010)
- [ASRs and Quality Drivers](../quality/quality-drivers.md)
- [Deployment Direction and Compatibility](../deployment/deployment.md)
- [Data and Persistence Baseline](../architecture/data-persistence-baseline.md) — deferred past the M2 deadline, since written and updated for authentication on 13 October 2026
- [GitHub Governance and Team Repository Controls](../../CONTRIBUTING.md)
- [AI Usage Register](../ai-usage-register.md)
- [Technical Debt Register](../quality/technical-debt-register.md) (added in M3)
- [Quality Strategy and Quality Gate](../quality/quality-strategy.md) — quality risks Q1 to Q5, test cases, the CI quality gate and release-quality evidence (added in M3)
- [Defect Register](../quality/defect-register.md) (added in M3)
- [Release Evidence Summary](../quality/release-evidence-summary.md) (added in M3)
- [Release Candidate Verification and Rollback](../deployment/release-verification.md) (added in M3)
- [Quality evidence records](../quality/evidence/) — Q1 to Q5, A4, E1 and E2, P1 and the CI run

## M3 Submission Information

| Item | Value |
|---|---|
| Team | Group M (GitHub organisation Drie-slimmies) |
| Team members | Ruan Jordaan (601715), Mark Minnaar (602267), Armand Erasmus (601631) |
| GitHub repository | https://github.com/Drie-slimmies/CivicConnect |
| M3 release candidate | Git tag `m3-rc1` on `main`, commit RC_COMMIT_SHA |
| PED version | v3.0 (this document, continued from PED v2.0) |
| RTM | [docs/requirements/rtm.md](../requirements/rtm.md) |
| CI and test evidence | [CI run record](../quality/evidence/ci-gate-run.md) (GitHub Actions run #33, artifact `ci-evidence`), [quality evidence folder](../quality/evidence/), [Release Evidence Summary](../quality/release-evidence-summary.md) |
| Test environment | A separate staging environment is not required for M3 (lecturer). The release candidate runs as a production build against a Neon test branch; instructions in [release-verification.md](../deployment/release-verification.md); shown in the recorded presentation |
| Registers | [Risk Register](../risk/risk-register.md), [Defect Register](../quality/defect-register.md), [Technical Debt Register](../quality/technical-debt-register.md), [AI Usage Register](../ai-usage-register.md), [Decision Log](../decisions/), [Change Control](../change/change-control.md) |
| Date submitted | 16 October 2026 |

## M3 Evidence Index

PED v3.0 continues PED v2.0; nothing earlier was removed. This index points to the evidence for each part of M3 and states the claim; the detail stays in the linked artefacts. The M3 progress sections further down are the dated record of how it was built.

### 1. M3 overview

**Implemented scope:** FR-001 to FR-008 and NFR-004 as one integrated increment: requester sign-up and sign-in, request submission with a tracking ID, public tracking, staff queue views, assign, transfer and unassign, status changes with mandatory resolution notes, manager dashboard and an append-only audit log. **Status:** [Release Evidence Summary](../quality/release-evidence-summary.md) classifies the candidate CONDITIONALLY READY (one performance target missed, no deployed environment). Stack: Next.js 16, React 19, TypeScript, Drizzle with Neon PostgreSQL, `jose` sessions, Vitest, Playwright.

### 2. M2 baseline conformance

**As planned:** Next.js, Neon and Drizzle ([ADR-04](../decisions/0007-technology-stack-nextjs-neon-drizzle.md)); State pattern for the request lifecycle ([ADR-01](../decisions/0004-state-pattern-service-request-lifecycle.md), `civic-connect/lib/states/`); audit logging by a decorator ([ADR-02](../decisions/0005-decorator-pattern-audit-logging.md)); layered structure ([architecture](../architecture/architecture.md)); append-only audit table enforced in the database (migration `0001`, check A4).
**Deviations, all controlled:** the modular monolith became a plain layered monolith ([CR-010](../change/change-control.md), ADR-05); the routing step was removed and department is read through the category ([CR-013](../change/change-control.md), ADR-03); audit rows are written inside the service transaction as a function rather than a wrapping class ([CR-014](../change/change-control.md), ADR-02); managers cannot hold requests and unassign was added ([CR-012](../change/change-control.md)); sessions use signed cookies ([ADR-06](../decisions/0009-signed-cookie-sessions-with-jose.md)).

### 3. Controlled changes

CR-006 to CR-015 are logged in [Change Control](../change/change-control.md) with reason and impact; the decisions behind them are in the [Decision Log](../decisions/). The Data and Persistence Baseline gap logged in PED v2.0 is closed ([data-persistence-baseline.md](../architecture/data-persistence-baseline.md)).

### 4. Construction and configuration

- **Repository:** protected `main`, feature and fix branches, pull requests needing two independent approvals ([ADR ED-01](../decisions/0001-protected-main-two-reviewer-prs.md), [CONTRIBUTING.md](../../CONTRIBUTING.md)); the history on GitHub is the record of how the work progressed.
- **Configuration and secrets:** `.env` is git-ignored and `.env.example` lists the names only; CI uses a placeholder `DATABASE_URL` for the build because the build never connects (DF-02); `SESSION_SECRET` must be long and differ per environment (TD-08); gitleaks scans the whole history in every CI run.
- **Environments:** [deployment.md](../deployment/deployment.md) and [release-verification.md](../deployment/release-verification.md).
- **Maintainability and AI use:** conventions in [CONTRIBUTING.md](../../CONTRIBUTING.md); AI use is logged in the [AI Usage Register](../ai-usage-register.md).

### 5. CI and automated verification

One required GitHub Actions job, `checks` ([ci.yml](../../.github/workflows/ci.yml)): skipped-test guard, gitleaks secrets scan, lint, the Vitest suite (184 tests, 18 files), build, typecheck, production dependency audit; saved as the artifact `ci-evidence` (`junit.xml`, `audit.txt`, `gitleaks.txt`). `checks` is a required status check on `main`, so a failing run blocks the merge. Gate rules, thresholds and the PASS, BLOCK or INVESTIGATE outcomes: [quality strategy](../quality/quality-strategy.md). Evidence: [ci-gate-run.md](../quality/evidence/ci-gate-run.md), including the earlier run that failed at `npm ci` and stopped the pipeline (DF-07).

### 6. Quality strategy applied

Five quality risks were chosen mainly on impact and received stronger verification: Q1 role or ownership bypassed, Q2 public tracking leaks private data, Q3 lifecycle skipped or no resolution notes, Q4 audit trail incomplete or editable, Q5 concurrent edits lose a change. The reasoning, what was not prioritised and the cases are in the [quality strategy](../quality/quality-strategy.md); the coverage per risk is in the [RTM](../requirements/rtm.md) and one evidence note per risk is in [evidence/](../quality/evidence/) ([Q1](../quality/evidence/q1-role-and-ownership.md), [Q2](../quality/evidence/q2-public-tracking-privacy.md), [Q3](../quality/evidence/q3-lifecycle-and-resolution-notes.md), [Q4](../quality/evidence/q4-audit-trail.md), [Q5](../quality/evidence/q5-concurrent-edits.md)). Related risks: R-05, R-10, R-13, R-14.

### 7. Black-box, integration and system validation

- **Techniques:** decision tables (B1 who may unassign, B2 who may be assigned, A1 role by route), state transition (B3, every status pair), equivalence classes and boundary values (B4 resolution notes, B5 tracking ID format, rules tests). 71 black-box cases in `civic-connect/tests/blackbox/`.
- **API and integration:** 45 route-level cases in `civic-connect/tests/api/`, with negative cases for every 401, 403, 404, 409 and 422 answer.
- **System:** E1 and E2 (Playwright) and A4 (audit immutability) against Neon: [E1 and E2](../quality/evidence/e1-e2-end-to-end-run.md), [A4](../quality/evidence/q4-audit-immutability-run.md). Each note says what the run does not show.
- **Traceability:** requirement to acceptance criterion to test to result in the [RTM](../requirements/rtm.md).

### 8. Performance and reliability

One scenario, P1: 20 signed-in staff users for 30 seconds on the all-requests list, 215 requests, free-tier Neon branch. Result: 0 failures, median 1338 ms, 95th percentile 2067 ms against the 2000 ms target: **fail by 67 ms**, recorded as found and not retried until it passed ([evidence](../quality/evidence/p1-performance-run.md), DF-08, [TD-16](../quality/technical-debt-register.md), R-07). Reliability: a stale version answers 409 and saves nothing (Q5, R-10); a failed save returns a safe 500 message without detail.

### 9. Defects and quality interpretation

[Defect Register](../quality/defect-register.md): 8 entries, 7 closed, 1 open (DF-08). Findings and what they mean: DF-05 (a missing role test found while writing Q1), DF-07 (the gate stopping a broken lockfile), DF-08 (performance). Debt: [TD-01 to TD-16](../quality/technical-debt-register.md), with TD-15 repaid by the CI additions.

### 10. Release readiness

[Release Evidence Summary](../quality/release-evidence-summary.md): **CONDITIONALLY READY**. No known release blocker. Conditions: the release is a student increment and not for real citizen data; A4, E1, E2 and CI are repeated on the exact `m3-rc1` commit. Accepted limitations and the residual risk table are in the summary.


## 12.2 Baseline Verification Checklist (M1)

| Review Area | Verification Criterion | Audit Status | Evidence / Location |
|---|---|---|---|
| **Problem & Stakeholder Alignment** | Core operational problems from the project brief are analysed and mapped to stakeholder needs and conflict reconciliations. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Problem and Business Need Analysis |
| **Scope Baseline & Defence** | In-scope, out-of-scope, and deferred boundaries are documented with formal defence justifications. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Scope Baseline |
| **Requirements & Acceptance Criteria** | Functional and Non-Functional Requirements possess unique IDs and testable acceptance criteria. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Requirements And Acceptance Criteria |
| **Traceability Foundation** | Initial RTM maps problem references to requirement IDs, acceptance criteria, and testing strategies. | **VERIFIED** | [RTM v2.0](../requirements/rtm.md) |
| **Constraints Analysis** | Scope, schedule, cost, quality, and security constraints are recorded along with engineering implications and trade-offs. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Constraints |
| **Risk & Decision Governance** | Risk register contains cause-based risks, mitigations, and contingencies. ADR-0002 formally defers tech-stack selection to M2. | **VERIFIED** | [Risk Register](../risk/risk-register.md), [Decision Log](../decisions/) |
| **Forward Engineering & DevOps** | Architectural concerns (hosting, data persistence, access control, CI/CD) are analysed for downstream impacts. | **VERIFIED** | [Forward Engineering Considerations](forward-engineering-considerations.md) |
| **Repository & Team Governance** | Protected main branch rules, 2-reviewer PR policies, and template controls are enforced. | **VERIFIED** | [CONTRIBUTING.md](../../CONTRIBUTING.md) |
| **Responsible AI Usage** | All material AI tool interactions are logged with independent human verification methods and outcomes. | **VERIFIED** | [AI Usage Register](../ai-usage-register.md) |

## 12.3 Formal Gate Outcome & Determination (M1)

**GATE OUTCOME: ACCEPTED**

**Gate Determination Rationale:** The project engineering baseline defined in PED v1.0 satisfies all required baseline gate expectations for Milestone 1. Requirements are traceable, risks and constraints are comprehensively analysed, and repository governance protocols are fully operational. The team is formally cleared to proceed to **Milestone 2 (Architecture & System Design)**.

## 12.4 Engineering Team Signatures & Authorization (M1)

By signing below, the engineering team members certify that the contents of PED v1.0 represent an accurate, agreed-upon baseline and commit to adhering to the established team governance policies.

| Student Name | Student ID | Signature | Date |
|---|---|---|---|
| **Mark Minnaar** | 602267 | *M. Minnaar* | 09/09/2026 |
| **Armand Erasmus** | 601631 | *A. Erasmus* | 09/09/2026 |
| **Ruan Jordaan** | 601715 | *R. Jordaan* | 09/09/2026 |

---

## PED v2.0 Integration and Baseline Sign-off Gate

**Integration approach:** PED v2.0 folds the M2 architecture and technology-stack baseline (Architecture Overview, ADR-0004 to ADR-0007), the expanded Risk Register (R-07 to R-11) and Decision Log, the RTM's architecture/implementation/verification columns, CR-001 to CR-005, and the updated GitHub governance evidence into the M1 baseline without silently overwriting it — all superseded M1 content stays visible above, and every change is tracked through the [Change Control table](../change/change-control.md).

**Known gap:** the Data and Persistence Baseline (brief section 5.4) is not yet complete — deferred past this submission due to time constraints, logged here rather than left unmentioned. See [docs/architecture/data-persistence-baseline.md](../architecture/data-persistence-baseline.md). Update (October 2026): the baseline has since been written.

**Sign-off:** this M2 baseline (architecture, technology stack and initial design) is approved for implementation by Team M — Ruan Jordaan (601715), Mark Minnaar (602267), Armand Erasmus (601631) — pending the usual PR-review process for any further change.

---

## M3 Progress: Authentication (auth branch, 13 October 2026)

First slice of the M3 integrated increment. Evidence index; the detail stays in the linked artefacts.

- **Scope and change:** FR-001 (requester sign-up and sign-in) and NFR-004; [CR-009](../change/change-control.md).
- **Implementation:** `civic-connect/lib/auth/`, `civic-connect/app/api/auth/` (register, login, logout), `civic-connect/components/auth/`. Row status in the [RTM](../requirements/rtm.md): FR-001 and NFR-004 In Development (the request submission route and field encryption are still to come).
- **Decision:** [ADR-06](../decisions/0009-signed-cookie-sessions-with-jose.md) (ED-07), signed-cookie sessions with `jose`; [architecture](../architecture/architecture.md) section "Authentication and Session Design".
- **Verification:** 25 automated tests in `civic-connect/tests/` (`npm test`, all passing on 13 October 2026), listed with their requirement basis in the RTM "Test evidence" section. The CI workflow runs them on every pull request.
- **Risk:** [R-13](../risk/risk-register.md) mitigation implemented and tested; R-05 stays open.
- **Debt and limits:** [Technical Debt Register](../quality/technical-debt-register.md) (TD-01 to TD-09).
- **AI use:** logged in the [AI Usage Register](../ai-usage-register.md).

## M3 Progress: Staff slice (staff branch, 16 October 2026)

Evidence index for the staff features; the detail stays in the linked artefacts.

- **Scope and change:** FR-004 to FR-006 and FR-008, with FR-002 and the manager role clarified; [CR-011 to CR-014](../change/change-control.md) (three queue views, managers cannot hold requests and unassign added, department read through the category, audit written inside the service transaction).
- **Implementation:** `civic-connect/lib/requests/` (`service.ts`, `actionRoute.ts`), `civic-connect/lib/states/`, `civic-connect/lib/decorators/auditDecorator.ts`, `civic-connect/app/api/requests/[trackingId]/` (assign, unassign, status), `civic-connect/app/(staff)/queue/`, `civic-connect/components/staff/`; migrations `0002` (lookup indexes) and `0003` (drop `assigned_department_id`). Row status in the [RTM](../requirements/rtm.md): FR-002, FR-004, FR-005, FR-006 and FR-008 In Development (run by hand against Neon on 16 October 2026 without problems; no recorded end-to-end test yet).
- **Decisions:** [ADR-01](../decisions/0004-state-pattern-service-request-lifecycle.md) and [ADR-02](../decisions/0005-decorator-pattern-audit-logging.md) now built (ADR-02 as a transaction-passing function, CR-014); [ADR-03](../decisions/0006-direct-in-process-routing-call.md) simplified, no routing step; [architecture](../architecture/architecture.md) section "Staff Workflow API".
- **Verification:** 90 automated tests in 14 files, all passing on 16 October 2026 (`npm test`), with their requirement basis in the RTM "Test evidence" section; lint and type check clean. The queue screens have no automated test and no end-to-end test is recorded yet (TD-10).
- **Risk:** R-10 mitigation implemented and tested; R-05 probability reduced ([status notes](../risk/risk-register.md)).
- **Debt and limits:** [Technical Debt Register](../quality/technical-debt-register.md) (TD-10 to TD-14 added, TD-07 closed).
- **AI use:** to be logged in the [AI Usage Register](../ai-usage-register.md) by the team members who used it.

## M3 Progress: Quality strategy and CI quality gate (quality-gates branch, 16 October 2026)

Evidence index for M3 work plan step 4 (select quality risks) and the CI quality gate; the detail stays in the linked artefacts.

- **Scope and change:** [CR-015](../change/change-control.md). No change to requirements or acceptance criteria.
- **Quality risks:** five risks chosen mainly on impact and recorded with the reasoning chain in the [Quality Strategy](../quality/quality-strategy.md): Q1 role or ownership rule bypassed, Q2 public tracking page leaks private data, Q3 lifecycle skipped or resolved without notes, Q4 audit trail incomplete or editable, Q5 concurrent edits lose a change. Related register entries: R-05, R-10, R-13. The strategy also lists what was considered and not prioritised.
- **Quality gate:** one required CI job, `checks`, with thresholds fixed in advance and the outcomes PASS, BLOCK or INVESTIGATE. In place today: lint, the 184 automated tests, build, typecheck and the production-dependency audit. Added in the workflow on 16 October 2026 and confirmed by a green run the same day: a skipped-test guard, a gitleaks secrets scan over the full history, and the saved test, audit and scan output (artifact `ci-evidence`). A coverage report is left out. The required-check setting on `main` is a repository setting. Policies: no rerun until green, a skipped test is a failure, a test is never changed just to agree with the code.
- **Release-quality evidence (outside the gate):** the audit-immutability check on Neon (A4), two end-to-end journeys (E1, E2) and one performance scenario (P1), run by hand before the release candidate is tagged and saved with the commit SHA under `docs/quality/evidence/` (A4 was run on a Neon branch on 16 October 2026 and passed, [evidence](../quality/evidence/q4-audit-immutability-run.md), to be repeated before tagging; E1 and E2 are Playwright tests that passed on a Neon branch on 16 October 2026, [evidence](../quality/evidence/e1-e2-end-to-end-run.md), to be repeated on the release candidate; P1 was run on 16 October 2026 and failed its target by 67 ms, see the evidence).
- **Verification state:** 18 cases are defined; 14 exist (U1 to U6, B1 to B5, A1 to A3), A4 has been run (passed), E1 and E2 (Playwright) were run on a Neon branch and passed, and P1 was run and failed its target (95th percentile 2067 ms against 2000 ms, [evidence](../quality/evidence/p1-performance-run.md)). Q1 to Q5 are covered at gate level (evidence: [Q1](../quality/evidence/q1-role-and-ownership.md), [Q2](../quality/evidence/q2-public-tracking-privacy.md), [Q3](../quality/evidence/q3-lifecycle-and-resolution-notes.md), [Q4](../quality/evidence/q4-audit-trail.md), [Q5](../quality/evidence/q5-concurrent-edits.md)); the end-to-end evidence (E1, E2) has since been run and passed and the performance exercise (P1) has been run and missed its target; see the M3 Evidence Index above. Coverage of each risk is in the RTM "Quality risk coverage" section.
- **Risk:** [R-14](../risk/risk-register.md) added (hand-run evidence may be skipped or stale); R-01 reduced further.
- **Debt and limits:** [TD-15](../quality/technical-debt-register.md) added (the gate does not yet block skipped tests or committed secrets); the repayment notes for TD-05, TD-06 and TD-10 now point to A4, E1 and E2.
- **AI use:** to be logged in the [AI Usage Register](../ai-usage-register.md) by the team members who used it.

## Version History

- **v1.0** (9 September 2026) — Milestone 1 baseline, originally submitted as a Word document, migrated into this repository as Markdown.
- **v2.0** (30 September 2026) — Architecture, technology-stack and initial design baseline added (ADR-0004 to ADR-0007); RTM, Risk Register and Decision Log extended; Change Control log introduced for CR-001 to CR-005; GitHub governance updated to match the live repository. Data/Persistence Baseline deferred, logged as an open item.
- **v3.0** (13 to 16 October 2026) — M3 evidence index and submission. Begun 13 October: CR-006 to CR-009 applied, requester sign-up and sign-in with signed-cookie sessions (ADR-06, ED-07), Next.js upgrade and audit gate (ED-06, R-12), new risk R-13, Technical Debt Register and AI Usage Register entries. 14 October: architectural style changed from a modular monolith to a plain layered monolith (CR-010): ADR-05 revised, ADR-03 superseded, Figure 1, traceability, NFR table and ED-04/ED-05 amended; RTM updated for the requester slice. 16 October: staff slice (CR-011 to CR-014), quality strategy and a single CI quality gate (CR-015), quality evidence for Q1 to Q5, A4, E1, E2 and P1, the Defect Register, the release-candidate verification notes, the Release Evidence Summary and the submission block. The working label v3.1 used on the branch before submission is folded into v3.0, the version the brief names; no content was removed.

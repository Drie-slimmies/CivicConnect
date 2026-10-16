# Project Engineering Document (PED)

**Project Name:** CivicConnect Community Service Request Management Platform
**Document Identifier:** Project Engineering Document (PED) v3.1 (M3 evidence index, in progress)
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
- **Quality gate:** one required CI job, `checks`, with thresholds fixed in advance and the outcomes PASS, BLOCK or INVESTIGATE. In place today: lint, the 90 automated tests, build, typecheck and the production-dependency audit. Planned: a skipped-test guard, a secrets scan, saved test and audit evidence, and a coverage report. Policies: no rerun until green, a skipped test is a failure, a test is never changed just to agree with the code.
- **Release-quality evidence (outside the gate):** the audit-immutability check on Neon (A4), two end-to-end journeys (E1, E2) and one performance scenario (P1), run by hand before the release candidate is tagged and saved with the commit SHA under `docs/quality/evidence/` (planned).
- **Verification state:** 18 cases are defined; 8 exist (U1 to U6, A3 and part of A1) and 10 are planned (B1 to B5, A2, A4, E1, E2, P1). The M3 baseline for black-box, end-to-end and performance evidence is therefore not met yet. Coverage of each risk is in the RTM "Quality risk coverage" section.
- **Risk:** [R-14](../risk/risk-register.md) added (hand-run evidence may be skipped or stale); R-01 reduced further.
- **Debt and limits:** [TD-15](../quality/technical-debt-register.md) added (the gate does not yet block skipped tests or committed secrets); the repayment notes for TD-05, TD-06 and TD-10 now point to A4, E1 and E2.
- **AI use:** to be logged in the [AI Usage Register](../ai-usage-register.md) by the team members who used it.

## Version History

- **v1.0** (9 September 2026) — Milestone 1 baseline, originally submitted as a Word document, migrated into this repository as Markdown.
- **v2.0** (30 September 2026) — Architecture, technology-stack and initial design baseline added (ADR-0004 to ADR-0007); RTM, Risk Register and Decision Log extended; Change Control log introduced for CR-001 to CR-005; GitHub governance updated to match the live repository. Data/Persistence Baseline deferred, logged as an open item.
- **v3.0** (13 October 2026) — M3 evidence index begun: CR-006 to CR-009 applied, requester sign-up and sign-in with signed-cookie sessions (ADR-06, ED-07), Next.js upgrade and audit gate (ED-06, R-12), new risk R-13, Technical Debt Register and AI Usage Register entries, RTM test evidence for the authentication branch.
- **v3.1** (14 October 2026) — architectural style changed from a modular monolith to a plain layered monolith (CR-010): ADR-05 revised, ADR-03 superseded, Figure 1, traceability, NFR table and ED-04/ED-05 amended; RTM updated for the requester slice (FR-001 to FR-003); staff slice built and logged as CR-011 to CR-014 (queue views, assign, unassign, status changes, audit rows, lookup indexes, department read through the category); quality strategy and a single CI quality gate defined (CR-015). The final version number is set at release.

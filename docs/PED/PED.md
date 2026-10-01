# Project Engineering Document (PED)

**Project Name:** CivicConnect Community Service Request Management Platform
**Document Identifier:** Project Engineering Document (PED) v2.0
**Target Baseline:** Milestone 2 Baseline Gate (Architecture, Technology & Initial Design Baseline)
**Team Identifier:** Group M (Drie-slimmies)

> This is the living engineering document for CivicConnect. It started as a Word document for Milestone 1; per lecturer feedback after the M1 presentation, it now lives here as version-controlled Markdown. PED v2.0 extends the same document, it does not replace or silently overwrite the M1 baseline below; every change made to baselined M1 content is tracked in the [Change Control log](../change/change-control.md).

## Contents

**M1 baseline (unchanged except where logged in Change Control):**
- [Requirements Baseline](../requirements/requirements.md) — problem & business need, stakeholder analysis, scope baseline, functional/non-functional requirements, constraints
- [Forward Engineering Considerations](forward-engineering-considerations.md)

**M2 additions:**
- [RTM v2.0](../requirements/rtm.md)
- [Risk Register](../risk/risk-register.md) (R-01 to R-11)
- [Engineering Decision Log](../decisions/) — ADR-0001 to ADR-0007
- [Change Control](../change/change-control.md) — CR-001 to CR-005
- [Architecture Overview](../architecture/architecture.md)
- [ASRs and Quality Drivers](../quality/quality-drivers.md)
- [Deployment Direction and Compatibility](../deployment/deployment.md)
- [Data and Persistence Baseline](../architecture/data-persistence-baseline.md) — **not yet written, deferred past the M2 deadline, logged as a known gap**
- [GitHub Governance and Team Repository Controls](../../CONTRIBUTING.md)
- [AI Usage Register](../ai-usage-register.md)

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

**Known gap:** the Data and Persistence Baseline (brief section 5.4) is not yet complete — deferred past this submission due to time constraints, logged here rather than left unmentioned. See [docs/architecture/data-persistence-baseline.md](../architecture/data-persistence-baseline.md).

**Sign-off:** this M2 baseline (architecture, technology stack and initial design) is approved for implementation by Team M — Ruan Jordaan (601715), Mark Minnaar (602267), Armand Erasmus (601631) — pending the usual PR-review process for any further change.

---

## Version History

- **v1.0** (9 September 2026) — Milestone 1 baseline, originally submitted as a Word document, migrated into this repository as Markdown.
- **v2.0** (30 September 2026) — Architecture, technology-stack and initial design baseline added (ADR-0004 to ADR-0007); RTM, Risk Register and Decision Log extended; Change Control log introduced for CR-001 to CR-005; GitHub governance updated to match the live repository. Data/Persistence Baseline deferred, logged as an open item.

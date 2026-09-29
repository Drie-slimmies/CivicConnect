# Project Engineering Document (PED)

**Project Name:** CivicConnect Community Service Request Management Platform
**Document Identifier:** Project Engineering Document (PED) v1.0
**Target Baseline:** Milestone 1 Baseline Gate (Engineering Foundation & Requirements Baseline)
**Submission Date:** 9 September 2026
**Team Identifier:** Group M

> This is the living engineering document for CivicConnect. It was originally produced as a single Word document for Milestone 1; per lecturer feedback after the M1 presentation, it now lives here as version-controlled Markdown so the repository itself shows authentic, ongoing engineering progression rather than a static file re-uploaded before each deadline.

## Contents

- [Requirements Baseline](../requirements/requirements.md) — problem & business need, stakeholder analysis, scope baseline, functional/non-functional requirements, constraints
- [Initial RTM](../requirements/rtm.md)
- [Initial Risk Register](../risk/risk-register.md)
- [Engineering Decision Log](../decisions/) — ADR-0001, ADR-0002, ADR-0003
- [Forward Engineering Considerations](forward-engineering-considerations.md)
- [GitHub Governance and Team Repository Controls](../../CONTRIBUTING.md)
- [AI Usage Register](../ai-usage-register.md)

## 12.2 Baseline Verification Checklist

| Review Area | Verification Criterion | Audit Status | Evidence / Location |
|---|---|---|---|
| **Problem & Stakeholder Alignment** | Core operational problems from the project brief are analysed and mapped to stakeholder needs and conflict reconciliations. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Problem and Business Need Analysis |
| **Scope Baseline & Defence** | In-scope, out-of-scope, and deferred boundaries are documented with formal defence justifications. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Scope Baseline |
| **Requirements & Acceptance Criteria** | Functional and Non-Functional Requirements possess unique IDs and testable acceptance criteria. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Requirements And Acceptance Criteria |
| **Traceability Foundation** | Initial RTM maps problem references to requirement IDs, acceptance criteria, and testing strategies. | **VERIFIED** | [Initial RTM](../requirements/rtm.md) |
| **Constraints Analysis** | Scope, schedule, cost, quality, and security constraints are recorded along with engineering implications and trade-offs. | **VERIFIED** | [Requirements Baseline](../requirements/requirements.md) — Constraints |
| **Risk & Decision Governance** | Risk register contains cause-based risks, mitigations, and contingencies. ADR-0002 formally defers tech-stack selection to M2. | **VERIFIED** | [Risk Register](../risk/risk-register.md), [Decision Log](../decisions/) |
| **Forward Engineering & DevOps** | Architectural concerns (hosting, data persistence, access control, CI/CD) are analysed for downstream impacts. | **VERIFIED** | [Forward Engineering Considerations](forward-engineering-considerations.md) |
| **Repository & Team Governance** | Protected main branch rules, 2-reviewer PR policies, and template controls are enforced. | **VERIFIED** | [CONTRIBUTING.md](../../CONTRIBUTING.md) |
| **Responsible AI Usage** | All material AI tool interactions are logged with independent human verification methods and outcomes. | **VERIFIED** | [AI Usage Register](../ai-usage-register.md) |

## 12.3 Formal Gate Outcome & Determination

**GATE OUTCOME: ACCEPTED**

**Gate Determination Rationale:** The project engineering baseline defined in PED v1.0 satisfies all required baseline gate expectations for Milestone 1. Requirements are traceable, risks and constraints are comprehensively analysed, and repository governance protocols are fully operational. The team is formally cleared to proceed to **Milestone 2 (Architecture & System Design)**.

## 12.4 Engineering Team Signatures & Authorization

By signing below, the engineering team members certify that the contents of PED v1.0 represent an accurate, agreed-upon baseline and commit to adhering to the established team governance policies.

| Student Name | Student ID | Signature | Date |
|---|---|---|---|
| **Mark Minnaar** | 602267 | *M. Minnaar* | 09/09/2026 |
| **Armand Erasmus** | 601631 | *A. Erasmus* | 09/09/2026 |
| **Ruan Jordaan** | 601715 | *R. Jordaan* | 09/09/2026 |

---

## Version History

- **v1.0** (9 September 2026) — Milestone 1 baseline, originally submitted as a Word document, migrated into this repository as Markdown.
- **v2.0** (Milestone 2, in progress) — will extend this same document with architecture, data, technology and design-pattern decisions per the M2 brief. Not a new/separate report.

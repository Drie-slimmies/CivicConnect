# RTM v2.0 (Evolving Requirements Traceability Matrix)

> Supersedes the M1 RTM. IDs realigned with the requirements table per CR-001; architecture/implementation/verification columns added for M2.

| Problem/ Brief Reference   | Requirement ID | Requirement Summary              | Acceptance Criteria ID | How we will test it       | Architecture/Design Decision                     | Implementation Reference           | Verification Status | UI Reference |
| -------------------------- | -------------- | -------------------------------- | ---------------------- | ------------------------- | ------------------------------------------------ | ---------------------------------- | ------------------- | --- |
| Brief: Lost Requests       | FR-001         | Single Request Submission Form   | AC-REQ-01              | Integrating Testing       | Modular Monolith/ Web API Controller             | App/api/request/route.ts           | Planned             | app/(requester)/requests/new/page.tsx |
| Brief: No visibility       | FR-003         | Public Status Tracking Lookup    | AC-REQ-02              | UI/Functional Testing     | Read Only DTO Query/Caching Strategy             | Lib/db/queries/requests.ts         | Planned             | app/track/page.tsx; app/(requester)/requests/page.tsx |
| Brief: Unstructured Work   | FR-004         | Staff Task Filtering and Sorting | AC-STF-01              | User Acceptance Testing   | In Process Mediator Pattern                      | lib/events/handlers/assignStaff.ts | Planned             | app/(staff)/queue/page.tsx |
| Brief: Weak Accountability | FR-006         | Mandatory Resolution Notes       | AC-STF-03              | Automated Unit/API Test   | State Design Pattern                             | Lib/states/inProgressState.ts      | Planned             | app/(staff)/queue/[trackingId]/page.tsx |
| Brief: Compliance Risks    | NFR-004        | POPIA Data Encryption            | AC-SEC-02              | Security Code Review      | Schema Level Encryption/ Least Privilege DB Role | Lib/db/schema.ts                   | In Development      | n/a (no UI) |
| Brief: Audit Gaps          | FR-008         | Immutable Audit Trail Logging    | AC-AUD-01              | Database Integration Test | Decorator Design Pattern                         | Lib/decorators/auditDecorator.ts   | Planned             | app/(manager)/audit/page.tsx |

Note: verification status must be confirmed against the actual state of
the repository before submission - a row should read "Planned / Not Yet
Implemented" rather than "In Development" if the referenced file does
not yet exist in Drie-slimmies/CivicConnect, per the M2
evidence-completeness rule.

UI Reference: route stubs only (heading placeholders, no functionality) exist on the Frontend branch. Verification Status stays Planned until the screen is built and tested.

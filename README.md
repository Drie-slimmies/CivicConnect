# CivicConnect

Community service request management platform, built for SEN381 (Group M: Mark Minnaar 602267, Armand Erasmus 601631, Ruan Jordaan 601715).

## Project documentation

- [Project Engineering Document (PED)](docs/PED/PED.md) — the living engineering document. Started as PED v1.0 at Milestone 1, extended in place for each milestone rather than replaced.
- [Requirements Baseline](docs/requirements/requirements.md)
- [RTM v2.0](docs/requirements/rtm.md)
- [Risk Register](docs/risk/risk-register.md)
- [Engineering Decision Log (ADRs)](docs/decisions/)
- [Change Control](docs/change/change-control.md)
- [Architecture Overview](docs/architecture/architecture.md)
- [ASRs and Quality Drivers](docs/quality/quality-drivers.md)
- [Quality Strategy and Quality Gate](docs/quality/quality-strategy.md)
- [Deployment Direction and Compatibility](docs/deployment/deployment.md)
- [Data and Persistence Baseline](docs/architecture/data-persistence-baseline.md)
- [Technical Debt Register](docs/quality/technical-debt-register.md)
- [AI Usage Register](docs/ai-usage-register.md)
- [Contributing / Repository Governance](CONTRIBUTING.md)

## Status

Milestone 1 (Engineering Foundation & Requirements Baseline) complete. Milestone 2 (Architecture, Technology & Initial Design Baseline) baseline added, including the Data/Persistence Baseline. Milestone 3 (Controlled Construction, Integration, Quality & Release Readiness) is in progress: requester sign-up, sign-in and role-based sessions, the requester slice (submit a request, my requests, request details, public tracking), the manager dashboard and audit log, and the staff slice (queue views, assign, unassign, status changes with resolution notes) are built and tested (90 automated tests); the quality strategy and CI quality gate are defined ([Quality Strategy](docs/quality/quality-strategy.md)); the gate additions, black-box, end-to-end, performance and staging evidence are still to come. The architecture is a plain layered monolith (CR-010). See [civic-connect/README.md](civic-connect/README.md) for setup.

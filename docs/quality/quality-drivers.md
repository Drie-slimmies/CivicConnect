# Architecturally Significant Requirements (ASRs) and Quality Drivers

The following non-functional requirements are treated as ASRs because
they materially shaped the architecture, technology and design decisions
below, rather than being generic quality statements.

| **ASR**                        | **Measurable driver**                                                                 | **Where it drives a decision**                                                                                                                                                                           |
|--------------------------------|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NFR-001 Performance            | Page loads and search queries return in under 2 seconds (Lighthouse stress tests).    | Neon serverless Postgres + Drizzle over the WebSocket Pool driver (ADR-04); scale-to-zero cold start is logged as a trade-off (R-09) precisely because it threatens this target.                         |
| NFR-002 Availability           | System uptime above 99% during operating hours (automated endpoint monitoring).       | Serverless hosting for the Next.js tier (no single always-on process to keep alive); Neon's managed HA over a self-hosted Postgres instance.                                                             |
| NFR-003 Usability / mobile     | UI supports viewports down to 360px width (browser dev-tools layout testing).         | Next.js App Router with server + client components chosen partly for its built-in responsive rendering path (ADR-04); revisited at UI-implementation time.                                               |
| NFR-004 POPIA / access control | Personal data visible only to the authorised requester and authorised staff/managers. | Drives the multi-layer validation in the data/persistence baseline (role-based checks at the application layer, constraints at the database layer) and the Decorator-based audit trail (ADR-02, FR-008). |

FR-006 (controlled status transitions) and FR-008 (immutable audit
trail) are treated as architecturally significant functional
requirements: both forced the atomic, multi-step database transaction
described above, which is why the Neon WebSocket Pool driver was
required over the simpler HTTP driver (ADR-04).


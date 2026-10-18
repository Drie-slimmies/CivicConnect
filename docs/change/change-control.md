# Change Control

> Controlled changes applied to the baselined M1 requirements during M2 (CR-001 to CR-005), to the M2 baseline during M3 (CR-006 to CR-015), and closing decisions recorded at M4 (CR-016), per PED v2.0's continuity rule: nothing is silently overwritten, every change is logged here.

<table>
<colgroup>
<col style="width: 7%" />
<col style="width: 17%" />
<col style="width: 17%" />
<col style="width: 19%" />
<col style="width: 17%" />
<col style="width: 20%" />
</colgroup>
<thead>
<tr class="header">
<th>ID</th>
<th>Change</th>
<th>Original</th>
<th>Change</th>
<th>Reason</th>
<th>Impact</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>CR-001</td>
<td>Aligned RTM IDs with requirements baseline</td>
<td>RTM used its own IDs which didn’t match requirements table</td>
<td>Use requirements table IDs as the only IDs</td>
<td>RTM requires stable IDs to trace requirements into development</td>
<td>Only in RTM, no scope</td>
</tr>
<tr class="even">
<td>CR-002</td>
<td>Merged public status lookup into FR-003</td>
<td>Requesters will be allowed to see a list of active requests with its
status</td>
<td>Two ways to see requests, authenticated users will see a list of
their own and single requests can be seen when entering request tracking
ID</td>
<td>Public lookup page was in scope table for PED v1.0 but had no
FR</td>
<td>Adds a public, unauthenticated route, that’s a security boundary
where tracking IDs must be non-sequential</td>
</tr>
<tr class="odd">
<td>CR-003</td>
<td>Define request status model</td>
<td>Only mentioned “valid state transitions” but never defined the
states</td>
<td><p>Valid path:</p>
<p>Submitted -&gt; Assigned -&gt;</p>
<p>In Progress -&gt;</p>
<p>Resolved -&gt;</p>
<p>Closed</p></td>
<td>State pattern design, DB status check and tests need a fixed set of
stages</td>
<td>FR-005 (assigning a request -&gt; assigned), FR-006, FR-008 (every
transition is audited) and overall schema</td>
</tr>
<tr class="even">
<td>CR-004</td>
<td>Removed “Overdue” from FR-007</td>
<td>Showed that overdue requests will be showed</td>
<td>Summaries of only open, total, resolved and closed</td>
<td>No defined needs for time limits on requests</td>
<td>Kept mention in Analysis and stakeholder matrix, added to deferred
scope along with the mention of a forward engineering
consideration.</td>
</tr>
<tr class="odd">
<td>CR-005</td>
<td>Added security NFR</td>
<td>RTM showed POPIA encryption with no matching NFR</td>
<td>New NFR-004 shows how personal data will be handled</td>
<td>Fills gap left by CR-001 that ensures that public tracking page is
secure</td>
<td>Added assurance for public tracking page to stakeholders.</td>
</tr>
<tr class="even">
<td>CR-006</td>
<td>Narrowed the ADR-03 handler scope (M3)</td>
<td>On ticket creation the handler assigned a staff member using a GIS-boundary lookup</td>
<td>The handler only routes the request to the department for its category; status stays Submitted until staff assign it; no GIS lookup; the department is stored on the request and shown as a label (no department filtering)</td>
<td>GIS route planning is deferred scope, and auto-assigning would contradict FR-001 (status set to Submitted) and FR-005 (assignment changes status to Assigned)</td>
<td>ADR-03 and the integration decision are amended; a handler failure still rolls back with the creating write; a department field is added to the request at the database migration step</td>
</tr>
<tr class="odd">
<td>CR-007</td>
<td>Removed GPS coordinates and urgency score (M3)</td>
<td>IssueCreatedEvent carried GPS coordinates and an urgency score; the data model had matching fields</td>
<td>Both removed: location is free text and urgency is not captured; the queue sorts by date and status</td>
<td>No requirement defines either; GPS only served the deferred GIS lookup and nobody was defined to set urgency</td>
<td>The event carries the issue ID and category only; the matching schema fields are removed at the database migration step</td>
</tr>
<tr class="even">
<td>CR-008</td>
<td>Defined the fields on the public tracking page (M3)</td>
<td>CR-002 added the public lookup but did not say which fields it shows</td>
<td>The public page shows only the tracking ID, category, status, dates and status history; the title, description, location and names are never shown</td>
<td>NFR-004 limits personal data to the requester and authorised staff, and free-text titles can contain personal details</td>
<td>FR-003 and NFR-004 are updated; the public lookup query returns only these fields and a test checks that no other field is returned</td>
</tr>
<tr class="odd">
<td>CR-009</td>
<td>Added requester self-registration (M3)</td>
<td>Accounts were to be created only by a seed script; FR-001 said authenticated users but not how a requester gets an account</td>
<td>Anyone can sign up with a name, email and password and always becomes a requester; staff and manager accounts stay seeded; password reset and email verification are deferred</td>
<td>Requesters must be able to use the system without an administrator creating their account, and no admin screen exists</td>
<td>FR-001 and its acceptance criterion are extended; NFR-004 now covers stored emails and names; new risk R-13; negative tests for duplicate email, short password and role injection</td>
</tr>
<tr class="even">
<td>CR-010</td>
<td>Changed architectural style to a plain layered monolith (M3, approved)</td>
<td>ADR-05 decided a modular monolith with domain modules communicating only through in-process events; ADR-03 specified a Mediator and RouteToDepartmentHandler</td>
<td>Plain layered monolith: one deployable, one database, code organised by layer and feature area. No domain modules, event bus or handler; category-to-department routing is a direct call in the request service within the same transaction</td>
<td>Team decision for a 3-person team with four fixed milestones: the event pattern and module boundaries were not built and would not be finished by M3/M4; the modular and plain options were compared in ADR-05 and give the same atomicity (FR-006/FR-008) and performance (NFR-001), so the simpler design wins on build cost; the price is that feature boundaries are no longer enforced (review and the layer structure are the controls)</td>
<td>ADR-03 superseded; ADR-05, Figure 1, the architecture section, traceability, NFR table and ED-04/ED-05 amended. No change to requirements or acceptance criteria. Repo cleanup: the empty event stubs (lib/events/eventEmitter.ts and lib/events/handlers/assignStaff.ts) are removed; the empty State and Decorator stubs stay, because ADR-01 and ADR-02 still apply and are built in the Staff slice</td>
</tr>
<tr class="odd">
<td>CR-011</td>
<td>Split the staff queue into Unassigned, My requests and All requests (M3)</td>
<td>FR-004: one queue showing all requests, with search, status and category filters and a date sort</td>
<td>Three views. Unassigned: open requests nobody holds (status Submitted). My requests: every request assigned to the signed-in staff member (staff only). All requests: every request, for staff, managers and admins. Search, category filter and date sort stay on each view; the status filter is on My requests and All requests</td>
<td>Staff want the work they can take separated from the work they already hold; managers cannot hold requests (CR-012) but still need to see all work in flight, and FR-004 requires that any request can be opened</td>
<td>FR-004 text, acceptance criterion and RTM row updated; three queue routes and the queries listUnassignedRequests, listRequestsAssignedTo and listAllRequests; no change to the data model</td>
</tr>
<tr class="even">
<td>CR-012</td>
<td>Managers and admins cannot be assignees; added Unassign (M3)</td>
<td>FR-005: assign a ticket to themselves or other authorised staff members; the Security constraint said a manager can do everything staff can; there was no way to take a request back</td>
<td>Only accounts with the staff role can be assigned a request. Managers and admins can assign and transfer requests to staff but never to themselves. A new Unassign action returns an Assigned or In progress request to Submitted with nobody assigned: managers and admins can unassign any request, staff only their own. It is audited as "unassigned" and the progress timeline steps back to Submitted</td>
<td>Managers oversee how work flows and should not hold requests; staff need to hand back work they cannot do, and managers need to free a request when someone is unavailable</td>
<td>FR-005 text and acceptance criterion, the Manager bullet in the Security constraint and the RTM row updated; new endpoint POST /api/requests/[trackingId]/unassign; new audit action "unassigned"; Resolved and Closed requests cannot be unassigned; the PED Word wording of FR-005 and the Security constraint must be aligned</td>
</tr>
<tr class="odd">
<td>CR-013</td>
<td>Department comes from the category; removed assigned_department_id (M3)</td>
<td>CR-006 and CR-010: the request service sets the department on the request in the creation transaction, and the department is stored on the request and shown as a label</td>
<td>Each category belongs to exactly one department (categories.department_id), so a request's department is read through its category. The column service_requests.assigned_department_id is dropped (migration 0003) and no routing step is built</td>
<td>The department can always be derived from the category, so storing it again duplicated the data and added a write to the creation transaction that could disagree with the category</td>
<td>ADR-03 amended again (nothing to build); the department wording in CR-006 and CR-010 no longer applies; FR-002 row, architecture section, data and persistence baseline and ER diagram updated; no change to acceptance criteria</td>
</tr>
<tr class="even">
<td>CR-014</td>
<td>Audit logging built as a transaction-passing function, not a wrapper class (M3)</td>
<td>ADR-02: an AuditServiceDecorator class wraps the service and writes the audit log before and after the core logic</td>
<td>logAuditAction(tx, ...) in lib/decorators/auditDecorator.ts is called by the request service inside its own transaction, so the status change and its audit row commit or roll back together</td>
<td>A wrapper that runs around the service cannot share the service's transaction, which FR-006, FR-008 and ADR-04 require; passing the transaction in keeps audit writing in one file and out of the business rules in lib/states</td>
<td>ADR-02 gets an implementation note; the FR-008 row and the architecture text updated; every service action must call it, which the service tests check by asserting the audit row</td>
</tr>
<tr class="odd">
<td>CR-015</td>
<td>Quality strategy and a single CI quality gate defined (M3)</td>
<td>CONTRIBUTING.md described the CI workflow as lint, build, typecheck and a production-dependency audit (the test step was missing from the text); no document said which quality risks the tests protect or what makes a CI run pass or fail; the RTM "How we will test it" entries named methods only</td>
<td>docs/quality/quality-strategy.md added: five quality risks (Q1 to Q5), the test cases that verify them, one CI quality gate (the job "checks") with thresholds fixed in advance, and release-quality evidence (a database check, two end-to-end journeys, one performance scenario) kept outside the gate. CONTRIBUTING corrected to include the test step and to point to the strategy</td>
<td>M3 asks for risk-based verification and at least one CI check that blocks progression with thresholds defined in advance; a gate whose threshold is decided after seeing the result is not a gate</td>
<td>PED contents and progress section, RTM (quality risk coverage section and the FR-008 test method), risk register (R-14 and a status note), technical debt register (TD-15 and repayment notes), quality drivers and both READMEs updated. No change to requirements or acceptance criteria. The gate additions in ci.yml and the new tests are planned as separate pull requests</td>
</tr>
<tr class="even">
<td>CR-016</td>
<td>Frozen the M3 code for M4 submission; recorded DF-08, NFR-003 and NFR-004 as closing statuses rather than fixing or re-scoping them (M4, 18 October 2026)</td>
<td>The brief allows further coding at M4; no decision had been made on whether to apply the tested fix for DF-08 or to run a further NFR-004 (POPIA) review before the final submission</td>
<td>The application code stays identical to the `m3-rc1` commit. DF-08 (NFR-001 miss on the all-requests list) is recorded as an open, accepted limitation: a tested fix exists but is deliberately not applied. NFR-004 is recorded as Partially Met: access control and the public-page whitelist are verified, field encryption and the POPIA review are not done. NFR-003 is checked by hand at 360px and recorded as evidence, not as new development</td>
<td>Reopening the verified build to chase a 3.4% performance miss, or to add encryption this late, would need A4, E1 and E2 re-run on a new commit and risks introducing an unverified regression days before submission; the brief rewards honest evidence over a late patch that cannot be fully re-verified in time</td>
<td>RTM (NFR-003 row added), Defect Register (DF-08 wording), Technical Debt Register (Status column, TD-16), Risk Register (Status column, R-05/R-07/R-11/R-14), deployment.md (simulated production plus an evidence-based no-go for real personal data), PED v4.0 scope table and known limitations section</td>
</tr>
</tbody>
</table>

# Requirements Baseline

> Migrated from PED v1.0 (Word submission). Source content unchanged; reformatted into the repo's docs/ structure per lecturer feedback on Milestone 1 presentation.

# Problem and Business Need Analysis

## Core operational problems

Looking at section 2 in the project brief, it’s clear that the current
way municipal and community service request are handled is completely
fragmented. Right now, people use a mix of emails, phone calls, WhatsApp
messages, spreadsheets and paper notes.

From a software engineering perspective, this creates major data and
operational issues:

- Lost and duplicate requests: Because there isn’t one place where
  requests go, tickets easily get missed, forgotten or logged multiple
  times by different people.

- Zero visibility for users: Once someone submits an issue, they have no
  idea if anyone received it, who is working on it, or when it will be
  fixed.

- Work allocation confusion: Field workers and staff don’t have a single
  dashboard to sort, prioritize or claim tasks based on how urgent they
  are.

- No accountability or proof of work: Tasks will change without any
  notes explaining what was done or changed.

- Lack of management metrics: Managers can’t easily see information
  about outstanding, overdue and resolved work.

- Data privacy risks: Sharing citizen’s personal information over
  informal or unencrypted spreadsheets violates South Africa’s POPIA.

## Business Need and System Value

CivicConnect fixes these issues by creating a single, reliable web
system that manages the entire lifecycle of a request.

- Every issue is logged in one place with a unique tracking ID.

- Requesters can track progress, while field staff get an organized
  workspace to manage their jobs.

- Keeps personal data secure using Role-Based Access Control and logs an
  unchangeable audit history for management.

# Stakeholder Analysis

## Stakeholder Matrix

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 21%" />
<col style="width: 21%" />
<col style="width: 18%" />
<col style="width: 20%" />
</colgroup>
<thead>
<tr class="header">
<th>Role</th>
<th>Representative Group</th>
<th>Key Needs and Expectations</th>
<th>Influence/ Interest</th>
<th>Primary Concern</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Requester</td>
<td>Community Members, Facility Users, Staff Requesters</td>
<td>Request submission, tracking, status notifications resolution
feedback</td>
<td><p>Low Influence/</p>
<p>High Interest</p></td>
<td>Frictionless interface, accessibility on mobile/desktop, ease of
use</td>
</tr>
<tr class="even">
<td>Support Staff</td>
<td>Technicians, Maintenance Personnel, IT Support</td>
<td>Task queue, clearing tickets, status updates, work logging, request
history view</td>
<td><p>Medium Influence/</p>
<p>High Interest</p></td>
<td>Minimal administrative overhead, filtering by priority or
category</td>
</tr>
<tr class="odd">
<td>Management</td>
<td>Operations Managers, Department Heads</td>
<td>Activity dashboards, overdue alerts, performance analytics, audit
logs.</td>
<td><p>High Influence/</p>
<p>High Interest</p></td>
<td>Reporting accuracy, data integrity, accountability tracking</td>
</tr>
<tr class="even">
<td>System Administrator</td>
<td>IT OPS, Lead Developers</td>
<td>Role-Based Access Control, user provisioning, audit logging, system
maintenance</td>
<td><p>High Influence/</p>
<p>Medium Interest</p></td>
<td>System stability, security, operational costs limits</td>
</tr>
</tbody>
</table>

## Stakeholder Conflicts and Potential Reconciliation

- Requester Simplicity vs. Staff Data Requirements:

**Conflict:** Requesters want a simplified submission form that consists
of minimal mandatory fields compared to staff that require detailed
diagnostics with descriptions, category tagging and location details to
track relevant tickets efficiently.

**Reconciliation:** Essential fields will be marked as required for
requesters to complete where inputs required for more detailed
diagnostics will be set as optional.

- Real-time Notification Frequency vs. Limited Resource Constraints

**Constraint:** Requesters and management want instant, real-time
notifications when every minor shift occurs where the engineering team
is constrained to make use of only free or low-cost cloud tier
infrastructure.

**Reconciliation:** Requested real-time notifications will only be
implemented on relevant, primary status transitions.

# Scope Baseline 

## System Scope Boundaries

<table>
<colgroup>
<col style="width: 19%" />
<col style="width: 47%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>Scope Area</th>
<th>Features Included</th>
<th>Reason/Engineering Decision</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>In- Scope</td>
<td><ul>
<li><p>Public and internal request submission form</p></li>
<li><p>Request status lookup page</p></li>
<li><p>Staff workbench to filter, sort and update tasks</p></li>
<li><p>Management performance dashboard</p></li>
<li><p>Immutable audit log for state changes</p></li>
<li><p>Role based access control and POPIA data protection</p></li>
</ul></td>
<td>This forms the minimum viable product needed to fix the lecturer’s 8
core operational problems and establish our baseline requirements.</td>
</tr>
<tr class="even">
<td>Out-of-Scope</td>
<td><ul>
<li><p>Native iOS and Android mobile apps</p></li>
<li><p>Online payment processing for billable services</p></li>
<li><p>Automated IoT sensors for reporting road/water faults</p></li>
</ul></td>
<td>This is left out for milestone 1 so the team can focus strictly on
web API data integrity, security and basic architecture</td>
</tr>
<tr class="odd">
<td>Deferred Scope</td>
<td><ul>
<li><p>Automated GIS route planning for technicians.</p></li>
<li><p>SMS and WhatsApp push notifications.</p></li>
</ul></td>
<td>Integrating external messaging gateways right now adds extra costs
and third-party dependencies before our core web API are even
stable.</td>
</tr>
</tbody>
</table>

# Requirements And Acceptance Criteria

## Functional Requirements (FRs)

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 16%" />
<col style="width: 19%" />
<col style="width: 12%" />
<col style="width: 16%" />
<col style="width: 27%" />
</colgroup>
<thead>
<tr class="header">
<th>Req ID</th>
<th>Category</th>
<th>Description</th>
<th>Priority</th>
<th>Stakeholder Source</th>
<th>Acceptance Criteria</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>FR-001</td>
<td>Request Submission</td>
<td>Authenticated users will be allowed to submit a new service request
with a title, description and location via the system.</td>
<td>High</td>
<td>Requester</td>
<td>When a logged in user enters valid details then a ticket with a
unique ID is generated and status is set to submitted.</td>
</tr>
<tr class="even">
<td>FR-002</td>
<td>Categorization</td>
<td>System shall allow a selection of controlled categories during
initial form submission.</td>
<td>High</td>
<td>Requester</td>
<td>When a category is left unselected during the initial submission
process, completing the process will be blocked with a validation
error.</td>
</tr>
<tr class="odd">
<td>FR-003</td>
<td>Status Tracking</td>
<td>Requesters will be allowed to see the list of active requests and
the status of each item.</td>
<td>High</td>
<td>Requester</td>
<td>When a requester views their dashboard with the list of their active
requests, each item will display a correct status.</td>
</tr>
<tr class="even">
<td>FR-004</td>
<td>Staff Requests Queue</td>
<td>System shall display a queue of current service requests to
authorized staff members.</td>
<td>High</td>
<td>Staff</td>
<td>When a logged in staff member accesses the ticket queue, all
relevant requests will be displayed for them.</td>
</tr>
<tr class="odd">
<td>FR-005</td>
<td>Ticket Assignment</td>
<td>Authorized staff will be allowed to assign a ticket to themselves or
other authorized staff members.</td>
<td>Medium</td>
<td><p>Staff/</p>
<p>Management</p></td>
<td>In the case of an unassigned ticket, a staff member clicks “Assign
to Me” or transfers the ticket to another staff member.</td>
</tr>
<tr class="even">
<td>FR-006</td>
<td>Status Transition</td>
<td>Only valid state transformations shall be allowed when updating the
status of valid tickets along with closing resolution notes.</td>
<td>High</td>
<td><p>Staff/</p>
<p>Management</p></td>
<td>When a ticket that is still in progress gets updated to “Resolved”,
resolution notes must be applied before acceptance.</td>
</tr>
<tr class="odd">
<td>FR-007</td>
<td>Management Dashboard</td>
<td>Management shall be provided with summaries of total, open, overdue
and resolved requests grouped by category</td>
<td>High</td>
<td>Management</td>
<td>When a manager views analytics, then an accurate number of
aggregated statistics load regarding tickets.</td>
</tr>
<tr class="even">
<td>FR-008</td>
<td>Audit Logging</td>
<td>System will log all status changes, ticket assignments along the
user id, notes and timestamp.</td>
<td>Medium</td>
<td><p>Management/</p>
<p>Admin</p></td>
<td>Given any status update, when actions succeed an audit log is
created and stored in the database.</td>
</tr>
</tbody>
</table>

## Non-Functional Requirements (NFRs)

| Req ID  | Quality      | Target Specification                                                                                 | Measuring Method                                                |
|---------|--------------|------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| NFR-001 | Performance  | Efficient page loading and search queries must return under a base time limit of less than 2 seconds | Utilizing methods such as lighthouse execution for stress tests |
| NFR-002 | Availability | System uptime shall achieve more than 99% uptime during operating hours                              | Uptime monitoring is done automatically with endpoint checks.   |
| NFR-003 | Usability    | UI shall support devices all the way down to a 360px viewport width.                                 | Testing through browser dev tools to manipulate layout.         |

##  

# Constraints

## Scope

**Specification:** The scope gets defined by CivicConnect’s core
baseline capabilities that need to be implemented which can be seen at
the listed table. These requirements are seen as deliverables that must
be implemented.

**Analysis:** Unnecessary feature expansion and addition can directly
affect delivery timelines and code quality. Every additional capability
increases overall system complexity that will cause an expanded API
surface area and require more test cases.

**Implications:**

- More advanced features such as AI ticket classification, native mobile
  apps and SMS gateways are formally deferred or excluded until further
  notice.

- Proposed modifications to the baseline scope will only be considered
  after going through a formal Change Request and Impact Analysis.

## Schedule

**Specification:** Governed by four non-negotiable milestone deadlines.
(M1 – M4)

**Analysis:** The given fixed submission dates leave zero margin for
schedule slippage where delayed core implementations in early phases
will cause compresses testing, integration and deployment windows.

**Implications:**

- Velocity must be defined by short, iterative pull requests instead of
  large monolithic branches.

- Decisions that might exceed set timeboxes must default to the simplest
  alternative.

## Cost/Resources

**Specification:** All operations must be done under a strict budget
plan, using free or educational tier infrastructure along a fixed team
of 3 engineers.

**Analysis:** Free-tier service providers will enforce sever hardware,
memory and runtime restrictions.

**Implications:**

- Extreme runtime frameworks or memory-intensive background processes
  cannot be used due to resource restrictions from providers.

## Quality

**Specification:**

**Analysis:** Architectural discipline will be needed from day one to
ensure quality metrics will be met within the constraint of free-tier
architecture.

**Implications:**

- Frontend interfaces will make use of mobile-first layouts and semantic
  HTML controls to enable cross device usability.

- High-frequency database lookup fields must be indexed to eliminate
  full table scans, keeping them only partial for speed.

## Security

**Specification:** Proper identity management, secrets management along
with role-based access control.

**Analysis:** Sluggish security integrations enable risks to appear such
as exposing sensitive operational data and system workflows to
unauthorized users.

**Implications:**

- Authorization cannot solely rely on UI component setups; backend logic
  must also be utilized to ensure proper flow when handling sensitive
  data.

## Constraint interactions/trade-offs

**Cost vs. Performance**

Cost and resource constraints can directly impact non-functional
requirements such as performance due to limitations on resources.
Response targets for system are threatened due to free-tier
architecture.

**Schedule vs. Quality**

Mandatory unit tests, 2 reviewer PR processes and static code analysis
could negatively impact short term code delivery as it slows down the
development process.


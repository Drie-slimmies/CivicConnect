# Change Control

> Controlled changes applied to the baselined M1 requirements during M2 (CR-001 to CR-005) and to the M2 baseline during M3 (CR-006 to CR-009), per PED v2.0's continuity rule: nothing is silently overwritten, every change is logged here.


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
</tbody>
</table>


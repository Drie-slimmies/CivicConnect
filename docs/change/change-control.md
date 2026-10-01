# Change Control

> Controlled changes applied to the baselined M1 requirements during M2, per PED v2.0's continuity rule: nothing is silently overwritten, every change is logged here.


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
</tbody>
</table>


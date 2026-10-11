"use client";
import { useState } from "react";
import type { RequestDetail, Status } from "@/lib/dto";
import { NEXT_STATUS, STATUS_LABEL } from "@/lib/dto";
import { formatDate } from "@/lib/format";
import { StatusTimeline } from "@/components/requests/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { SelectField, TextArea } from "@/components/ui/Fields";
import { Notice } from "@/components/ui/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TicketStub } from "@/components/ui/TicketStub";

const ME = "Thandi Mokoena"; // demo signed-in staff member
const STAFF = ["Thandi Mokoena", "Sipho Dlamini", "Naledi Botha"];

export function RequestWorkspace({ initial }: { initial: RequestDetail }) {
  const [r, setR] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [message, setMessage] = useState("");

  // Prototype: replace with PATCH calls that send `version` and handle a 409 conflict.
  function apply(change: Partial<RequestDetail>, done: string, status?: Status) {
    setBusy(true);
    setMessage("");
    setTimeout(() => {
      const at = new Date().toISOString();
      setR((c) => ({
        ...c,
        ...change,
        updatedAt: at,
        version: c.version + 1,
        history: status ? [...c.history, { status, at }] : c.history,
      }));
      setMessage(done);
      setBusy(false);
    }, 600);
  }

  function assign(name: string) {
    apply({ assignedTo: name, status: r.status === "submitted" ? "assigned" : r.status }, `Assigned to ${name}. This is recorded in the audit log.`, r.status === "submitted" ? "assigned" : undefined);
  }

  function advance(next: Status) {
    if (next === "resolved" && !notes.trim()) {
      setNotesError("Add resolution notes before marking this request as resolved. They explain what was done.");
      return;
    }
    setNotesError("");
    apply(
      { status: next, resolutionNotes: next === "resolved" ? notes.trim() : r.resolutionNotes },
      `Status changed to ${STATUS_LABEL[next]}. This is recorded in the audit log.`,
      next,
    );
    setNotes("");
  }

  const next = NEXT_STATUS[r.status];

  return (
    <div className="flex flex-col gap-8">
      <TicketStub id={r.trackingId}>
        <p className="text-muted">Status</p>
        <div className="mt-1">
          <StatusBadge status={r.status} />
        </div>
      </TicketStub>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="details" className="rounded-card border border-line bg-surface p-6">
            <h2 id="details" className="font-display text-xl font-semibold">
              {r.title}
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Item term="Category" value={r.category} />
              <Item term="Urgency" value={`${r.urgency} of 5`} />
              <Item term="Location" value={r.location} />
              <Item term="Sent" value={formatDate(r.createdAt)} />
              <Item term="Assigned to" value={r.assignedTo ?? "Nobody yet"} />
              {r.resolutionNotes && <Item term="Resolution notes" value={r.resolutionNotes} />}
            </dl>
            <p className="mt-4 max-w-prose text-muted">{r.description}</p>
          </section>

          <section aria-labelledby="actions" className="flex flex-col gap-5 rounded-card border border-line bg-surface p-6">
            <h2 id="actions" className="font-display text-xl font-semibold">
              Update this request
            </h2>
            {message && <Notice kind="success" title={message} />}

            {r.assignedTo === null ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-muted">Assign this request to move it forward.</p>
                <Button onClick={() => assign(ME)} disabled={busy}>
                  {busy ? "Assigning…" : "Assign to me"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
                <div className="w-full sm:max-w-xs">
                  <SelectField label="Transfer to" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
                    <option value="">Choose a team member</option>
                    {STAFF.filter((s) => s !== r.assignedTo).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </SelectField>
                </div>
                <Button variant="ghost" onClick={() => assign(transferTo)} disabled={busy || !transferTo}>
                  Transfer
                </Button>
              </div>
            )}

            {r.assignedTo !== null && next ? (
              <div className="flex flex-col gap-4 border-t border-line pt-5">
                <TextArea
                  label={next === "resolved" ? "Resolution notes" : "Notes"}
                  optional={next !== "resolved"}
                  required={next === "resolved"}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  error={notesError}
                  hint={next === "resolved" ? "Required. Say what was done so the requester and managers can see it." : "Visible in the audit log."}
                />
                <div>
                  <Button onClick={() => advance(next)} disabled={busy}>
                    {busy ? "Saving…" : `Mark as ${STATUS_LABEL[next].toLowerCase()}`}
                  </Button>
                </div>
              </div>
            ) : (
              r.status === "closed" && (
                <Notice kind="info" title="This request is closed.">
                  Closed requests are final and cannot be reopened.
                </Notice>
              )
            )}
          </section>
        </div>

        <section aria-labelledby="history" className="h-fit rounded-card border border-line bg-surface p-6">
          <h2 id="history" className="mb-5 font-display text-xl font-semibold">
            Progress
          </h2>
          <StatusTimeline history={r.history} />
        </section>
      </div>
    </div>
  );
}

function Item({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{term}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

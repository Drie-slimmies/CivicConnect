"use client";
import { useState } from "react";
import type { RequestDetail, Role, Status } from "@/lib/dto";
import { NEXT_STATUS, STATUS_LABEL } from "@/lib/dto";
import { formatDate } from "@/lib/format";
import { StatusTimeline } from "@/components/requests/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { SelectField, TextArea } from "@/components/ui/Fields";
import { Notice } from "@/components/ui/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TicketStub } from "@/components/ui/TicketStub";

type Person = { id: number; name: string };

export function RequestWorkspace({
  initial,
  staff,
  me,
  role,
}: {
  initial: RequestDetail;
  staff: Person[];
  me: Person | null;
  role: Role;
}) {
  const [r, setR] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function send(path: "assign" | "status" | "unassign", body: Record<string, unknown>, done: string) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/requests/${r.trackingId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, version: r.version }),
      });
      const data: { request?: RequestDetail; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.request) {
        setError(
          res.status === 409
            ? "Someone else changed this request while you had it open. Reload the page to see the latest version."
            : (data.error ?? "Something went wrong. Please try again."),
        );
        return false;
      }
      setR(data.request);
      setMessage(done);
      return true;
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function assign(person: Person) {
    void send("assign", { assigneeId: person.id }, `Assigned to ${person.name}. This is recorded in the audit log.`);
  }

  function unassign() {
    void send("unassign", {}, "Request unassigned. This is recorded in the audit log.");
  }

  async function advance(next: Status) {
    if (next === "resolved" && !notes.trim()) {
      setNotesError("Add resolution notes before marking this request as resolved. They explain what was done.");
      return;
    }
    setNotesError("");
    const ok = await send(
      "status",
      { status: next, notes: notes.trim() || undefined },
      `Status changed to ${STATUS_LABEL[next]}. This is recorded in the audit log.`,
    );
    if (ok) setNotes("");
  }

  const next = NEXT_STATUS[r.status];
  const canUnassign =
    r.assignedTo !== null &&
    (r.status === "assigned" || r.status === "in_progress") &&
    (role !== "staff" || r.assignedTo === me?.name);

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
            <h1 id="details" className="font-display text-2xl font-bold">
              {r.title}
            </h1>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Item term="Category" value={r.category} />
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
            {error && <Notice kind="error" title={error} />}

            {r.assignedTo === null && me ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-muted">Assign this request to move it forward.</p>
                <Button onClick={() => assign(me)} disabled={busy}>
                  {busy ? "Assigning…" : "Assign to me"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
                <div className="w-full sm:max-w-xs">
                  <SelectField label={r.assignedTo === null ? "Assign to" : "Transfer to"} value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
                    <option value="">Choose a team member</option>
                    {staff
                      .filter((s) => s.name !== r.assignedTo)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </SelectField>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const person = staff.find((s) => String(s.id) === transferTo);
                    if (person) assign(person);
                  }}
                  disabled={busy || !transferTo}
                >
                  {r.assignedTo === null ? "Assign" : "Transfer"}
                </Button>
                {canUnassign && (
                  <Button variant="ghost" onClick={unassign} disabled={busy}>
                    Unassign
                  </Button>
                )}
              </div>
            )}

            {r.assignedTo !== null && next && next !== "assigned" ? (
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

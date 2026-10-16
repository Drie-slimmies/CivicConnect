# Evidence: A4, audit log refuses UPDATE, DELETE and TRUNCATE (Neon)

Part of the [Quality Strategy](../quality-strategy.md) (risk Q4, case A4, release-quality run). Records one hand run and what it shows.

| Item | Value |
|---|---|
| Date | 16 October 2026, about 15:40 (South Africa) |
| Run by | Ruan Jordaan, on his own machine |
| Code under test | `civic-connect/scripts/verify-audit-immutable.mjs` at base commit `4ef2c92` with the Q1 to Q5 changes not yet committed (replace with the commit SHA when merged) |
| Environment | A separate Neon branch created for this check, connection string supplied for this one command only (not stored). Windows PowerShell. Migration `0001_audit_immutable.sql` present on the branch |
| Command | `npm run verify:audit` in `civic-connect/` |

## What the script does

Inside one transaction it inserts a test service request and one audit row, then tries an UPDATE, a DELETE and a TRUNCATE on `audit_logs`, each in its own savepoint. It passes only if each statement fails with `audit_logs is append-only`. It then rolls everything back, so the branch is unchanged.

## Result

| Statement | Result |
|---|---|
| UPDATE | rejected |
| DELETE | rejected |
| TRUNCATE | rejected |

The script printed that the transaction was rolled back and nothing was saved. Verdict: PASS.

## Interpretation

**What it shows:** the database itself, not the application, refuses to change or remove audit rows, including by TRUNCATE. This is the part of Q4 (audit trail editable) that the mocked tests cannot show.

**What it does not show:**
- The run was against a Neon branch, a copy of the project data, not the production endpoint. A branch has the same triggers only if the migration was applied to its parent, which this result confirms for the branch tested.
- A database owner can still drop the triggers. The check proves the protection is in place, not that nobody with owner rights can remove it.
- Inserts are not blocked, by design: the application must keep adding rows. Completeness of those rows is covered by U3 at the gate.
- It was run once, by hand. It should be run again before the release candidate is tagged, because a later migration could remove the triggers.

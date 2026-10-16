# Evidence: E1 and E2, end-to-end journeys in a browser (Neon branch)

Part of the [Quality Strategy](../quality-strategy.md) (cases E1 and E2, release-quality run; risks Q1 to Q4). Records the runs and what they show.

| Item | Value |
|---|---|
| Date | 16 October 2026; passing run about 16:06 (South Africa), JUnit timestamp 14:06 UTC |
| Run by | Ruan Jordaan, on his own machine (Windows, PowerShell) |
| Code under test | `civic-connect/e2e/e1-acceptance.e2e.ts` and `e2-role-rules.e2e.ts`, base commit `4ef2c92` with the Q1 to Q5 and E2E changes not yet committed (replace with the commit SHA when merged) |
| Environment | Production build of the app (`npm run build`, `npm run start`) started by Playwright 1.64.1 on localhost:3000, Chromium, against a Neon branch created for testing (seeded; the second staff account is created by E2). Not the CI run and not a deployed staging site |
| Command | `npm run test:e2e` with `DATABASE_URL` set to the branch and `E2E_CONFIRM_TEST_DATABASE=yes` |
| Saved results | `civic-connect/e2e-results/junit.xml` and `e2e-results/report` (not committed; copy the JUnit file into the release evidence if it is needed) |

## Runs

| Run | Result | What happened | Change made |
|---|---|---|---|
| 1 | 2 failed | E1: the test clicked "Sign in" before the page had finished loading its scripts, so the browser reloaded the login page again and again until the 120 second limit. E2: stopped at once because `E2E_STAFF_B_PASSWORD` was not set in `.env` | The tests now wait until the page is fully loaded before interacting; the app is run as a production build instead of the dev server; `E2E_STAFF_B_PASSWORD` was added to `.env`. The application code was not changed |
| 2 | 2 passed | E1 29.8 s, E2 26.4 s, 65 s in total including the build and server start; 0 failures, 0 skipped, no retries | none |

## What each journey checks

**E1 (Q1, Q2, Q3, Q4):**
- A requester submits a request through the form and receives a tracking ID.
- A signed-out visitor sees the request as Submitted and the page does not contain the title, location, description or requester name.
- Staff assign it to themselves and start work. Marking it resolved without notes is refused with the message asking for notes; with notes it becomes Resolved.
- The requester sees "What was done" with the notes and the Resolved step; the public page shows Resolved and not the notes.
- A manager closes it. The dashboard shows a Closed count of at least 1.
- The audit log lists exactly five entries for the request (submitted, assigned, in progress, resolved, closed) in that order, the resolved entry carries the notes and the assigned entry names the staff member. The public page then shows Closed.

**E2 (Q1, Q3):**
- A manager opening an unassigned request has no "Assign to me", and assigns it to a staff member through the list.
- A different staff member sees no Unassign button, and a direct API request to unassign gets 403 and the request stays assigned.
- The owning staff member unassigns it; the request shows nobody assigned and the progress bar returns to Submitted with the other four steps not reached.

## Interpretation

**What it shows:** the role and lifecycle rules that the mocked tests prove in code also hold through the real screens, a real session, the real SQL and the real audit trigger on Neon. The public page leaks nothing at any stage of the journey, and the audit log has the complete set of entries for it.

**What it does not show:**
- It ran once, in one browser (Chromium), against a Neon test branch and a local production build, not against a deployed staging site. It should be repeated on the release candidate.
- It does not cover two people editing at the same time (Q5), failed sign-ins, other request categories, the search, filter and sort on the queue screens (TD-10), or screen readers.
- Passing proves these journeys work; it does not prove the application has no other defects.
- The test requests and the E2E staff account remain on the branch; they are not cleaned up, so delete the branch after the evidence has been collected.

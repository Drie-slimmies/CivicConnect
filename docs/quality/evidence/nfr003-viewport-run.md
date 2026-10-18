# Evidence: NFR-003, 360px viewport layout

Records a hand-run visual check of the layout at a 360px-wide viewport. This is not an automated test and is not part of the CI gate.

| Item | Value |
|---|---|
| Date | 18 October 2026 |
| Branch and base | `Final-Evidence-Updates`, application code unchanged from `m3-rc1` (commit `15c062c`) |
| Environment | Chrome DevTools device toolbar, Responsive mode, 360 x 800, 100% zoom, against a local `next dev` instance |
| Method | Each screen below was opened at 360px width and visually checked against the NFR-003 target (UI usable down to a 360px viewport width) |

## Screens checked

| Screen | Signed in as | Result | Screenshot |
|---|---|---|---|
| Sign in | — | Pass: form, labels and button fit within 360px, no horizontal scrollbar | [nfr003-360-signin.png](nfr003/nfr003-360-signin.png) |
| Manager dashboard | Manager | Pass: summary cards stack vertically, no horizontal scrollbar | [nfr003-360-manager-dashboard.png](nfr003/nfr003-360-manager-dashboard.png) |
| My requests | Requester | Pass: nav, heading and empty-state card fit within 360px | [nfr003-360-requester-myrequests.png](nfr003/nfr003-360-requester-myrequests.png) |
| Unassigned queue, filters | Staff | Pass: search, category and sort controls stack vertically, no overlap | [nfr003-360-staff-unassigned.png](nfr003/nfr003-360-staff-unassigned.png) |
| Unassigned queue, request list | Staff | Pass: request cards fit within 360px, status pill and text readable | [nfr003-360-staff-unassigned-list.png](nfr003/nfr003-360-staff-unassigned-list.png) |

Pass criteria used: no horizontal scrollbar, nothing clipped or overlapping, text readable without zooming, buttons large enough to tap.

## What this shows

Across sign-in, the requester, staff and manager views, the layout reflows to a single column at 360px with no horizontal scrolling or clipped content, which is the NFR-003 target.

## What this does not show

- **No programmatic width check.** `document.documentElement.scrollWidth` was not captured for these screens; the "no horizontal scrollbar" result is a visual read of the DevTools viewport, not a logged measurement.
- **Two screens not captured:** the request submission form and an opened request detail view (status change / resolution notes). Not checked in this run.
- **DevTools emulation, not a real device.** Confirms the CSS breakpoint behaves correctly at 360px; does not confirm touch-target spacing or on-screen keyboard behaviour on an actual phone.
- **One run, one browser** (Chromium via DevTools). Not repeated on `m4-final`.

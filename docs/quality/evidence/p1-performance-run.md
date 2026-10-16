# Evidence: P1, performance of the all-requests list (Neon free tier)

Part of the [Quality Strategy](../quality-strategy.md) (case P1, release-quality run; NFR-001, R-07). Records the run and what it shows.

| Item | Value |
|---|---|
| Date | 16 October 2026, 14:41 UTC (16:41 South Africa) |
| Run by | Ruan Jordaan, on his own machine (Windows, PowerShell) |
| Code under test | `civic-connect/scripts/perf-queue.mjs` at base commit `4ef2c92` with the Q1 to Q5, E2E and P1 changes not yet committed (replace with the commit SHA when merged) |
| Environment | Production build (`npm run build`, `npm run start`) on localhost:3000, with the load script on the same machine. Database: a Neon free-tier branch in us-east-2 (AWS), reached from South Africa. The branch held 215 requests, of which 200 were generated for this test, spread evenly over the five statuses with their audit rows |
| Command | `npm run perf:queue` with `DATABASE_URL` set to the branch and `PERF_CONFIRM_TEST_DATABASE=yes` |
| Saved result | `civic-connect/perf-results/p1-2026-10-16T14-41-22-111Z.json` (not committed) |

## Scenario and pass rule (fixed before the run)

20 signed-in staff sessions each request `/queue/all`, wait 1 second, and repeat for 30 seconds, after a warm-up of 2 requests per user. **Pass:** zero failed requests and a 95th percentile response time under 2000 ms (NFR-001, response time under 2 seconds). A failed request is a non-200 answer or a page without the expected content.

## Result

| Measure | Value |
|---|---|
| Requests measured | 258 (8.6 per second) |
| Failed requests | 0 |
| First request (before warm-up) | 2354 ms |
| Mean | 1389 ms |
| Median (p50) | 1338 ms |
| 95th percentile (p95) | **2067 ms** (target under 2000 ms) |
| 99th percentile (p99) | 2143 ms |
| Slowest | 2257 ms |
| Page size | about 262 KB per response |
| **Verdict** | **FAIL**, by 67 ms (3.4 percent) on the 95th percentile |

## Interpretation

**What it shows:** under this load the page answered every request correctly, but the slowest 5 percent took longer than the 2 second goal, and even the typical request took 1.3 seconds. The response times were close together (median 1338 ms, slowest 2257 ms), which fits each request being slow on its own rather than requests queuing behind each other.

**Likely contributors (not yet separated by measurement):**
- The list loads every request and every audit row, with no limit or paging (`listAllRequests`), in two database queries one after the other, and sends the whole list (about 262 KB for 215 requests) to the browser. The size grows with every new request.
- Each database query crosses the Atlantic to a free-tier Neon branch, and the database is a shared, small compute.
- The load script, the application and the browser sessions all ran on one laptop, so they competed for the same processor.

A run with one user would show how much of the time is the page itself and how much is the load. That run has not been done.

**What it does not show:**
- It is one run, from one machine, on a free-tier database. A different network or a paid database region could move the result either way, in both directions, so it must not be read as capacity or as the production figure.
- The first request after idle was not a true cold start, because the database had just been used to add the test data (R-07 describes the real cold start, which can be slower).
- It tests one page. Other screens (the dashboard, the audit log, submitting a request) were not measured.

**Status:** NFR-001 is **not demonstrated** for the all-requests list at 215 requests. The result is recorded as a finding, not repeated until it passes, and the target was not changed. Follow-up: [TD-16](../technical-debt-register.md) and R-07.

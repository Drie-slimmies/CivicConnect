# Release Candidate Verification and Rollback (M3)

A separate staging environment is not required for M3 (confirmed by the lecturer), and none was built. CivicConnect has no deployed site. The release candidate is run and verified as a production build on a developer machine against a Neon test branch. This page says how that run is set up, how to show that the right version is running, how it differs from a real deployment, and how to roll back.

## How the release candidate is run

| Part | Release candidate run | Normal development |
|---|---|---|
| Application | Production build: `npm run build` then `npm run start` (`NODE_ENV=production`) | `npm run dev` |
| Source | The release candidate: the Git tag `m3-rc1` (commit recorded in the [PED](../PED/PED.md) submission block) checked out clean | Any working branch |
| Database | A dedicated Neon test branch, migrated with `npm run db:migrate` and seeded with `npm run db:seed` | The developer's own Neon branch |
| Configuration | Its own `.env`: `DATABASE_URL` of the test branch, a `SESSION_SECRET` different from development, seed passwords. Nothing is committed (`.env` is git-ignored; `.env.example` lists the names only) | Developer `.env` |
| Cookies | Session cookie is `Secure` because `NODE_ENV` is `production`; Chromium accepted it on `localhost` in E1 and E2 | Not secure |
| Health | `GET /api/health` answers `{"status":"ok"}` | Same |

The end-to-end tests (E1 and E2) and the performance run (P1) were run against exactly this arrangement: a production build started by Playwright or by hand on `localhost:3000`, against a separate Neon test branch ([E1 and E2 evidence](../quality/evidence/e1-e2-end-to-end-run.md), [P1 evidence](../quality/evidence/p1-performance-run.md)).

## How to show that the correct candidate is running

1. `git fetch --tags` then `git checkout m3-rc1`; `git status` shows a clean tree and `git rev-parse --short HEAD` prints the commit named in the PED.
2. `npm ci`, then `npm run build` and `npm run start` in `civic-connect/`.
3. `GET /api/health` returns `status: ok`, and the sign-in page loads.
4. Run the critical journey by hand, or `npm run test:e2e` (needs `E2E_CONFIRM_TEST_DATABASE=yes` and a test database): request submitted, tracked by a signed-out visitor, assigned, resolved with notes, closed, and the audit log shows five entries.

The application does not print its commit hash, so the version is shown by the Git checkout next to the running server. This is a known limit of running without a deployment.

## Differences from production that could change behaviour

- **Hosting:** localhost on one machine, not a serverless platform. Cold-start behaviour of the serverless functions (R-07, R-09 connection pool use) is not reproduced. A deployment target is chosen in [deployment.md](deployment.md); none is provisioned.
- **Database:** Neon free tier in us-east-2 (AWS), reached from South Africa. Network time to the database is part of every response (P1 missed its target on this setup, see DF-08). A production database near the users would be faster.
- **Load and data:** a few hundred test rows and one machine. Production volume is untested.
- **HTTPS and domain:** none. Cookie behaviour over a real HTTPS domain is expected to be the same because the cookie is already `Secure`, but it was not tried.
- **Secrets:** the secrets used in this run are test values. Production must use a different `SESSION_SECRET` and database credentials, held in the host's secret store (TD-08 records that the placeholder secret is not rejected yet).

## Rollback and recovery

- **Code:** redeploy the last known good tagged commit. `m3-rc1` is the first tag, so for M3 itself there is no earlier tag; from the next release on, the previous tag is the restore point. Tag every release so there is always a named version to restore.
- **Database:** migrations `0001` to `0003` in `civic-connect/drizzle/` are forward only and are not reversed by redeploying old code. `0003` drops a column (`assigned_department_id`) that code older than CR-013 expects, so rolling the code back past that point needs the database restored too. Restore by creating a new Neon branch from a point in time before the migration (within the history window Neon keeps for the plan) and pointing `DATABASE_URL` at it.
- **Data to protect:** audit rows and request history. The audit table refuses UPDATE, DELETE and TRUNCATE (A4), so a restore must come from Neon's history, not from deleting rows.
- **Configuration:** keep the previous `.env` values, since changing `SESSION_SECRET` signs every user out.

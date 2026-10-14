# CivicConnect (application)

Community service request management application for SEN381 (Group M). This folder holds the Next.js application. Project governance, requirements, decisions and registers are in the repository's top-level [`docs/`](../docs) folder and the [root README](../README.md).

**Status (Milestone 3 work in progress):** the project skeleton, database schema, CI, requester sign-up, sign-in, sign-out and role-based session handling, and the requester features (submit a request, my requests, request details, public tracking) are in place and tested. The staff and manager features are still to be built; those screens show sample data. New requests are not yet routed to a department. Items marked _planned_ below do not exist yet.

## Stack

Next.js 16.4.0 (App Router, Route Handlers), React 19, TypeScript, Drizzle ORM with the Neon WebSocket Pool driver, Neon serverless PostgreSQL. Rationale and alternatives: [ADR-04](../docs/decisions/0007-technology-stack-nextjs-neon-drizzle.md). Architectural style (plain layered monolith, CR-010): [ADR-05](../docs/decisions/0008-architectural-style-plain-layered-monolith.md).

## Prerequisites

- Node.js version in [`.nvmrc`](.nvmrc) (use `nvm use`).
- A PostgreSQL database on [Neon](https://neon.com) (a free-tier project or branch is enough for development).

## Setup

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Create your local environment file from the example:
   ```bash
   cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
   ```
3. Open `.env` and replace the placeholders: your own Neon connection string for `DATABASE_URL` (Neon dashboard -> your project -> Connection details, use the **pooled** connection string), a random `SESSION_SECRET` of at least 32 characters, and the three `SEED_*` passwords (each at least 8 characters). A secret can be generated with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   **Never commit `.env`**; it is ignored by Git.
4. Create the tables in your database by applying the committed migrations (this includes the trigger that makes `audit_logs` append-only):
   ```bash
   npm run db:migrate
   ```
5. Load the reference data (departments and categories) and the demo accounts:
   ```bash
   npm run db:seed
   ```
   The seed script creates one staff, one manager and one requester account (`thandi.mokoena@civicconnect.test`, `sipho.dlamini@civicconnect.test`, `demo.requester@civicconnect.test`) with the passwords from your `.env`. It can be run again; each run resets the three demo accounts to the passwords in your `.env`.

`npm run db:generate` creates a new migration file after you change `lib/db/schema.ts`. `npm run db:push` is a development shortcut that skips migrations (and therefore the audit trigger), so use `db:migrate` for a normal setup.

## Environment variables

| Variable       | Required | Used by                                | Description                                                                                                               |
| -------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | `lib/db/index.ts`, `drizzle.config.ts` | Neon PostgreSQL connection string. The app and the Drizzle CLI both fail at start-up with a clear error if it is missing. |
| `SESSION_SECRET` | Yes | `lib/auth/session.ts` | Key that signs the session cookie. At least 32 characters; use a different value in every environment. Changing it signs every user out. Sign-in and any protected route throw a clear error if it is missing or too short. |
| `SEED_STAFF_PASSWORD`, `SEED_MANAGER_PASSWORD`, `SEED_REQUESTER_PASSWORD` | For `db:seed` only | `scripts/seed.mjs` | Passwords for the three demo accounts. At least 8 characters. Not used by the running app. |

Only variable names and placeholders belong in `.env.example`. Real values stay in your own `.env` or in the hosting platform's secret store.

## Run, check and build

| Command                                   | Purpose                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Start the development server at http://localhost:3000                                          |
| `npm run lint`                            | ESLint                                                                                         |
| `npm test`                                | Vitest unit and API tests in `tests/` (39 tests). They need no database and no `.env`.         |
| `npm run db:migrate`                      | Apply the committed migrations to the database in `DATABASE_URL`                               |
| `npm run db:seed`                         | Insert reference data and the three demo accounts                                              |
| `npx tsc --noEmit`                        | Type check (run after `npm run build`, because Next.js generates route types during the build) |
| `npm run build`                           | Production build                                                                               |
| `npm audit --omit=dev --audit-level=high` | Dependency check used as the CI gate                                                           |

The same checks run in GitHub Actions on every pull request and push to `main` (see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

## Structure

| Path              | Contents                                                                            |
| ----------------- | ----------------------------------------------------------------------------------- |
| `app/`            | Next.js routes and pages. Implemented endpoints: `app/api/health`, `app/api/auth/register`, `login` and `logout`, and `POST app/api/requests`. Requester screens: `app/(requester)/requests`, `app/track`. |
| `lib/auth/`       | Passwords (`password.ts`), signed sessions (`session.ts`), current user and role checks (`guard.ts`), browser helper (`client.ts`) |
| `components/auth/` | Sign-in and sign-up forms, the session provider and the success popup |
| `scripts/`        | `seed.mjs`: reference data and demo accounts |
| `drizzle/`        | Committed SQL migrations (`0001` makes `audit_logs` append-only) |
| `lib/db/`         | Drizzle schema (`schema.ts`), database client (`index.ts`) and queries (`queries/requests.ts`) |
| `lib/requests/`   | Request rules: field reading, validation, public view (`rules.ts`) |
| `components/requests/` | Requester screens' components (request cards, forms) |
| `lib/states/`     | State pattern for the request lifecycle (ADR-01); _stub files only_                 |
| `lib/decorators/` | Audit logging decorator (ADR-02); _stub file only_                                  |
| `tests/`          | Automated tests: `tests/unit/auth` and `tests/unit/requests` (unit), `tests/api/auth` and `tests/api/requests` (API handlers with the database mocked) |

## Authentication

Sign-up always creates a requester; staff and manager accounts come from the seed script. After sign-in the server sets a signed, HTTP-only cookie (8 hours). Protected route handlers start with `const auth = await requireRole("staff", "manager"); if (!auth.ok) return auth.response;`, which answers 401 when nobody is signed in and 403 when the role is wrong. The role is read from the database on every request. Design and trade-offs: [ADR-06](../docs/decisions/0009-signed-cookie-sessions-with-jose.md) and [architecture](../docs/architecture/architecture.md).

## Known limitations

- Sign-up, sign-in, sign-out, role checks and the requester features work. The staff and manager pages still show sample data from `lib/mock/data.ts` and have no guarded routes yet (risk R-05: use dummy data only).
- Not built: password reset, email verification, login rate limiting and per-session revocation. They are recorded in the [technical debt register](../docs/quality/technical-debt-register.md) and risk R-13.
- The API and query tests mock the database, so they do not check SQL, constraints or the request-plus-audit transaction against a real database.
- Department routing, assignment, status changes and the audit decorator are not built (FR-002 partly, FR-004 to FR-008); `lib/events/` stubs are obsolete under CR-010 and are to be removed.
- Several `lib/` files are empty stubs for decisions that are documented but not yet built. The [RTM](../docs/requirements/rtm.md) states the real status of each requirement.
- Dev-tooling vulnerabilities with no upstream patch are accepted as risk R-12 (CI gates production dependencies only).

## Documentation links

[PED](../docs/PED/PED.md) | [RTM](../docs/requirements/rtm.md) | [Risk Register](../docs/risk/risk-register.md) | [Decisions (ADRs)](../docs/decisions/) | [Data and persistence baseline](../docs/architecture/data-persistence-baseline.md) | [Architecture](../docs/architecture/architecture.md) | [ADR-06 sessions](../docs/decisions/0009-signed-cookie-sessions-with-jose.md) | [Technical debt register](../docs/quality/technical-debt-register.md)

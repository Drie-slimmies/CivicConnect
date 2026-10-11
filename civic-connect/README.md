# CivicConnect (application)

Community service request management application for SEN381 (Group M). This folder holds the Next.js application. Project governance, requirements, decisions and registers are in the repository's top-level [`docs/`](../docs) folder and the [root README](../README.md).

**Status (Milestone 3 work in progress):** the project skeleton, database schema and CI are in place. Feature implementation is under way. Items marked _planned_ below do not exist yet.

## Stack

Next.js 16.4.0 (App Router, Route Handlers), React 19, TypeScript, Drizzle ORM with the Neon WebSocket Pool driver, Neon serverless PostgreSQL. Rationale and alternatives: [ADR-04](../docs/decisions/0007-technology-stack-nextjs-neon-drizzle.md). Architectural style (modular monolith): ADR-05 in the PED.

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
3. Open `.env` and replace the placeholder with your own Neon connection string (Neon dashboard -> your project -> Connection details, use the **pooled** connection string). **Never commit `.env`**; it is ignored by Git.
4. Create the tables in your database:
   ```bash
   npm run db:push
   ```
   (`npm run db:generate` creates migration files from `lib/db/schema.ts`. Committed migrations and a seed script are _planned_.)

## Environment variables

| Variable       | Required | Used by                                | Description                                                                                                               |
| -------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | `lib/db/index.ts`, `drizzle.config.ts` | Neon PostgreSQL connection string. The app and the Drizzle CLI both fail at start-up with a clear error if it is missing. |

Only variable names and placeholders belong in `.env.example`. Real values stay in your own `.env` or in the hosting platform's secret store.

## Run, check and build

| Command                                   | Purpose                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Start the development server at http://localhost:3000                                          |
| `npm run lint`                            | ESLint                                                                                         |
| `npx tsc --noEmit`                        | Type check (run after `npm run build`, because Next.js generates route types during the build) |
| `npm run build`                           | Production build                                                                               |
| `npm audit --omit=dev --audit-level=high` | Dependency check used as the CI gate                                                           |
| `npm test`                                | _Planned_ (test framework not added yet)                                                       |

The same checks run in GitHub Actions on every pull request and push to `main` (see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

## Structure

| Path              | Contents                                                                            |
| ----------------- | ----------------------------------------------------------------------------------- |
| `app/`            | Next.js routes and pages. `app/api/health` is the only implemented endpoint so far. |
| `lib/db/`         | Drizzle schema (`schema.ts`) and database client (`index.ts`)                       |
| `lib/states/`     | State pattern for the request lifecycle (ADR-01); _stub files only_                 |
| `lib/decorators/` | Audit logging decorator (ADR-02); _stub file only_                                  |
| `lib/events/`     | In-process domain events (ADR-03); _stub files only_                                |
| `tests/`          | _Planned_ automated tests                                                           |

## Known limitations

- Authentication and role-based access control are not implemented yet; a seeded test user is planned for the first working journey (risk R-05: use dummy data only).
- Several `lib/` files are empty stubs for decisions that are documented but not yet built. The [RTM](../docs/requirements/rtm.md) states the real status of each requirement.
- Dev-tooling vulnerabilities with no upstream patch are accepted as risk R-12 (CI gates production dependencies only).

## Documentation links

[PED](../docs/PED/PED.md) | [RTM](../docs/requirements/rtm.md) | [Risk Register](../docs/risk/risk-register.md) | [Decisions (ADRs)](../docs/decisions/) | [Data and persistence baseline](../docs/architecture/data-persistence-baseline.md) | [Architecture](../docs/architecture/architecture.md)

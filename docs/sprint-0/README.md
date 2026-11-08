# Hourvia V2 — Sprint 0 architecture blueprint

Status: proposed architecture; documentation and static analysis only. Assessment date: 2026-11-08. Owner: Living IT Solutions. Initial operational organization: ThriveSource. This is a fresh implementation, with no V1 data or credential import.

## Reading map

- [Architecture, modules, security and workflows](architecture.md)
- [Relational schema and transaction specification](schema.md)
- [Database deployment safety, evidence and environment policy](deployment-safety.md)
- [Threat model and acceptance gates](security.md)
- [MVP, dependency roadmap, estimates and blockers](roadmap.md)
- [Architecture decision records](decisions.md)

## Executive recommendation

Sprint 0 is complete as a blueprint. Conditional GO for an approved, synthetic-data-only foundation sprint; NO-GO for production-connected development, reuse of the existing identity project, or ThriveSource launch until the gates below are closed. Approval is still required before beginning implementation. No claim of compliance or production readiness is made.

Use a modular monolith: React/Vite/strict TypeScript and Tailwind v4 in the browser, Netlify Functions for all application operations, Netlify PostgreSQL with Drizzle for persistence, Supabase Auth for identity, and Resend SMTP for authentication email. Netlify Database owns application authorization data; Supabase claims never grant organization permissions. The browser never connects to the application database.

The largest infrastructure risk is the documented automatic copying of production data into preview branches. A separate synthetic-data development site is the proposed isolation boundary, but preventing all previews and agent-created branches on the production site must be demonstrated before it holds sensitive data. A publishing lock is not accepted as a migration security boundary.

The proposed application safeguards are explicit tenant foreign keys, default-deny server authorization, transactional state changes, revocable application sessions, leased online tracking, immutable evidence, and revisioned approvals. Tracking can prove recent server contact, not continuous network connectivity or human activity; its conservative accounting rule deliberately excludes time after the last acknowledged heartbeat when a connection expires.

## Scope and evidence

The repository contained only a minimal README.md. There was no application code, dependency manifest, schema, migration directory, CI workflow, or infrastructure-as-code configuration to audit. Supplied site metadata reported a GitHub main branch and an existing published deploy. Runtime guidance described a fresh database with no applied migrations, while supplied site metadata reported no database; provisioning state was not independently verified. No database connection was opened to resolve this discrepancy.

Public Netlify documentation was retrieved read-only on the assessment date; source links and limits appear in the deployment document. No authenticated provider configuration, Supabase project, production data, credentials, build, migration, or deployment was accessed. Existing Supabase configuration remains unaudited. These documents describe intended behavior and future acceptance tests, not implemented controls.

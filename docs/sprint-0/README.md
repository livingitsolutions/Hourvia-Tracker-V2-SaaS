# Hourvia V2 — Sprint 0 blueprint

Date: 2026-11-08. Status: proposed architecture; approval required before Sprint 1. Owner: Living IT Solutions. First operational tenant: ThriveSource.

This is a fresh system. No V1 application data, credentials, configuration or schema is accepted implicitly. The repository inspected contained only a title in its README; there is no application, dependency manifest, schema or deployment configuration to audit. No product code or migration was created in Sprint 0.

## Architecture summary

Use an organization-first modular monolith: React, Vite, strict TypeScript and Tailwind CSS v4 on Netlify; versioned Netlify Functions APIs; Netlify Database PostgreSQL accessed server-side through @netlify/database and Drizzle; Supabase Auth for identity; Resend SMTP configured in Supabase for authentication mail. PostgreSQL memberships and grants, rather than JWT role claims, authorize every application request. Payment processing remains inactive.

All tenant records carry organization_id and composite tenant foreign keys. Time is a server-owned sequence of working and paused intervals, with conservative heartbeat accounting, explicit resume and immutable events. Approved timesheet revisions feed billable allocations and invoice drafts. Platform administration is separate from tenant administration.

## Reading order and deliverables

1. [Architecture overview](01-architecture.md)
2. [Domains and dependencies](02-domains.md)
3. [Database schema proposal](03-schema.md)
4. [Identity and authorization](04-identity-authorization.md)
5. [Time state machine](05-time-tracking.md)
6. [DTR, timesheets and billing](06-timesheets-billing.md)
7. [Migration and deployment safety, with evidence](07-database-deployment.md)
8. [Environments and secrets](08-environments.md)
9. [Threat model and acceptance gates](09-security.md)
10. [ThriveSource MVP](10-mvp.md)
11. [Implementation roadmap](11-roadmap.md)
12. [Architecture decisions](adr/README.md)

## Decision and blocker register

| ID | Issue | Owner | Closure evidence / consequence |
|---|---|---|---|
| B1 | Native previews and agent runs clone production data; no verified pre-clone sanitization or deny control | Platform lead + Netlify support | Demonstrate previews/agent runs cannot clone real production data; otherwise use separate synthetic-data project and disable all preview creation on production project with verified platform enforcement. No real production data until closed. |
| B2 | Production migration authorization and exact target not verified | Platform lead + security reviewer | Disposable tests of push, preview, locked publish, manual publish, failed migration, rollback and target mismatch; reviewed ownership/access controls. No schema-bearing production release until closed. |
| B3 | Runtime DDL restrictions, RLS non-bypass and role provisioning unknown | Database lead + Netlify support | Verify privileges with restricted role and denied cross-tenant/DDL tests; fail closed if platform cannot support required boundary. |
| B4 | Existing Supabase project security and environment suitability unaudited | Identity lead | Sanitized audit and separate production/nonproduction identity evidence; do not reuse before approval. |
| B5 | Backup entitlement, pre-change snapshot ordering and recovery unverified | Operations lead | Confirm actual account plan, retention, snapshot semantics; isolated restore rehearsal with measured RPO/RTO and reconciliation. No launch until closed. |
| B6 | Product/security policy approval outstanding | Product owner + security lead | Approve timezone, heartbeat loss rule, manager scope, rate/rounding and retention defaults; legal review of notices where applicable. |

GO for an approved, isolated Sprint 1 foundation and safety investigation using synthetic data only. NO-GO for production-connected implementation, production schema changes, reuse of the existing identity project or operational launch until the applicable blockers close. This is an architectural recommendation, not evidence of compliance or production readiness. Stop at Sprint 0; implementation has not begun.

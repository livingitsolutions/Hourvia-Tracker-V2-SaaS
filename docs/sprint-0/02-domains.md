# Bounded modules and dependencies

| Module | Owns | Allowed dependencies |
|---|---|---|
| Identity adapter | Supabase verification, session mapping, recovery orchestration | Supabase, security kernel |
| Organizations and access | Organizations, memberships, invitations, roles, scoped delegations | Identity IDs, security kernel |
| Entitlements | Internal grants, capabilities, seat reservations, future subscription records | Organizations |
| Clients and projects | Clients, projects, assignments | Organizations/access |
| Tracking | Sessions, leases, segments, tracking events | Access, assignments |
| DTR and timesheets | Day projections, cutoff snapshots, review transitions | Tracking read contracts, access |
| Corrections | Proposed revisions, reasons, independent approval | Tracking/timesheet commands |
| Billing | Effective rates, billable allocations, invoice drafts | Approved timesheet revisions, clients/projects, access |
| Monitoring policy | Versioned policy, delegation, notices, acknowledgments | Access; no desktop agent in MVP |
| Audit and operations | Append-only events, outbox, recovery metadata | Security kernel; receives domain event contracts |
| Platform operations | Audited global tenant support and internal entitlements | Dedicated platform authorization; explicit support grants |

Modules expose command/query interfaces. No module writes another module's tables directly. Orchestration can call several modules on a single transaction context for atomic business operations; outbox handles subsequent external delivery. Dependency direction is access -> projects -> tracking -> timesheets -> billing. Corrections invoke sanctioned revision operations rather than rewriting source events. Shared security/audit utilities have no dependency on billing or tracking.

Proposed layout, not created: src/features/* for UI, src/contracts/* for safe shared schemas, server/modules/* for domain services, server/security/*, server/db/*, db/schema.ts for Drizzle definitions, netlify/functions/* for handlers. Future native migration output is netlify/database/migrations; this reserved directory remains absent in Sprint 0. Domain logic has no direct dependency on React or SMTP.

Email is an integration boundary. Supabase sends authentication invitations/recovery via Resend SMTP; application invitations are separately authorized database records. A failed email never grants access. The outbox stores minimal template references and IDs rather than bearer invitation tokens in logs or general audit payloads. Reconcile auth invite delivery with application invitation state without distributed transactions.

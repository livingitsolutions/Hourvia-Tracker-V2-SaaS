# Architecture decision records

All records dated 2026-11-08. Status: proposed pending Sprint 0 approval. The confirmed stack is a user constraint; operational capabilities remain subject to evidence.

| ADR | Decision and rationale | Tradeoff / consequence |
| --- | --- | --- |
| 001 | Modular monolith on React/Vite/strict TypeScript/Tailwind v4 and Netlify Functions | Simple transactional boundaries and operations; enforce module interfaces to prevent coupling |
| 002 | Netlify PostgreSQL/Drizzle stores application records; Supabase only authenticates | Separate authorities avoid stale JWT organization roles; every request needs current DB authorization |
| 003 | Organization-first tenancy with composite tenant FKs and default-deny authorization | More verbose keys and queries; multi-org users and one-member companies work without personal workspace exceptions |
| 004 | Separate platform roles, scoped org roles, independent reviewer and revocable local sessions | More authorization modeling; super admin is not implicit tenant superuser and solo self-approval is unavailable |
| 005 | Internal permanent ThriveSource entitlement separate from subscriptions | Requires explicit grant evaluator and admission locking; no payment dependency or name-based bypass |
| 006 | Server timestamped tracking with heartbeat leases and explicit reconnect resume | Browser cannot prove continuous connectivity; conservative lost-tail accounting needs product approval and correction UX |
| 007 | Immutable raw evidence and revisioned timesheet approvals/corrections | Increased storage and state complexity; approved totals and billed allocations stay reproducible |
| 008 | Effective-dated client billing, no payroll | Currency/rate snapshot complexity; avoids premature payroll/payment scope |
| 009 | Monitoring OFF; advanced desktop monitoring deferred | Less initial monitoring functionality; transparent policy and consent remain future activation prerequisites |
| 010 | Separate synthetic development site; production preview/agent forks must be prohibited | Extra environment cost; enforceability unresolved, default production-data branching unacceptable |
| 011 | Explicit release owner, protected native migration publication, expand/contract and rehearsals | Native auto-detection is convenient but independently authorized release control remains DB-01; public custom workflow is an alternative only after platform-policy approval |
| 012 | No reliance on publishing locks or app rollback for DB safety | Extra release controls and recovery drills; documented auto-publish timing is not proof of all lock semantics |
| 013 | In-memory SPA sessions/PKCE initially; exact redirect allowlist; project-isolated dev identity | Reload login friction and residual XSS risk; BFF cookie design requires a separate CSRF/refresh decision |
| 014 | Installable static shell only; no offline time commands/private caching | Reduced offline utility; prevents queued events fabricating online tracking |
| 015 | RLS/non-owner runtime desired as defense in depth, conditionally approved only after proof | Managed roles and adapter behavior unknown; application checks and FKs alone do not settle runtime compromise risk |
| 016 | Least-privilege, environment-scoped secrets; no V1 credentials/data import | Additional provisioning/audit work; project reuse cannot inherit V1 application permissions |

Revisit records 006, 010, 011, 013 and 015 with implementation evidence before locking the corresponding contracts. Document changes in a new superseding ADR rather than rewriting evidence of previously approved decisions.

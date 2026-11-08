# Architecture decision records

All records are proposed on 2026-11-08. They become accepted only after Living IT Solutions review. These records state decisions and consequences; they do not claim implementation.

## ADR-001 — Modular monolith

Context: tracking, approvals and billing share strong invariants and a small initial delivery team. Decision: one versioned Netlify Functions API with bounded domain modules and shared PostgreSQL transactions. Alternative: microservices would introduce distributed consistency and operations costs before measured need. Consequence: enforce module interfaces and transaction ownership; scale handlers/read projections before extracting services.

## ADR-002 — Organization-first tenant boundary

Decision: no personal workspaces; users have multiple memberships; all organization-owned data carries tenant keys and composite FKs, with server capability checks and restricted-role RLS where technically supported. Alternative: UUID-only or frontend role checks cannot enforce tenant isolation. Consequence: every repository/query and integration test carries tenant context; B3 blocks claiming defense in depth until verified.

## ADR-003 — Split identity from authorization

Decision: Supabase Auth handles identity and sessions; Netlify Database holds memberships and grants. Resend SMTP delivers authentication mail through Supabase. Alternative: JWT organization roles would become stale and tie application authorization to identity configuration. Consequence: per-request authorization checks, explicit application revocation and B4 audit; no automatic legacy membership import. Existing Auth project reuse remains conditional.

## ADR-004 — Time evidence and conservative connectivity

Decision: server UTC events, serialized commands, confirmed work intervals, explicit Resume and immutable corrections. Alternative: client timestamps/offline event queues permit backdating and violate online-only policy. Consequence: legitimate tail time can be excluded and brief gaps cannot be measured exactly; B6 must approve stated uncertainty. Monitoring is not proof of work or connectivity.

## ADR-005 — Approved revisions drive billing

Decision: timesheet snapshots and independent correction review produce immutable approved revisions; effective rate snapshots and unique allocation links feed invoices. Alternative: billing mutable live totals can change issued amounts silently. Consequence: corrections require superseding revisions and later adjustments; singleton organizations need an independent reviewer for approved totals.

## ADR-006 — Internal entitlement independent of subscription

Decision: ThriveSource has a protected permanent internal unlimited-seat grant; future plan/subscription records are separate capability sources. Alternative: a perpetual trial or zero-price subscription still couples internal operations to billing state. Consequence: resolver prioritizes valid internal grant independently of subscription expiry; no payments are activated.

## ADR-007 — Native migration lifecycle is a production risk boundary

Decision: default platform integration uses Drizzle definitions and reviewed native migration artifacts, with no build/startup mutation. Document publish-time execution, require artifact/target authorization and disposable rehearsals. Alternative: manual out-of-band migrations are publicly documented but require a separate workflow decision; not implemented or silently substituted. Consequence: B2 remains unresolved until native controls meet requirements; publishing locks alone are insufficient. No migration artifacts in Sprint 0.

## ADR-008 — No production copies in untrusted previews

Decision: require platform-enforced pre-clone protection or separate synthetic development projects and verified disabling of production previews/agent runs. Alternative: sanitize after copy or password-protect previews does not prevent code from reading copied records. Consequence: default branching is not acceptable for sensitive production data under these requirements; B1 blocks real-data use pending proof.

## ADR-009 — Monitoring disabled, desktop deferred

Decision: no collector at launch; policy defaults false, permission and consent/OS gates required for any future collection. Alternative: desktop monitoring would expand threat and release scope before operational tracking launches. Consequence: policy ownership remains explicit; desktop platform/security design is a separate later decision.

## ADR-010 — Online PWA and browser token handling

Decision: cache public shell only, no offline work or auto-resume; initially keep SPA Auth session in memory with bearer requests. Alternative: localStorage persistence increases token exposure; BFF cookies improve durable-session protection but add CSRF/session complexity. Consequence: reload may require sign-in; persistent session UX needs a revised ADR, not an unreviewed storage switch.

## ADR-011 — Recovery and compatible releases

Decision: expand/contract schema changes, forward repair, measured restore runbooks and exact backup/schema/code pairing. Alternative: code rollback alone does not reverse PostgreSQL schema; immediate destructive down-migration can destroy newer work. Consequence: proposed 15-minute RPO is not met by documented daily backups; B5 requires capability evidence or explicit target revision.

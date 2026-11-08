# Threat model and security acceptance gates

## Assets, adversaries and boundaries

Protect tenant work records, rates, client contacts, invoices, identity sessions, invitations, internal entitlements, audit evidence and backups. Adversaries include unauthenticated attackers, malicious members/managers, compromised tenant admins, stolen browser sessions, malicious dependency/build code and overly privileged operators. Boundaries are browser/Auth, browser/Functions, Functions/PostgreSQL, source/build/runtime and platform operators/customer data.

| Threat | Design mitigation | Required evidence |
|---|---|---|
| Cross-tenant IDOR or join leakage | Composite FKs, scoped repositories, current membership and RLS if supported | Two-tenant tests for every endpoint, nested IDs, exports and writes; DB constraint rejection |
| JWT spoofing/replay/stale privilege | Signature/issuer/audience/session checks, DB roles, revocation | Wrong issuer/audience/key/algorithm, expired token, suspended membership and removed session tests |
| Invite theft/replay/account confusion | Digest, TTL, verified recipient, one-time transaction, exact callbacks | Concurrent acceptance, wrong account, expired/revoked invite, redirect abuse tests |
| Privilege escalation/self-approval | Capability ceiling, independent review, scoped delegation, last-owner invariant | Concurrent demotions, manager scope changes, self-review and platform-role separation tests |
| Timer inflation/races | Server times, confirmation windows, versions, row locks | Multi-tab/device, delayed heartbeat, reordered packets, double command and suspend race tests |
| Financial tampering/double billing | Immutable approved revisions, rate snapshots, allocation uniqueness | Parallel prepare, rate-overlap, rounding and post-approval correction tests |
| SQL injection or XSS | Parameterization, bounded runtime schemas, escaped text, CSP | Injection tests, stored-description rendering, CSP report review and dependency scanning |
| Secret/data exposure through previews | Environment isolation and pre-clone enforcement | B1 verification before production records exist |
| Destructive release or privileged runtime | Migration ownership, digest-bound release, restricted DB role | B2/B3 disposable tests and access review |
| Data loss/false recovery assumption | Compatible releases, verified snapshots and restore plan | B5 measured restore and reconciliation |
| Monitoring abuse | Disabled default, authorization, visible notice and consent | Unauthorized policy writes denied; no collector runs when disabled or lacking permissions |
| CSV injection / export leakage | Cell neutralization, scoped export, no-store | Formula/control-character payloads and cross-tenant CSV denial |
| DoS and dependency outage | Shared rate limits, bounded inputs/queries/pools, fail closed | Load/backpressure tests and Auth/DB outage tests |
| Insider audit manipulation | Runtime append-only grants, access logs, retained evidence | Update/delete denied; privileged override acknowledged and reviewed |

## Monitoring policy boundary

Monitoring is OFF by default and no desktop collector is built for ThriveSource MVP. Policy changes require owner/admin or an explicitly delegated manager capability, with organization/project/team scope, version, reason and audit. Members/contractors may view notices, acknowledge or withdraw consent where applicable; they cannot edit policy. Policy enabled does not itself authorize collection. Any future collector also requires visible current notice, lawful consent/basis review where required, current OS permission, supported scope and retention configuration. OS denial or consent withdrawal stops applicable collection; never bypass OS controls. No hidden screenshots, keylogging or covert agent. Reassess the threat model before advanced desktop work.

## Acceptance gates

G0 — Architecture: approve ADRs, B6 policy defaults and blocker ownership. Sprint 0 produces proposals only.

G1 — Isolated foundation: prove synthetic environment identity, no production credentials, required CI checks, strict TypeScript and security headers; audit Supabase reuse (B4) before connecting existing project. No real data.

G2 — Platform/database: close B1/B2/B3 with sanitized provider confirmation and disposable technical tests; verify RLS/privileges, tenant FKs, migration target rejection and code/schema rollback compatibility. Process-only promises are insufficient.

G3 — Identity/access: token/session verification, invitations, recovery, revocation and full role matrix tested. Establish named platform/tenant bootstrap operators with MFA. Define residual upstream revocation window explicitly if any; immediate application membership revocation required.

G4 — Work evidence: full state machine/property and concurrency tests, online-loss semantics approved, DST/cutoff fixtures, corrections and independent review validated. No approved total can change silently.

G5 — Billing/operations: rates/allocations/CSV tests, backups and measured restore, alert drills, incident runbooks, access review and retention decisions complete. RPO target changes require explicit approval.

G6 — Launch: complete end-to-end ThriveSource pilot using approved fixtures then authorized launch data, product/security review of remaining issues, named incident owner and rollback decision maker. Open critical/high tenant/auth/data-loss findings block launch. No claims of compliance or readiness solely from passing this document review.

## Test and observability plan

Use domain unit/property tests for durations, transitions, cutoff splits and rounding; PostgreSQL integration tests for FKs, RLS, constraints and locks; API tests for authorization; browser tests for PKCE, invitation/recovery, offline behavior and no auto-resume. Use realistic synthetic fixtures only. Add dependency/secret scanning and static analysis to CI. Independent security review precedes launch; record evidence and exceptions, never checkboxes without artifacts.

Structured logs contain request/event IDs, safe tenant/member identifiers, route, latency, outcome and deploy version. Restrict operational access and define retention. Metrics cover Auth verification errors, permission denials, state conflicts, heartbeat expiry, DB pool saturation, slow queries, outbox lag, export load, migration failures and backup age. Initial alerts: elevated 5xx/latency against agreed SLO, sustained pool saturation, backup older than accepted RPO, missing heartbeats and unexpected privilege changes. Thresholds require baseline tuning. Alert payloads exclude work descriptions and personal content. Business audit and operational telemetry have separate permissions and retention.

Incident runbooks cover stolen session, tenant leakage, stuck tracking lease, erroneous billing, faulty migration and restore. Stop affected writes/exports, revoke access, preserve sanitized evidence, communicate through authorized channels and reconcile authoritative revisions before reopening.

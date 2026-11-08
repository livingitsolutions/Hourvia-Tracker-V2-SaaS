# Threat model and security acceptance gates

Assets: identity/session credentials, organization membership, personal time records, client rates, invoice evidence, monitoring consent, audit history and production data. Adversaries include unauthenticated callers, malicious members/managers, compromised sessions, hostile PR/build code, privileged operator mistakes and compromised dependencies. Trust boundaries are browser→Supabase, browser→Functions, Functions→database, deploy/build→database control plane, and Supabase→Resend. Client input and repository PR code are untrusted.

| Threat / abuse case | Intended control | Required evidence before launch |
| --- | --- | --- |
| IDOR or cross-tenant join | Org-scoped authorization, composite FKs, scoped export queries, RLS if enforceable | Tenant A cannot read/write/review/export B across every endpoint, guessed ID and nested relationship; DB FK rejection tests |
| Forged/stale JWT, wrong issuer | Strict verifier, explicit audience/algorithms, bounded JWKS refresh | Forged/expired/wrong-project/wrong-audience tokens denied; key rotation/outage behavior demonstrated |
| Suspension bypass with existing JWT | DB session/membership checks inside transactions | Session denial, demotion and suspension deny next request; race test with in-flight commands and no silent re-registration |
| Invitation theft/replay/escalation | Hashed single-use expiry, verified email match, role scope, atomic admission | Expired/revoked/consumed/wrong-account token denied; concurrent acceptance activates once; no account linking by unverified email |
| Recovery takeover/open redirect | PKCE, exact redirects, generic responses, rate limits, no role mutation | Callback/recovery replay and external next URLs denied; no tokens in logs/referrers |
| Owner loss or manager privilege escalation | Org lock, last-owner invariant, delegated scopes | Concurrent last-owner removal fails safely; manager cannot expand scope, monitor policy or self-review without permission |
| Time fabrication / overlapping billing | Server timestamps, lease expiry, command versions, nonoverlap constraints | Multiple tabs, repeated/out-of-order commands, client clock skew, disconnect and heartbeat races; no duplicate work intervals |
| Inaccurate dates/totals | UTC interval arithmetic, IANA cutoff snapshots, integer seconds | DST forward/back, leap-year February, month-end, overnight and cutoff splits; totals reconcile exactly to sources |
| Unauthorized correction or double invoice | Independent review, revision snapshots, allocation uniqueness | Self-review denied; pending changes do not affect approved totals; concurrent billing claims once; superseded revisions bill deltas only |
| Covert monitoring | OFF default, delegated policy, visible notice, no desktop collection | Member policy writes denied; all collection paths absent in MVP; legal/consent review before activation |
| XSS / CSV injection / injection attacks | CSP, escaped text, schema validation, SQL parameters, CSV neutralization | Stored description/name payloads cannot execute; formula/control-prefix CSV cells neutralized; SQL injection tests |
| Production migration by Git push | Independent release gate and restricted deploy control | DB-01 negative test: unauthorized Git/preview/build/publish cannot execute production schema changes |
| Production data in previews | Separate synthetic site plus enforceable production fork prohibition | DB-02 proof for PRs, branch deploys and agent runs; post-clone redaction fails the gate |
| Runtime database takeover | Least privilege, tenant context, no migration authority | DB-03 deployed role denies DDL, audit mutation and cross-tenant access; pooled context isolation |
| Failed deploy / accidental destructive SQL | Expand/contract, rehearsals, backup and recovery | DB-04 restoration drill meets accepted RPO/RTO; old app works after migration and failed publication |
| Secrets in source/build/logs | Scoped credentials, secret scanning, log redaction | Browser bundle/artifact inspection; no production secret accessible to untrusted builds |
| Abuse/cost exhaustion | Rate/body/range limits, bounded exports, connection budgets | Load and burst tests demonstrate degradation with safe 429/503 and no pool exhaustion |

## Required gates and ownership

Security lead signs identity/authorization and adversarial tests; database release owner signs migration/restore evidence; product owner signs tracking and approval policy; operations signs alerts and runbooks; organization owner approves monitoring/retention notices. Assign named people in Sprint 1. No one approval substitutes for another gate.

G0 — safe implementation environment: approved Sprint 0 decisions, separate synthetic development boundary, no production secrets or forks, protected source and scoped developer access. This permits foundation work only.

G1 — identity audit: reuse decision, signing and session configuration, invitation-only enforcement, environment redirects, test delivery, MFA/recovery and revocation evidence. Existing Supabase reuse is prohibited until passed.

G2 — schema authorization: DB-03 resolution, tenant and concurrency tests, immutable history enforcement and independent review. If RLS is unsupported, the alternative protection and runtime privilege risk need explicit security acceptance; do not label that RLS-equivalent.

G3 — tracking/accounting: approved lease semantics, cutoff timezone, project/description rules, state-machine and DST/concurrency evidence, contractor-visible disconnect behavior.

G4 — timesheet/billing: independent reviewer availability, approved correction revisioning, deduplication, currency/rate rounding and export security verified.

G5 — release/recovery: DB-01, DB-02 and DB-04 closed, scoped credentials, approved artifact/target, synthetic rehearsals, production deployment controls and backup drill evidence.

G6 — controlled ThriveSource pilot: gates G1–G5, known-risk register, incident owner, support/recovery runbooks, measured performance/cost, visible privacy notice and documented pilot acceptance. Production readiness/compliance cannot be claimed from this blueprint.

## Verification strategy and operations

Later implementation needs unit tests for state transitions, permissions, entitlement evaluation and deterministic UTC calculations; real PostgreSQL integration tests for tenant constraints, transactions and races; API tests for each permission/object-scope combination; and browser tests for invitation, recovery, tracking disconnect and CSV workflows. Avoid tests that merely duplicate implementation. Test forbidden paths and failed atomic operations explicitly. Use synthetic fixtures with at least two orgs, multi-org user, scoped manager, suspended member and solo owner.

Dependency/secret scanning, strict TypeScript, linting and security review are release checks; frontend role visibility is UX only. Audit event contents need minimization and retention review. Proposed audit retention is one year and operational logs 30 days, subject to contract/legal approval; no automatic deletion is authorized by this document. Financial retention may differ by jurisdiction. Conduct privacy/data residency/subprocessor review before launch without claiming GDPR, SOC 2, labor-law or payroll compliance.

Incident runbook must cover account/session compromise, tenant exposure, malicious invitation, incorrect billing, production schema incident and leaked secret: stop affected operations, revoke local access, preserve minimal evidence, rotate authorized credentials, assess scope, restore with approval, reconcile records and communicate through the approved incident owner. No notification or external message was sent in Sprint 0.

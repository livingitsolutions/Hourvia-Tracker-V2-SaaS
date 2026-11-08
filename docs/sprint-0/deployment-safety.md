# Netlify Database deployment and environment safety

## Evidence record — read-only investigation, 2026-11-08

Public primary sources fetched successfully:

1. [Database overview](https://docs.netlify.com/build/data-and-storage/netlify-database/) — production deploys use main database; deploy previews and agent runs receive database branches; previews copy production data at creation.
2. [Migrations](https://docs.netlify.com/build/data-and-storage/netlify-database/migrations/) — native detection, ordering, production/preview timing, auto-publishing behavior, optional custom migration workflow, expand/contract.
3. [Getting started](https://docs.netlify.com/build/data-and-storage/netlify-database/getting-started/) — provisioning during deployment and local database development.
4. [API reference](https://docs.netlify.com/build/data-and-storage/netlify-database/api/) — environment-selected connections, connection override, transactions, branch parent selection and snapshot/restore endpoints.

These are documented behaviors, not results of a deployment experiment or vendor assurance. No production access, provider API calls, migrations, database initialization, build or deployment occurred. No failure/rollback/lock behavior was experimentally verified. Documentation can change; pin SDK/CLI versions and recheck these sources at implementation time.

| Question | Documented result | Confidence / remaining work |
| --- | --- | --- |
| Native detection | SQL files or migration.sql subdirectories under netlify/database/migrations; lexicographic order | Documented; generated SQL/checksum ledger still needs tests |
| Production timing | Immediately before publication; failure blocks publication | Documented; partial-application atomicity and concurrent publish behavior unverified |
| Preview timing | Every new deploy before availability; failure fails deploy | Documented; migration branch must still be independently identified |
| Auto-publishing disabled | Docs say migration waits until manual publication | Documented, not a complete authorization boundary |
| Publishing lock | No reviewed source establishes all lock/API/agent/schema interaction semantics | Unresolved; never equate lock with migration prevention |
| Preview isolation | Preview schema/data writes do not affect main | Documented; isolation from writes is not confidentiality isolation |
| Preview contents | Production copy when branch first created | Documented conflict with no production data in untrusted previews |
| Custom migration ownership | Native system optional; use another directory; no arbitrary publish-time custom hook | Documented capability, proposed alternative requires approval and platform-policy reconciliation |
| Explicit branch parent | Branch API accepts parent_branch_id, default production | Does not prove automatic preview/agent forks can be forced to synthetic parent |
| Least privilege | API permits connection override | Does not prove custom role/grant/RLS/credential lifecycle support |
| Recovery | Snapshot/list/restore API documented, restore defaults to production | Retention, consistency, PITR, restore isolation and recovery time not verified |

## Proposed ownership and fail-closed boundary

Living IT Solutions assigns one named database release owner and a separate security/release approver before schema work. Schema changes require two reviews, migration artifact digest, immutable applied history and a release evidence record. GitHub branch protection/CODEOWNERS and required checks protect schema, workflows and deployment configuration; administrative bypass remains a documented privileged risk. Organization owners cannot run database migrations.

Under the current platform workflow, native migrations are mandatory when implementing database changes; this blueprint does not override that rule or introduce an alternate runner. Public documentation also supports an out-of-band custom workflow. If native migration coupling cannot satisfy independently authorized schema release requirements, choosing a custom runner requires explicit platform agreement and a revised ADR before implementation. Do not silently move migration files to another directory as a supposed solution.

Until enforcement is verified, keep production DB integration and recognized migration artifacts absent from production deployment inputs, and do not load sensitive data. An absence check is defense in depth, not a substitute for deployment permissions: malicious build code could still connect with inherited credentials. No Vite/Netlify build script may contain migrate/push/DDL, seed production data, or download production credentials. No `drizzle-kit push` anywhere in the release process. Production schema execution may occur only in an approved release, by the supported platform mechanism, after rehearsal evidence and explicit target confirmation.

A normal Git push must not be enough to mutate production schema. Proposed enforcement combines protected main, restricted production deployment/publish permissions, no untrusted production builds, an independent release gate, and inspection of exact artifacts before authorized publication. Whether the provider can enforce these independently of repository changes and publishing locks remains DB-01. If not, production use remains blocked; procedural instructions alone are insufficient.

## Environment design

| Environment | Site/database | Identity and mail | Trust boundary |
| --- | --- | --- | --- |
| Local | Local Postgres via supported development tooling, synthetic fixtures | Separate dev Supabase/test sender | No prod data or credentials |
| CI/untrusted PR | No production site/database connection; disposable synthetic-only DB/site | Mock identity or dedicated nonprod project | No privileged secrets or prod-fork capability |
| Trusted integration/staging | Separate Netlify site with synthetic parent DB, disposable rehearsal branches | Separate nonprod Supabase and test mail | Synthetic data only; identical schema lineage |
| Production | Dedicated production site/main DB | Audited production Supabase and Resend sender | Only approved release operators and runtime |

Disable production-site Deploy Previews, branch deploys and agent/database branching before sensitive data, and prove they cannot be recreated by untrusted workflows or inherited team permissions. All preview development should originate from the separate synthetic site. This proposed topology does not establish an enforceable prohibition on every automatic production fork: DB-02 remains open until platform controls and negative tests confirm it. Post-clone sanitization is insufficient because exposure already occurred. A synthetic parent_branch_id on a manually created branch is not evidence that automatic branches use it. No preview branch is promoted or merged into production; promote reviewed code/schema artifacts and apply them independently to verified main.

## Release and rehearsal checklist — future work, not executed

1. Release owner identifies exact commit, dependency lockfile, schema artifact digest and supported platform versions. Inspect generated migration SQL, destructive changes, locks, row-count effects and required extensions. No applied migration edits.
2. Security reviewer confirms no production credentials/data in build or preview, environment identity, site/deploy type and target branch from a trusted control-plane source independent of request inputs. Compare expected immutable site/branch IDs to approved inventory. Do not infer target from a branch label, hostname or arbitrary environment override alone. Fail closed on ambiguity.
3. Rehearse migrations on a disposable synthetic database with representative volume and constraints. Run both old and new application contracts, concurrency, migration failure, duplicate execution and recovery tests. Capture lock duration, elapsed time, resulting schema digest and ledger. Never clone production to rehearse in an untrusted environment.
4. Confirm verified backup and restoration evidence, approval, maintenance/communication plan and operational owner. Native publication must be restricted to the reviewed production artifact; a preview artifact/DB cannot become the production source.
5. Apply backward-compatible expand changes through the approved platform publication path only after target verification. Ensure the old deployed app remains compatible if publishing fails after a schema change. Serialize schema releases; check ledger/drift before and after using authorized tooling.
6. Verify application smoke checks, migration ledger, schema version, authorization denials and alerts. Halt rollout on uncertainty. A failed deploy does not prove the schema stayed unchanged; inspect through the authorized recovery process.
7. Retain old columns/contracts through a stated rollback window. Perform bounded, restartable backfills later, validate counts, switch reads, and contract only in a separately approved release after the window closes. Never combine destructive contract with its first consumer rollout.

Rollback application artifacts only to a schema-compatible version. A Netlify deploy rollback is not a database rollback. Prefer forward-fix migrations. Snapshot restore is disaster recovery with a write fence, explicit target and data-loss assessment; it can discard writes made after the snapshot and must not be an ordinary deploy undo. Determine how identity state outside Netlify will reconcile after a restore.

## Backup and recovery proposal

Provisional targets, not guarantees: RPO ≤15 minutes, RTO ≤4 hours; security and operations must validate provider capability and cost. Establish encrypted automated backups/PITR if supported, pre-release snapshots, a proposed 30-day recovery retention, quarterly synthetic restore drills, backup access segregation and audit. Verify residency, deletion propagation, encryption/key ownership, retention, snapshot consistency, export portability and provider incident procedure. If PITR or targets cannot be met, approve revised targets or block launch.

Restore first into an isolated trusted target with no outbound mail or tracking ingestion. Verify migration ledger/schema, tenant counts, balances, approvals and invoice claims before controlled cutover. Document write fence, outstanding outbox handling, idempotency keys, session invalidation and reconciliation. Two-person approval for a production restore; never accept the API's default production target implicitly. API existence alone is not evidence of a working recovery plan. DB-04 remains open.

## Secrets and environment policy

Only names/purpose belong in documentation. Never store or print secret values, connection URLs, tokens, email links or full provider API responses. No V1 credential copying. Obtain each V2 credential through an authorized provider workflow after the audit. Production, staging, CI and local scopes are separate; avoid all-context secret inheritance. Runtime gets only needed application DB/mail/auth verification access. Migration administration and Supabase administrative credentials never enter browser bundles or untrusted builds. No privileged key has a `VITE_` prefix.

Use dedicated environment-scoped provider identities where supported, minimal permissions, audited access, rotation and revocation playbooks. Proposed browser configuration contains only Supabase URL/publishable key and nonsecret API origin. Production SMTP credentials stay in Supabase's protected configuration, not frontend or source. App invitations using direct Resend delivery need a separate server-only key and restricted sender. Resend SPF/DKIM/DMARC and delivery behavior require audit and test, not assumptions. Exact callback URLs are per environment; do not authorize all Netlify subdomains. Monitor secret scanning and lock down build logs/artifact access.

The platform-selected DB connection does not itself prove a non-owner least-privilege role. Verify custom credentials or managed grants, DDL denial, audit mutation denial, no BYPASSRLS, pool reset and rotation. Where unsupported, mark the risk blocked pending an explicitly accepted alternative; never claim it solved.

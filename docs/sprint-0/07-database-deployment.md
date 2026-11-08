# Netlify Database migration and deployment safety

## Evidence and investigation limits

Public documentation was fetched on 2026-11-08 using unauthenticated HTTPS. No database, live connection details, Supabase account, environment values or production APIs were accessed. These are documented platform behaviors, not observed deployment experiments. The supplied project snapshot reports no database, while the run context says managed PostgreSQL is available with no migrations; treat this as availability without verified provisioning, not permission to connect. No build or migration commands were run.

| Source | Finding |
|---|---|
| [Database overview](https://docs.netlify.com/build/data-and-storage/netlify-database/index.md) | Production deploys access main database; previews receive branches copied from production at first creation; preview mutations do not change main. Agent runs also receive branches. This protects integrity, not confidentiality of copied records. |
| [Migrations](https://docs.netlify.com/build/data-and-storage/netlify-database/migrations.md) | Reserved directory is netlify/database/migrations; SQL files or subdirectories with migration.sql; lexicographic ordering. Production migrations execute immediately before publication and failure blocks publication. Preview migrations execute before each preview becomes available. With auto-publishing disabled, native production migrations wait for manual publish. |
| [Migrations: manual workflow](https://docs.netlify.com/build/data-and-storage/netlify-database/migrations.md#manual-migrations) | Native system is optional; external migration directory avoids auto-detection; manual workflow owns targeting and timing. No platform hook for arbitrary logic at publish; backward-compatible out-of-band migration is recommended. This is a documented alternative, not approved or implemented here. |
| [Backup and recovery](https://docs.netlify.com/build/data-and-storage/netlify-database/backup-and-recovery.md) | Scheduled daily backups and on-publish backups. Code rollback does not restore schema/data. Manual publish runs pending native migrations; direct preview publication is disallowed for projects with a database. Dashboard restore replaces production and requires Team Owner; pre-restore branch preserves prior state. |
| [Access control](https://docs.netlify.com/build/data-and-storage/netlify-database/access-control.md) | Dashboard/infrastructure roles control production viewing, editing, connection retrieval and restore. This is not proof that application connections have least-privilege SQL roles. |
| [API reference](https://docs.netlify.com/build/data-and-storage/netlify-database/api.md) | Automatic environment connection selection; branch API defaults parent to production if omitted; snapshots/restore API default to production if branch omitted. Never use these defaults in a safety workflow. |

The backup page describes on-publish timing both as “once ... goes live” and “just prior” to automatic publishing. It does not establish precise snapshot-before-migration ordering. Verify this before treating on-publish backup as a pre-migration recovery point. API reference exposes branch-targeted snapshot restore, while dashboard guidance says restores replace production; confirm supported recovery route and privileges rather than assuming a safe nonproduction restore.

## Publishing locks are insufficient

A Git push with native migrations and automatic publishing can change production schema. Documentation says a publishing lock delays native migrations until manual publishing; it does not independently authorize migration contents, restrict a different migration runner, protect data cloning or restore old schema during rollback. A human publishing a deploy can still trigger every pending migration. Build scripts, plugins and credentials can introduce independent mutation paths. A lock is a release aid, never the sole database security boundary.

For native migrations the local setup guidance expects generated files in the reserved directory, and the platform applies them. No Sprint 0 file is placed there. Do not silently relocate generated migrations as a claimed solution. If independent production migration authorization cannot be achieved with native behavior, B2 remains blocked. A separately approved ADR may evaluate the documented manual alternative; that requires revisiting platform workflow constraints before implementation, not adding a custom runner now.

## Required ownership and release controls

Database lead owns schema definitions and generated SQL. Security reviewer owns tenant isolation and privileges review. Release manager owns production publication. Operations owner owns backups/restores. Require two-person review for schema-bearing releases; authors cannot approve their own changes. Protected GitHub main branch, required status checks, CODEOWNERS and protected environment approvals are proposed controls, not settings verified or changed in this run. Document Netlify Team Owner/Developer abilities to bypass or manually publish and audit their use. Restrict dashboard roles, automation tokens, plugins and connected applications.

Schema delivery workflow after approval:

1. Prepare Drizzle definitions and named generated migrations on a trusted development project with synthetic data. Pin @netlify/database and compatible drizzle-orm@beta/drizzle-kit@beta resolved versions. Review SQL including grants, RLS, destructive operations, lock duration and data backfills. Applied migrations are immutable; roll forward with new files.
2. Independently identify target project, deploy context and database branch through trusted platform metadata. Assert expected non-secret project/branch identifiers, environment marker and migration manifest hash. An environment variable or application row alone is not proof of the platform target. Never log a connection URL. Reject missing, production-default or mismatched targets. Test spoofed context and accidental production fallback.
3. Rehearse from empty schema and last released schema on disposable synthetic-data databases. Verify full upgrade chain, lock timeout, migration failure/retry, integrity, tenant leakage tests and compatibility with old/new code. Destroy rehearsal environments through reviewed operations after evidence capture.
4. Require release approval tied to immutable commit/artifact, exact migration digest and target. No migration in build scripts or startup handlers. Fail release if pending/missing/out-of-order history or schema drift is unexplained. Serialize schema-bearing production publishes and verify platform behavior under concurrency.
5. Confirm restorable pre-change backup/snapshot, approved maintenance plan and abort thresholds before the production publication decision. No automatic backup ordering assumption. Platform native publication must be proven to respect required authorization and correct branch; otherwise do not proceed.
6. Publish only a reviewed production deploy from protected main, never promote preview database contents or credentials. Verify applied migration ledger and smoke checks without copying sensitive data into evidence. Record release ID, schema manifest, actor and backup reference.

No preview-to-production data/schema branch merge is part of the design. Rehearsed migration files are reviewed source artifacts; production independently applies them. Preview branch connection details never enter production configuration. API support for branch creation with a selectable parent does not prove the automatic preview creation process can be safely overridden before cloning.

## Preview confidentiality and environment separation

Default copying of production rows violates the no-production-cloning-to-untrusted-previews requirement even when code cannot mutate production. Sanitizing after the copy is too late: preview code/build plugins may already read it. Do not allow untrusted previews or agent runs on a project containing real data until a documented and tested pre-clone control exists.

Preferred candidate: separate production project with preview/branch/agent creation disabled and verified; separate development project whose main database contains only synthetic fixtures, with previews branching only from that synthetic database. This still uses Netlify Database. Exact platform enforcement and agent behavior are not verified: B1 remains open. If Netlify cannot enforce the separation, halt production adoption and obtain an approved platform resolution; do not assert a GitHub review workflow prevents cloning. Preview access passwords do not prevent preview code from exfiltrating cloned data.

## Reversibility and recovery

Use expand -> backfill -> switch -> contract over separate releases. Bound lock/statement timeouts and validate row counts; large backfills run resumable and idempotent under explicit reviewed ownership. Keep prior code compatible until rollback window expires. Delay drops/renames and destructive constraints until compatibility is proven. Failed publication can leave successful earlier migrations applied: do not assume automatic transactional rollback of a multi-file migration set. Test actual atomicity, ledger state and retry behavior.

Code rollback is safe only if old code tolerates current schema. Prefer disabling faulty capability and forward repair. Database restore is last resort because it discards post-backup writes; stop writes/leases, capture incident evidence, choose known-good backup/schema/code pair, restore via authorized operator, verify tenant constraints and ledger, reconcile work/invoice gaps and invalidate affected sessions before reopening. Support may be needed to recover from the pre-restore preservation branch.

Proposed recovery targets: RPO <=15 minutes and RTO <=4 hours, subject to budget and acceptance. Documented daily backups alone cannot meet a 15-minute RPO. Verify snapshot scheduling or continuous recovery capability, retention, cost and secure restore rehearsals; if unavailable, explicitly change target with owner approval or remain blocked. Current account plan label does not map reliably to documented Credit-based Free/Personal/Pro/Enterprise retention, so no retention entitlement is asserted. Confirm encrypted backups, access audit and applicable region/residency terms before launch. Rehearse recovery at least before launch and quarterly thereafter; retain sanitized measured evidence.

## Disposable verification matrix — future authorized work only

| Test | Expected safety outcome |
|---|---|
| Push schema change with auto-publish locked | Native migration remains pending until authorized publish; no custom mutation path |
| Manual production publication | Only reviewed digest applies to verified synthetic main target; audit identifies actor |
| Preview and agent creation | No real production records cloned; deny path or synthetic project separation demonstrated |
| Spoofed/absent branch context | Target assertion rejects before SQL mutation |
| Migration fails after earlier file succeeds | Inspect actual ledger/partial schema; reviewed forward recovery, never assume all-or-nothing |
| Concurrent publication | Serialization/no duplicate or reordered application |
| Roll back code | Schema unchanged; compatibility tests pass |
| Snapshot/restore rehearsal | Explicit disposable target, measured loss/recovery, known-good schema/code pairing |
| Runtime credential misuse | DDL, role grants, audit edits, RLS bypass and cross-tenant writes rejected |

These tests require separate authorization in a later sprint. None was executed during documentation-only Sprint 0.

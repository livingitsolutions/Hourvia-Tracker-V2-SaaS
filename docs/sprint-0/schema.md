# PostgreSQL schema proposal

This is a logical specification, not executable DDL. No schema or migration files were created. After approval, define the schema in `db/schema.ts` with the Netlify Drizzle adapter; pin compatible Drizzle versions (current adapter guidance requires beta releases) and review generated SQL. Do not install dependencies or generate migrations during Sprint 0.

## Conventions and tenant isolation

Use UUID primary keys, `timestamptz` instants, integer durations in seconds, decimal numeric rates, ISO currency codes and explicit state CHECK constraints. All tenant-owned rows have nonnullable `organization_id`, even children. Add UNIQUE `(organization_id,id)` to referenced tenant tables and composite foreign keys `(organization_id,parent_id)` to prevent cross-tenant references. References to a membership also verify its organization; user-only foreign keys do not prove membership. Global identity/session/platform tables intentionally have no org ownership. Index foreign keys and common `(organization_id,subject_id,start_at)` or `(organization_id,state,created_at)` access paths. Default to RESTRICT deletion of evidentiary records; archive organizations rather than cascade financial or time history.

Defense in depth: repository methods require a verified tenant context; no unscoped tenant query API. Prefer PostgreSQL RLS with a transaction-local tenant context and a non-owner, non-BYPASSRLS runtime role, including FORCE ROW LEVEL SECURITY where applicable. Pooled connections must use `SET LOCAL` inside the same transaction and never leave tenant context on a released connection. This is conditional: verify managed-role and adapter support first. An owner connection can bypass ordinary RLS; do not claim RLS protection until denial tests prove the deployed runtime role cannot bypass it. Blocker DB-03 covers this uncertainty. Composite foreign keys and application checks remain mandatory regardless of RLS.

## Global and organization tables

| Table | Principal columns and invariants |
| --- | --- |
| users | id, identity_issuer, identity_subject, display_name, disabled_at, auth_epoch; UNIQUE(issuer,subject); email is mutable display/contact data, never identity key |
| application_sessions | id, user_id, provider_session_id, issued_at, expires_at, revoked_at, auth_epoch; UNIQUE(issuer,provider_session_id); deny re-registration after revocation |
| platform_role_grants | user_id, role, granted_by, reason, starts_at, ends_at; platform role independent from membership |
| platform_access_grants | actor, organization_id, capability scope, reason, approver, expiry; time-limited break-glass evidence |
| organizations | id, name, status, reporting_timezone, version, created_at; timezone must be validated by service |
| memberships | organization_id, id, user_id, role, status, permissions_version, joined_at, removed_at; UNIQUE(org,user); retain record across reinstatement |
| manager_scopes | org, membership_id, team_id/project_id, capability, delegated_by, valid_from/to; constrain target scope shape and same-org references |
| teams / team_members | org, team id/name; member assignments with validity dates; org-wide scope must be explicit, never inferred from null |
| invitations | org, id, email_normalized, role, digest, expires_at, consumed_at, revoked_at, inviter, intended_scopes; unique token digest and at most one pending invite per email/org |
| organization_policy_versions | org, id, version, reporting_timezone, effective_cutoff, approver; historical cutoffs reference policy version |
| entitlement_grants | org, id, source, feature, seat_limit nullable, unlimited_seats boolean, valid_from/to, revoked_at, granted_by, reason; unlimited iff seat limit absent |
| plan_versions | id, code, version, feature specification, seat policy; immutable global commercial catalog, not active billing |
| subscriptions | org, id, plan_version_id, status, provider_reference nullable, starts_at/ends_at; inert in MVP; no provider secrets or payments |

ThriveSource receives an explicit internal entitlement identified by organization UUID, not display name or email domain: `source=internal_permanent`, unlimited seats, no expiry, no subscription foreign key. Subscription cancellation, trial expiry and billing outage cannot modify or override that grant. A guarded platform operation and audit are required for changes; ordinary org users cannot edit it. Entitlement evaluation is deny-by-default for features except explicit grants; admission serializes on the org row, counting active memberships plus unexpired reserved invitations. Suspended members do not consume active seats but reinstatement must recheck capacity. Avoid concurrent accept/invite oversubscription. No hardcoded bypass throughout services.

## Projects and tracking tables

| Table | Principal columns and invariants |
| --- | --- |
| clients | org, id, display_name, status, external_reference; archive rather than delete referenced clients |
| projects | org, id, client_id, name, status, billable_default; composite client FK |
| project_assignments | org, id, project_id, membership_id, valid_from/to, status; valid_to > valid_from; preserve historical assignments |
| billing_rates | org, id, project_id, optional assignment_id, currency, amount numeric(18,6), effective_from/to; amount >= 0; nonoverlapping ranges per scope/currency; assignment must match project |
| tracker_heads | user_id primary key, org, membership_id, shift_id nullable, state, version, provider_session_id, last_ack_at, lease_expires_at, heartbeat_sequence; one global head per user |
| shifts | org, id, membership_id, started_at, ended_at, end_reason, predecessor_shift_id, version; end >= start; partial UNIQUE(user_id) WHERE ended_at IS NULL for global concurrency rule |
| time_segments | org, id, shift_id, membership_id, assignment_id nullable, kind work/break/lunch, started_at, ended_at, description; work requires assignment and nonblank description; pause cannot be billable |
| tracking_events | org, id, shift_id, sequence, type, actor_user_id/system actor, recorded_at, effective_at, request_id, payload_version, minimal payload; UNIQUE(org,shift,sequence); append-only |
| command_receipts | org, actor_user_id, idempotency_key, request_digest, response_summary, created_at, expires_at; UNIQUE(org,actor,key); digest mismatch returns 409 |

Segments cannot overlap for one subject; use half-open timestamp ranges and an exclusion constraint if the required GiST operator support is available. Otherwise serialize all relevant writes on a subject row and prove absence of overlap with concurrency tests; extension support is an explicit validation item. Work/pause durations are derived from endpoints, not trusted client totals. Late expiry resolution can finalize a previously open end only once, accompanied by an event; completed raw segments are never rewritten by corrections.

## Timesheet, correction, billing and policy tables

| Table | Principal columns and invariants |
| --- | --- |
| cutoff_periods | org, id, local_start_date, exclusive_end_date, timezone, starts_at, ends_at, policy_version; unique org/local-start; nonoverlap |
| timesheets | org, id, membership_id, cutoff_id, current_revision_id; UNIQUE(org,membership,cutoff) |
| timesheet_revisions | org, id, timesheet_id, revision_number, state, submitted_at, calculation_version, total_seconds; unique revision number; immutable after submission |
| timesheet_lines | org, id, revision_id, source_segment/adjustment, project_id, billable_seconds, local_date; snapshot source allocation and seconds; >=0 and billable <= total |
| review_decisions | org, id, revision_id or correction_id, reviewer_membership_id, decision, reason, created_at; exactly one target, no self-approval; append-only |
| correction_requests | org, id, requester, beneficiary, segment reference, reason, proposed intervals and assignment, status, version; proposed rows modeled in correction_items, not unvalidated JSON |
| correction_items | org, correction_id, source_id, proposed_start/end, assignment_id, description, operation; valid interval and same-org source |
| time_adjustments | org, id, correction_id, approved_decision_id, superseded_adjustment_id, effective intervals, created_at; immutable, approved only, unique approved correction effect |
| invoices | org, id, client_id, reference, currency, state, version, prepared_at, issued_at; org-unique reference; immutable issued snapshot |
| invoice_lines | org, id, invoice_id, approved_timesheet_line_id, rate_id, seconds, rate_snapshot, amount_minor, calculation_version; preserve currency/rate provenance |
| billing_allocations | org, id, source_allocation_id, invoice_line_id, adjustment_link; unique consumed source allocation; explicit reversals/deltas, never deleting issued claims |
| monitoring_policies | org, id, version, enabled default false, purpose, retention_days, notice, effective_at, changed_by, delegation_id; no desktop collection implementation |
| monitoring_acknowledgements | org, policy_version_id, membership_id, noticed_at, consent_at nullable, withdrawn_at nullable; never infer consent from an OS permission |
| audit_events | org nullable only for platform events, id, actor/session, action, entity reference, reason, correlation_id, recorded_at, versioned minimal before/after reference; append-only |
| outbox | org, id, event_type, payload_version, payload, dedup_key, available_at, attempts, delivered_at; unique dedup key; constrained payload and dead-letter state |

All cross-table same-org and reviewer/beneficiary rules are checked in services and, where possible, constraints or triggers. CHECK constraints cannot enforce arbitrary cross-row authorization. Do not pretend a foreign key guarantees current active membership or reviewer permission. Monetary totals are reproducible snapshots, not floating-point calculations. Store actual decimals until documented rounding to currency minor units at invoice line aggregation.

## Transaction and concurrency protocol

1. Verify identity outside long DB transactions; begin a short transaction on one pooled connection. Set tenant context if supported.
2. Lock organization/membership/session authorization rows as appropriate, then the user's tracker or timesheet/invoice row in a documented consistent order. Lock multiple subject IDs in sorted order. A suspension or permission change uses the same lock protocol so it cannot race a mutation into unauthorized completion.
3. Check current authorization, expected resource version, idempotency digest and state. Lock active assignment/rate records where a command relies on them. A session revoked before the write lock check cannot authorize the write.
4. Evaluate lease expiry using server time, mutate the projection, append immutable audit/domain events and outbox rows, and persist the command response atomically. Return only after commit. Heartbeats race safely with expiry using the same tracker lock and sequence check.
5. Release connection in all paths. Retry only bounded transient conflicts. Email and large CSV rendering happen after commit, never while holding locks.

Submission locks the subject/period to prevent time changes while freezing lines. Correction approval serializes against submission and billing. Invoice preparation claims allocations transactionally; unique constraints are the final defense. Membership/owner changes lock the organization row to protect last-owner and seat invariants. READ COMMITTED plus explicit row locks/constraints is the baseline; SERIALIZABLE for multirow invariant paths if simpler, with retry tests.

Audit immutability means runtime cannot UPDATE/DELETE audit and finalized evidence, enforced with grants/triggers if supported. It does not protect against a database owner. Restricted administration, external retained audit digests/exports and tested backup controls provide additional evidence; do not claim cryptographic tamper-proof storage or regulated WORM support. Audit export storage and retention require approval before implementation.

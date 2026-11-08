# Multi-tenant PostgreSQL schema proposal

This is a conceptual design, not executable SQL or a migration. Future definitions belong in db/schema.ts with Drizzle, with reviewed generated migrations. All UUIDs are opaque server-generated identifiers. All instants use timestamptz; elapsed duration uses integer milliseconds, money uses integer minor units with ISO currency and defined currency exponent. Never use binary floats for financial totals. Soft archival does not delete financial/audit history.

## Relational conventions

Global tables are explicitly listed below; all other tables have organization_id NOT NULL referencing organizations, id UUID PK and UNIQUE(organization_id,id). Child relationships use FOREIGN KEY (organization_id,parent_id) REFERENCES parent(organization_id,id), including memberships, projects, sessions, rates, corrections and invoice lines. A globally unique UUID alone does not establish tenant ownership. Add indexes on the referencing columns. Avoid cascade deletion of recorded work or evidence.

Enable and force RLS on all tenant tables as defense in depth, conditional on B3 verification. Each same-client transaction uses SET LOCAL for trusted actor and organization context, installed only after server authorization; pool reuse must not retain context. Policies use a fail-closed missing-context rule and membership/resource scope, with both USING and WITH CHECK. The runtime role must not own tables or have BYPASSRLS, DDL or role-management rights. A separate migration owner holds DDL. Never claim RLS protects against SQL injection using a privileged connection; app resource authorization and SQL parameterization remain required. If role isolation cannot be enforced, record B3 as unresolved rather than shipping a privileged runtime unnoticed.

## Global identity and infrastructure

| Table | Key fields and constraints |
|---|---|
| users | id; identity_issuer + identity_subject UNIQUE; display_name; status; revoked_before; created_at. Do not copy passwords or refresh tokens. |
| platform_admin_grants | user_id; capability; granted_by; reason; expires_at; revoked_at; audited, out-of-band initial grant; no tenant role implication |
| application_sessions | id; user_id; Supabase session_id; environment/issuer; revoked_at; created_at; last_checked_at; UNIQUE(issuer,session_id). Store no bearer tokens. |
| organizations | id; immutable tenant key; name; timezone; status; policy_version; created_at. ThriveSource is identified by reviewed UUID, never by editable name or email domain. |
| platform_audit_events | actor/session; target organization if applicable; action; outcome; reason; request ID; recorded_at. Separate access from tenant audit. |

## Tenant access and commerce foundations

| Table | Key fields and constraints |
|---|---|
| memberships | user_id; role owner/admin/manager/member; status active/suspended/removed; version; joined_at; revoked_at; UNIQUE(organization_id,user_id). Pending invitations do not create active membership. |
| invitations | normalized_email; proposed_role; token_hash; inviter_membership_id; expires_at; accepted_at; revoked_at; version; partial unique pending invite per organization/email; token_hash globally unique |
| manager_grants | membership_id; capability; scope_kind; scoped project or team reference; expires_at; revoked_at; explicit delegation provenance; no arbitrary JSON permission predicates |
| teams / team_members | named organization teams; composite membership references; unique member per team; scopes evaluated at request and review time |
| entitlement_grants | source internal_permanent/subscription/manual; capability; nullable seat_limit (NULL means unlimited); starts_at; ends_at; immutable provenance; nonnegative limits |
| subscription_accounts | provider nullable; external_reference nullable; status inactive/trial/active/past_due/canceled; trial boundaries; currency. Not required for internal grants. No provider calls in MVP. |
| subscription_revisions | subscription_id; plan_version; effective range; capability snapshot. Never infer all entitlements solely from subscription status. |
| seat_reservations | invitation_id or membership_id; state; expires_at; positive seat units. Organization lock serializes activation/invitation/expiry reconciliation. |

ThriveSource receives a reviewed internal_permanent unlimited-seat grant, with no expiry, payment dependency or trial condition. Ordinary organization admins cannot delete or downgrade it. Resolve capabilities from active grants; subscription expiration cannot revoke a permanent internal grant. Count active plus suspended memberships and unexpired pending invitations against finite seat limits (proposed policy); removed memberships release seats while preserving history. Accept/restore membership under organization lock and recheck entitlement. A solo consultant is simply an organization with one active owner.

## Work and evidence

| Table | Key fields and constraints |
|---|---|
| clients | name; status; billing contact reference; currency; archive timestamp |
| projects | client_id; name; status; billable flag; default timezone only if needed; no cross-tenant client |
| project_assignments | project_id; membership_id; valid_from/to; permission; UNIQUE logical assignment and non-overlap of effective ranges |
| tracking_sessions | membership_id; state working/break/lunch/clocked_out; current_project_id; description; version; started_at; ended_at; lease_expires_at; last_confirmed_at; controlling_session_id; at most one open session per membership |
| tracking_segments | session_id; kind work/break/lunch/disconnected; project_id for work; description_snapshot; start_at/end_at; CHECK end>=start; half-open ranges; no overlapping segments within session |
| tracking_events | session_id; sequence; type; server_at; effective_at; actor; request_id; command_id; reason; UNIQUE(session_id,sequence); append-only; original time never rewritten |
| idempotency_receipts | actor; route; key; request_hash; response/status; expires_at; unique actor/route/key within organization |
| correction_requests | membership_id; target source/revision; requested interval changes; reason; proposed_version; status; requested_by; decided_by; decision_reason; decision_at; requester cannot approve own request |
| correction_revisions | request_id; approved delta/interval representation; supersedes revision; effective source references; approval event; append-only |
| timesheet_periods | timezone_snapshot; local_start_date; local_end_exclusive_date; UTC boundaries; UNIQUE organization/timezone-policy/period; days 1–16 or 16–next-month-1 as half-open ranges |
| timesheets | period_id; membership_id; current_revision; status draft/submitted/approved/rejected; version; UNIQUE(period_id,membership_id) within tenant |
| timesheet_revisions / lines | immutable revision; source segments and correction revisions; local day; project; work_ms; billable_ms; approval provenance; snapshot timezone and calculation version |
| review_events | timesheet/revision; from/to state; actor; reason; server_at; append-only |

Use partial unique indexes for open sessions and pending invitations. Serialize each membership's tracking across organizations using a global user lock if the approved policy forbids overlapping work across tenants; proposed MVP forbids concurrent sessions for one identity, returning a generic conflict without disclosing other tenant details. B6 must confirm this policy. Use native exclusion constraints on effective rate/segment ranges if supported (btree_gist availability is unverified); otherwise parent-row locks plus transactional overlap checks and race tests are required. Ordinary CHECK constraints cannot validate other rows. Parent-row lock triggers or controlled write functions must enforce at least one active owner under concurrent changes; do not rely on a preflight count in application code alone.

## Billing, policy and integration

| Table | Key fields and constraints |
|---|---|
| rate_versions | project_id; membership_id or explicit project-default scope; currency; rate_minor_per_hour; effective_from/to; CHECK positive bounded range and rate>=0; no overlapping rates in same scope |
| billable_allocations | approved_timesheet_revision_id + line/rate slice; work_ms; rate_id; currency; amount_minor; status available/reserved/invoiced/adjusted; unique source slice |
| invoice_drafts / invoice_lines | client_id; currency; status; revision; prepared_by; line allocation references; quantity/rate/tax-treatment snapshot; immutable issued version later |
| invoice_allocation_links | allocation_id; invoice_line_id; unique allocation prevents double billing; transactional reservation |
| billing_adjustments | original allocation/invoice reference; correction_revision_id; signed delta; reason; never overwrites issued history |
| monitoring_policies | version; enabled default false; capabilities; scope; retention; notice_version; author and approver; immutable revisions |
| monitoring_acknowledgments | membership_id; policy_version; notice delivery; consent basis if applicable; acknowledged/revoked timestamps; absence denies collection |
| audit_events | actor; session; organization; action; resource; sanitized before/after references; reason; outcome; correlation ID; recorded_at; append-only |
| outbox | event_id; kind; aggregate_id; payload reference; attempts; next_attempt_at; delivered_at; UNIQUE(event_id,kind) |

Indexes start with organization_id for membership lookups, open tracking, time ranges, submission queues, project assignments, rates and invoices. Add (organization_id,membership_id,start_at), (organization_id,status,period_id), and ordered audit cursor indexes. Store invitation digests using high-entropy random tokens; email normalization is for invitations, never identity matching without verified issuer/subject.

Audit update/delete is denied to runtime; approved corrections append revisions. Privileged database owners can still alter data: this is not cryptographic immutability. Security-reviewed external retention of audit evidence and backup integrity is a later gate, with Netlify Blobs considered for export artifacts under an explicit access/retention policy. Retention, subject deletion/anonymization and financial evidence retention require documented policy before real data ingestion.

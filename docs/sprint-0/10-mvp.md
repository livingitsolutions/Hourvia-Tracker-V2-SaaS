# ThriveSource MVP scope

## Included

Invitation-only organization access; multi-organization membership and explicit organization switching; ThriveSource permanent internal unlimited-seat entitlement; organization roles and scoped manager authorization; clients, projects and assignments; online server-confirmed clock/break/lunch/resume/out; required description and project; four visible statuses; DTR with timezone-aware overnight splits; semi-monthly timesheet submission and independent review; reasoned corrections with approved revisions; own and manager views; safe CSV exports; effective rates, approved billable allocations, invoice preparation and reporting. Monitoring remains disabled with no collector. Responsive accessible UI, operational audit, recovery runbooks and measured launch gates are part of MVP.

Create ThriveSource only through reviewed bootstrap after approval, using a stable UUID and a named owner rather than domain matching. No initial accounts, entitlements, records or credentials were created in Sprint 0. Existing Supabase reuse is conditional on B4.

## Deferred

Public SaaS signup, self-service organization creation UI, subscription checkout/charging, dunning, trial marketing, automated invoice delivery/payment collection, statutory tax determination, employee payroll, deductions, disbursements, advanced desktop monitoring, screenshots, activity scoring, offline tracking and enterprise SSO. Schema foundations for subscriptions/entitlements are included without active payment integration. Solo organizations are supported structurally; public commercial onboarding remains later.

## Product decisions proposed for approval

Organization IANA zone is fixed per period; no frontend-only roles; 15-second heartbeat/30-second confirmation-gap/45-second lease conservative accounting; finite seat count includes active/suspended memberships and pending unexpired invitations; no simultaneous work across organizations; independent review even for owners; single currency per invoice and once-per-line minor-unit rounding. User-facing labels describe monitoring and interruption clearly. Confirm ThriveSource seat/concurrency forecast, timezone, initial reviewer assignments, rate currency, retention and connectivity-loss tolerance before feature implementation.

MVP acceptance requires invitation lifecycle, member and manager end-to-end cutoff review, overnight session, approved correction, safe CSV and rate/invoice example, all with cross-tenant adversarial tests. Include keyboard navigation, accessible status changes and visible server-confirmed versus provisional time. Operational rollout starts with a limited authorized ThriveSource pilot and an explicit incident/rollback owner; this document does not authorize deployment.

# DTR, timesheets and client billing

## DTR and cutoffs

DTR projects confirmed work, pauses, interruptions and approved corrections for one member/local calendar day. Show project, required description, source/proposed/approved values, timezone and revision provenance. Members see their own; reviewers see only delegated members/projects. Unapproved corrections are visibly pending and never enter approved totals.

Periods are local days 1–15 and 16–month-end inclusive, represented as [month day 1, day 16) and [day 16, next month day 1). Convert both boundaries independently using organization timezone snapshot. Freeze timezone policy for a period; organization timezone changes take effect in the next period. Split overnight, month-end, leap-day and DST-spanning segments. Project-scoped managers may approve only their authorized lines; final sheet approval requires all lines covered by authorized independent reviewers or organization reviewer.

Generation creates a deterministic draft projection with source watermark. Submission requires no unresolved open work in that period, validates required project/descriptions and snapshots immutable lines/calculation version. State: draft -> submitted -> approved or rejected; rejected -> new draft revision -> submitted. Approved snapshots never mutate. Review checks current permission, source revision and expected version inside a transaction, and writes review events atomically. CSV exports identify period, zone, member, project, confirmed duration, approved duration, revision and approval state; unapproved export is not labeled approved.

## Correction workflow

Member or reviewer submits a reasoned correction against specific sources and timesheet revision. Proposed intervals may adjust clock/break/lunch or project/description but must not overlap other accepted work. Reviewer is an independent authorized manager, admin or owner within scope. Pending -> approved/rejected/withdrawn; no self-approval, including admins. Optimistic version and row locks prevent duplicate or stale decisions.

For a draft, approved correction regenerates draft projection. For submitted sheets, correction invalidates submission into a new draft revision and requires resubmission/review. For approved sheets, approval creates a new superseding timesheet revision with independent approval provenance; it cannot silently alter old totals. Approval of a correction to an approved sheet requires the full timesheet approval capability; partial-scope reviewers route final approval onward. Historical reports can select original or latest approved revision. Submitted/reviewed evidence survives rejection and supersession.

## Approved billing pipeline

Only approved timesheet revisions generate billable allocations. Project/client and member-specific effective rate override a project-default rate, with explicit non-overlap and precedence. Split work at rate effective boundaries using UTC instants; snapshot rate, quantity, currency and source revision. Missing or ambiguous rate blocks invoice preparation; do not silently substitute zero. Proposed MVP uses one currency per client/invoice, integer milliseconds and decimal/rational intermediate calculations; round each final invoice line once to currency minor units, then sum. Show rounding policy and calculation version; no currency conversion, tax engine or payroll in MVP.

Invoice preparation transaction locks approved source allocations and client sequence, reserves each allocation exactly once and stores draft line snapshots. Concurrent preparers must not double bill. Draft -> reviewed -> ready for external/manual issuance in MVP; no subscription charging or automated collection. Invoice date and client references are explicit. Changes before issuance rebuild a new draft revision; issued history, if later supported, is immutable. A post-issuance correction creates traceable debit/credit adjustment candidates rather than changing the original invoice. This MVP prepares invoices and reports; it does not claim jurisdictional invoicing compliance.

CSV uses tenant-scoped authorization, capped date ranges and streaming for large datasets. Escape quotes/newlines and neutralize spreadsheet formula prefixes (=, +, -, @, tabs/control characters) for user-entered text. Return private/no-store downloads; do not expose permanent public links. Audit who exported, scope, revision and row count without logging exported personal content.

Acceptance examples: 23:00–02:00 splits across two DTR dates; day-15 overnight work splits at day-16 local midnight; 8h elapsed with 30m break and 1h lunch yields 6.5h confirmed work before heartbeat exclusions; rejected correction changes no approved total; two invoice requests cannot reserve the same source slice.

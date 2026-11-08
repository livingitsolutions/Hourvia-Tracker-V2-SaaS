# MVP, roadmap and decision register

## ThriveSource MVP

Include invitation-only onboarding; organization membership and role scopes; multi-org switching; permanent internal unlimited-seat entitlement; clients/projects/assignments; Clock In/Out, Break, Lunch and explicit Resume; lease-based online-only accounting; DTR with overnight/timezone handling; semi-monthly submissions; independent approval and correction history; dated billable rates; approved-hour invoice drafts/reports; scoped CSV exports; immutable audit; monitoring OFF display; operational alerts and restore procedures.

Defer public organization signup, subscriptions/payments, public pricing, tax/legal invoicing automation, payroll, statutory deductions, disbursements, offline tracking, desktop screenshots/activity monitoring, mobile-native apps and enterprise SSO. Model entitlement/subscription boundaries now, activate commercial behavior only in later approved sprints. A solo org can record time without billing approval until an independent reviewer exists.

## Dependency roadmap and estimates

Estimates are engineering person-weeks, including review/tests/documentation, with approximately ±40% uncertainty. Calendar assumes two engineers with part-time security, product and operations support; provider decisions and approval waiting time are additional. A sprint is nominally two calendar weeks; larger work packages span multiple sprints. Estimates are not delivery promises.

| Sprint / package | Deliverable | Dependencies and exit criteria | Effort |
| --- | --- | --- | --- |
| 0 | Architecture and static investigation | This documentation; implementation not started | Complete |
| 1 | Isolated foundation and provider safety proof | Approval; G0; resolve DB-01/02 topology, investigate DB-03/04; audited identity reuse decision; React/Vite/strict TS/Tailwind setup and CI only after approval | 3–5 weeks |
| 2 | Tenant schema, identity bridge and invites | Sprint 1 isolation, G1 identity evidence; scoped sessions, memberships, roles, grants, internal entitlement and audit; G2 tenant tests | 4–6 weeks |
| 3 | Clients, projects, assignments and rates | Tenant authorization; rate constraints and scope tests | 2–3 weeks |
| 4 | Authoritative tracking and DTR | Identity/session revocation and project assignments; lease policy approved; G3 state/concurrency/DST evidence | 4–6 weeks |
| 5 | Cutoffs, timesheets, corrections and review | Stable raw tracking model; independent reviewers assigned; revision and correction tests | 3–5 weeks |
| 6 | Billing preparation and CSV | Approved revisions and dated rates; G4 duplicate allocation, currency and export tests | 2–4 weeks |
| 7 | Hardening and ThriveSource pilot | G1–G5 closed; performance, recovery, privacy review, runbooks, synthetic rehearsal then controlled authorized pilot | 3–5 weeks |
| 8 | Pilot feedback and launch stabilization | Measured pilot acceptance, incident fixes, operational ownership | 2–3 weeks |
| 9, later | Commercial organization onboarding and subscriptions | Separate product/security approval, payment design/ADR, entitlement/seat admission tests; never weaken internal grant | 4–7 weeks |
| 10, later | Desktop monitoring discovery and optional rollout | Separate legal/consent/OS permissions/security review, transparent pilot; no dependency for ThriveSource launch | 4–8 weeks discovery/prototype; rollout re-estimated |

ThriveSource implementation through stabilization totals 23–37 person-weeks (roughly 12–19 engineering calendar weeks at ideal two-person throughput, more realistically 16–24 with coordination and review). Later commercial and desktop work are excluded. Auth, provider controls and recovery gates are critical-path uncertainties; do not schedule production onboarding before their closure.

## Unresolved blockers and evidence needed

| ID | Blocker / owner | Closure evidence |
| --- | --- | --- |
| DB-01 | Enforceable explicit schema release ownership — release owner + Netlify support | Unauthorized Git push/build/preview/publish cannot apply production DDL; exact native timing, lock semantics, concurrent failure behavior and independent approval authority demonstrated; resolve workflow if native system insufficient |
| DB-02 | No production cloning to untrusted previews/agents — security + platform owner | Enforced production fork prohibition and separate synthetic-site routing across every preview/agent path; API parent option alone insufficient |
| DB-03 | Least-privilege runtime and RLS feasibility — database/security owners | Managed roles/grants, credential scoping, transaction-local settings, extension support and deny tests; accepted alternative if provider cannot support policy |
| DB-04 | Backup/recovery and target verification — operations | Provider retention/PITR/residency answers, explicit branch identification, isolated restore and measured accepted RPO/RTO |
| AUTH-01 | Supabase reuse unaudited — identity/security owners | Authorized configuration audit and reuse/isolation decision; no V1 application data or credentials carried over |
| AUTH-02 | Production/nonprod mail and identity separation — identity owner | Exact redirect inventories, isolated test project/sender, signing/MFA/session verification and Resend delivery tests |
| PROD-01 | Accounting and review policy — product + ThriveSource owner | Approved heartbeat/disconnect limits, global one-shift rule, reporting zone, rate rounding and independent reviewer for owner/solo submissions |
| OPS-01 | Privacy, retention and service expectations — operations/legal/product | Approved retention/residency, support/incident roles, performance/cost targets; monitoring activation deferred |

No blocker was resolved by assumption. The logical schema and UI foundation can proceed after approval in an isolated synthetic environment; production DB integration and importing existing identities remain gated. If a mandatory platform safeguard cannot be enforced, revisit the architecture rather than waive it silently.

## Recommended next sprint

Sprint 1: isolation and foundation proof, not feature delivery. Name release/security/operations owners; approve ADRs and accounting assumptions; obtain provider answers for DB-01–04; prove the synthetic-site boundary; audit the existing Supabase project with authorized read-only access; select safe reuse or propose a dedicated V2 identity project. Only after G0 passes, scaffold the approved stack and CI without production credentials. Any configuration changes, disposable migration experiments or deployments need separate authorization beyond Sprint 0.

Deliver Sprint 1 evidence as control tests, environment inventory containing no secret values, identity audit findings, an updated risk register and a decision on production feasibility. Stop and revise if production data fork prevention cannot be enforced. Do not use a functioning preview as proof that production protections work.

## Sprint 0 validation and stopping point

Repository inventory and public-document retrieval were performed read-only. Documentation links and file presence were statically checked. No application tests were run because no application exists and this task prohibits implementation. No builds, migrations, database queries, Supabase/Resend changes, deployments, commits, pushes or merges were performed. All proposed acceptance tests are future work. Sprint 0 stops here awaiting approval.

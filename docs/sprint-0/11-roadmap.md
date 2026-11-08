# Implementation sprint roadmap

## Planning assumptions

Estimates are engineering person-days, not commitments. Assume two full-time engineers with part-time product, security and operations review; ten working days per sprint. External provider responses, procurement and approval wait time are excluded and may dominate elapsed time. Reserve roughly 20% capacity for integration/rework; ranges below include normal engineering uncertainty but not unresolved platform redesign. A dependency is an exit gate, not permission to start production work.

| Sprint | Outcome | Dependencies / exit evidence | Effort |
|---|---|---|---|
| 0 completed | Architecture proposals, migration investigation, risk register and ADRs | Documentation/static checks only; approval pending | This delivery; no historical effort claim |
| 1 recommended | Safety proofs and isolated foundation: separate synthetic project plan/setup after authorization, Supabase audit, branch/role/backup experiments, React/Vite/strict TS/Tailwind v4 scaffold, CI/contracts skeleton | Sprint 0 approval; close or obtain explicit resolution for B1–B5; no real data. Provider blockers can extend sprint. | 12–18 days |
| 2 | Identity, organization memberships/invitations, session revocation, platform separation, internal entitlement and bootstrap | G1/G2; approved Auth audit; tenant schema/role tests; G3 passed | 12–18 days |
| 3 | Clients/projects/assignments and tracking engine with heartbeat and concurrency | Sprint 2; B6 connectivity/concurrency policy approval; complete state/race tests | 14–20 days |
| 4 | DTR, cutoff snapshots, submission/review and approved correction revisions | Sprint 3 confirmed segments; timezone/reviewer policy approval; G4 | 12–18 days |
| 5 | Effective rates, billable allocations, invoice preparation, scoped reports and CSV | Approved revisions from Sprint 4; rate/currency/rounding decisions; financial concurrency tests | 10–16 days |
| 6 | Operational hardening, PWA shell, accessibility, load/security review, backup/restore drill and pilot | Sprints 2–5; close remaining launch blockers; G5/G6; explicit deployment authorization | 12–18 days |
| 7 later | Commercial onboarding and subscriptions/seat enforcement integrations | ThriveSource pilot stable; commercial policies, provider choice and separate approval | 14–22 days |
| 8 later | Advanced desktop monitoring feasibility and consent/OS architecture, then implementation only if approved | Separate requirements, legal/security review, OS distribution strategy and evidence gates | Discovery 8–12 days; implementation unestimated until platform scope is known |

Core MVP Sprints 1–6 total 72–108 engineering person-days, roughly 9–14 calendar weeks with two engineers at 80% delivery capacity, excluding external waits. Sprint boundary estimates may need splitting when high ranges exceed team capacity. Commercial onboarding adds 14–22 days; monitoring implementation has no defensible estimate before discovery. No subscription vendor or desktop OS scope is assumed.

## Recommended next sprint

Approve Sprint 1 limited to synthetic environments, platform safety experiments and scaffold. First resolve preview confidentiality, native migration authorization and least-privilege runtime feasibility; then complete Supabase reuse and recovery audit. Capture sanitized evidence and update ADRs. If required safeguards cannot be enforced, stop production-connected work and return for architecture approval rather than building on an unsafe assumption.

Parallel independent work within Sprint 1 can include scaffold, contract conventions and test planning while provider questions are outstanding. Do not insert real tenant data, connect production identity, activate email changes or publish anything merely because scaffold work is complete. Features in Sprint 2 depend on the relevant safety gates.

## Approval and release checkpoints

Sprint 0 approval selects the proposed policies and authorizes only the next agreed scope. Each sprint records accepted artifacts, remaining risks and updated estimates. Production release requires separate G6 signoff and deployment authorization. Schema release approvals identify exact artifacts and target, not blanket permission for later pushes. No automated commercial billing or desktop monitoring is enabled as a side effect of the MVP.

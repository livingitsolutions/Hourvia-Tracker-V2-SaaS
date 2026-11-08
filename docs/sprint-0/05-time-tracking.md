# Server-authoritative time state machine

## States and transitions

| Current state | Command | Next state / rule |
|---|---|---|
| Clocked Out | Clock In | Working; active assignment, project and nonblank description required |
| Working | Break | On Break; close confirmed work and start break |
| Working | Lunch | At Lunch; close confirmed work and start lunch |
| Working | Clock Out | Clocked Out; close confirmed work and session |
| On Break | Resume | Working; revalidate assignment/project/description and connection |
| At Lunch | Resume | Working; same checks |
| On Break / At Lunch | Clock Out | Clocked Out; close pause and session |
| Working | Change project | Working; close old segment and create new project/description segment atomically |
| Any open state | Connection lease expires / access revoked | Clocked Out with interrupted reason; close work at last confirmed boundary |
| Clocked Out after interruption | Resume | Working in new linked session; explicit action and project/description required |

All other transitions return 409. No break-to-lunch or lunch-to-break shortcut; require explicit Resume first. Clock In after interruption also explicitly starts new work. Reconnection, page focus, heartbeat, reload and service-worker updates never change Clocked Out to Working. Public statuses remain Working, On Break, At Lunch and Clocked Out; interruption is a reason flag, not billable time.

## Online-only accounting and its limit

A browser cannot prove continuous physical connectivity or human activity between packets. The enforceable MVP contract is conservative server-confirmed time, not a guarantee of exact physical disconnect detection. Proposed parameters for B6 approval: authenticated heartbeat every 15 seconds, maximum confirmation gap 30 seconds, lease expiry 45 seconds; show counted/last-confirmed time distinctly from an optimistic display. Heartbeat has monotonically increasing sequence, active session ID and version; timestamp comes from database/server, never browser wall clock.

At Clock In/Resume open an unconfirmed work segment at server time. A timely heartbeat confirms the interval since the previous confirmation only if sequence/session match, the connection lease is current, the gap is within the maximum and membership remains active. At any observed client disconnect, browser sends a best-effort stop, stops confirmations and requires explicit resume after revalidation. A missing/late heartbeat never fills a gap: close the interrupted session at last_confirmed_at and require Resume. Expiry is applied lazily under lock before reads/commands and by an idempotent scheduled sweep; billable queries always cap work at last_confirmed_at even if sweep is delayed.

A timely explicit Clock Out/Break/Lunch command can confirm a final bounded interval using the same gap rules. If late, account only through last confirmation, record interruption and reject stale transition as 409. Paused intervals contribute zero work. Proposed rule may discard up to the heartbeat interval of legitimate tail work; user can request a correction. Very brief undetected network gaps within a confirmation window cannot be excluded exactly. If the requirement means zero milliseconds of every physical outage, browser heartbeat architecture does not meet it; B6 blocks implementation of tracking until this limitation or a stricter protocol is accepted. Monitoring activity is not substituted for connectivity.

## Serialization and evidence

Lock user concurrency guard, membership, tracking session in fixed order; revalidate active membership and assignment and expectedVersion. Use database clock captured after lock acquisition, no client backdating. Set effective event times for interruptions to last confirmation while retaining actual recorded_at. Persist command receipt, event sequence, confirmed segment bounds, state/version and audit in one transaction. Unique active-session constraints and version checks prevent multi-tab/device double clocks. Device/session takeover requires an explicit command, closes prior lease without backfill and records the actor; MVP can reject takeover until prior session is clocked out.

A late heartbeat from an old browser never confirms a new session. Repeat commands with the same idempotency key return original outcome; a new key for an invalid transition returns conflict. Use expected version for state commands; heartbeat sequencing must coexist without unnecessary stale-version conflicts (separate lease sequence from state version). Clock Out timeout is reconciled by reading authoritative state before retrying. Return server time, state version, lease expiry, last confirmation and confirmed totals.

## Duration, timezone and corrections

Intervals are half-open [start,end), never overlapping; net work is sum of confirmed work intervals plus independently approved correction revisions, excluding break, lunch and disconnected intervals. Preserve UTC instants and organization IANA timezone snapshot. Split work at local midnight and cutoff boundaries, including DST-short/long days; use calendar-aware zone conversion, never add fixed 24-hour days. Overnight sessions remain one session with multiple DTR slices. Duration is elapsed UTC time; local repeated hour is not counted twice. No payroll rounding.

Raw events and original segments remain evidence. Corrections propose interval replacements/deltas with reason and source revision; approval creates new derived revisions, never edits source events. Validate overlap, break subtraction, project assignment and final nonnegative totals. Required tests: transition matrix, duplicate clock-in, concurrent resume/out, lost response retry, delayed/reordered heartbeat, suspend race, no automatic resume, cross-zone midnight, DST and overnight cutoff, unconfirmed tail exclusion and stale device rejection.

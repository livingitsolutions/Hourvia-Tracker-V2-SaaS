# Identity and authorization

## Supabase integration and reuse audit

Supabase remains the identity authority; application authorization resides only in Netlify Database. Use Supabase Auth with PKCE, verified email and invitation-only app access. A valid Supabase identity without an active Hourvia membership receives no tenant access. Do not implement Netlify Identity alongside it.

Before reuse, audit the existing project without importing credentials: ownership/admin MFA, issuer/project identifiers, signing algorithms/JWKS and rotation, signup settings, providers, password/recovery controls, token lifetime, refresh reuse detection, leaked-password protection availability, MFA availability, SMTP sender/domain, redirect list, templates, logs/retention and existing applications sharing the project. Record sanitized findings and evidence owner. Legacy users are not automatically Hourvia members; shared recovery settings and sessions may affect V1 users. If safe separation cannot be demonstrated, require a new Supabase production project instead of changing a shared one. No audit was performed against the actual project in Sprint 0.

Resend SMTP is configured only after approval, in Supabase, with verified sending domain, SPF/DKIM/DMARC review and delivery tests. SMTP password remains server/provider-side. Authentication mail is distinct from future billing notifications. Do not claim configuration or email deliverability was verified.

## Browser and Function sessions

Proposed SPA approach: Supabase client handles PKCE and refresh, bearer access token in Authorization header to same-origin Functions. Prefer memory-only client session storage for initial MVP; reload may require sign-in. Durable localStorage refresh tokens are not approved by default because XSS can steal them. If persistent sessions are required, revisit a same-origin HttpOnly/Secure/SameSite BFF cookie design with CSRF protection in an ADR before implementation. Never place auth tokens in URLs other than provider callback artifacts; clean callback URL immediately and use Referrer-Policy: no-referrer.

Functions verify signature using the configured issuer's JWKS, allowlisted algorithm, exact issuer and expected audience, exp/nbf, valid subject and expected authenticated token type. No decode-only verification and no issuer derived from client input. Unknown signing key triggers a bounded refresh; invalid or unavailable verification fails closed. Cache public keys, never authorization decisions across revocation windows. For privileged actions require MFA assurance and recent authentication; inspect verified claims and authoritative session/user state as necessary.

Map (issuer,sub) to users, validate verified email where required, load application session from signed session_id, and check revoked status, user status/revoked_before and active membership on every request. JWT verification alone cannot immediately detect upstream logout. Proposed strict MVP checks current Supabase session/user validity using a supported Auth endpoint per authenticated request, with no positive cache until revocation behavior is tested. B4 closure requires proof whether that endpoint detects single-session/global signout immediately. If it does not, integrate an authoritative session check or define and approve a bounded residual lifetime; do not promise instantaneous upstream revocation. Hourvia logout/security revocation updates application_sessions first, then revokes Supabase refresh sessions; direct Supabase signout must not be assumed equivalent. Membership suspension/removal is enforced immediately by current DB checks.

## Roles and scope

| Capability | Owner | Administrator | Authorized manager | Contractor/member | Platform Super Admin |
|---|---|---|---|---|---|
| Own tracking, DTR, submit and request correction | Yes | Yes | Yes | Yes | No implicit tenant access |
| View others / approve time and corrections | Organization scope, no self-approval | Organization scope, no self-approval | Explicit assigned team/project scope only, no self-approval | No | Explicit audited support grant only |
| Clients/projects/assignments and CSV | Yes | Yes | Explicit capability + scope | Own permitted time CSV only | No implicit access |
| Rates, invoice drafts, billing reports | Yes | Explicit billing capability | Explicit billing capability and client/project scope | No | No implicit access |
| Invite/manage members | Yes | Member/manager roles within delegated ceiling | No by default | No | Separate audited platform action |
| Grant owner/admin or transfer ownership | Owner with recent MFA | No | No | No | Break-glass recovery only with separate process |
| Monitoring policy | Yes | Yes | Explicit policy delegation and scope | No | No default tenant policy authority |
| Internal entitlements/platform operations | No | No | No | No | Dedicated platform capabilities, MFA and reason |

Owners/admins can delegate only permissions they possess and only permitted scopes. Managers cannot delegate policy authority, self-elevate, change own review scope or approve their own work. Recheck permissions at decision time, not only when a review screen loads. Owner self-review is routed to another independent reviewer; single-member organizations may track/export their own time but cannot claim independently approved totals or invoice-ready approval without a second authorized reviewer. Any future solo-attestation workflow needs an explicit separate approval provenance and product decision.

## Membership lifecycle

Invitation pending -> accepted/expired/revoked. Membership active -> suspended -> active, or active/suspended -> removed. Reinvitation is an explicit audited restore with fresh checks, never silent reactivation. Lock organization for seat changes and last-owner invariants; prohibit removing/suspending the last active owner. Role changes increment membership version; current database authorization takes effect on next command. For suspension/removal, serialize against in-flight tracking and reviews, close active work at the last confirmed boundary, invalidate tenant session grants, revoke outstanding invites/delegations where applicable, and append audit atomically. Other organization memberships survive tenant removal; global compromise revokes all app sessions and requests upstream revocation.

## Invitations and recovery

Only authorized inviters create application invitation records and reserve seats. Generate random single-use expiring secrets, store only a digest, restrict logs and use fixed allowlisted acceptance URLs. Email delivery may use Supabase invitations for new identities; already registered identities sign in and accept the application invitation. Identity creation is not membership activation. Acceptance verifies authenticated issuer/subject, verified email matching intended recipient, invite expiry/revocation, role ceiling and seat entitlement, then locks and consumes invitation and activates membership in one transaction. Concurrent/replayed acceptance yields one membership. Use generic responses to avoid email enumeration. Proposed TTL: 72 hours; reissue revokes prior secret.

Recovery uses Supabase's supported PKCE/recovery flow on fixed environment-specific callback URLs, never a user-supplied redirect. Bind callback state to initiation, reject mismatched environment, scrub URL, reauthenticate for sensitive actions and revoke Hourvia sessions following password/security changes. Recovery never changes organization membership or elevates roles. No wildcard production redirects, preview callbacks on production issuer or email-domain-based autojoin. Initial platform admin and ThriveSource owner bootstrap require named authorized operators, two-person review, MFA and audit; no public bootstrap endpoint or hardcoded admin email.

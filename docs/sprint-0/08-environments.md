# Environment isolation and secrets policy

| Environment | Netlify application/data | Identity and email | Allowed data |
|---|---|---|---|
| Local test | Isolated local or approved synthetic Netlify Database development target; never production fallback | Separate Supabase nonproduction project or approved local test Auth; email sink/test recipients | Synthetic |
| Trusted integration | Separate nonproduction Netlify project, synthetic main database | Dedicated nonproduction issuer, fixed staging callback, test mail recipients | Synthetic |
| Untrusted preview | Only synthetic project's branches after verified targeting; otherwise no database/secret access | No production issuer callbacks, SMTP secrets or service-role keys | Synthetic fixtures only |
| Production | Dedicated production Netlify project/main; preview/agent isolation gated by B1 | Audited production Supabase issuer and Resend SMTP | Approved tenant records after gates |

No environment is identified solely by Git branch name. Require allowlisted project/context/branch identity and explicit environment marker. Reject nonproduction binaries configured with production identity or data. Static frontend VITE_* values are public; only Supabase public URL/publishable client key and non-sensitive configuration may be bundled. Supabase public key is not authorization. Never bundle service-role keys, SMTP passwords, Netlify tokens or PostgreSQL connection details.

Proposed server configuration names include SUPABASE_ISSUER_URL, SUPABASE_JWKS_URL, SUPABASE_AUDIENCE and the minimal server Auth credential only if required by the approved verification/invitation path. SMTP credentials belong in Supabase configuration for Resend; Functions do not need them for authentication email. Netlify Database automatic connection binding must be reviewed for exact deploy context; avoid a manually configured production connection fallback. Never request credentials before the code needs them; no secrets were read or added in Sprint 0.

Scope credentials to exact environment and Functions/runtime usage; builds and untrusted contributions must not receive production server secrets. Use separate short-lived automation identities where available, narrowly scoped platform roles, rotation inventory, named owners and revocation runbook. Secret scanning covers source, history via approved tooling later, CI logs, generated frontend bundles and artifacts without displaying matches. Never copy V1 .env files or auth secrets. Sample environment files contain names and descriptions only.

Restrict redirect allowlists to exact HTTPS production/staging callback URLs; local callbacks belong only to nonproduction Auth. No wildcard preview hosts on production issuer. Validate return paths as local allowlisted paths rather than accepting arbitrary next URLs. Production CSP limits script/connect sources and avoids unsafe-eval; verify Vite deployment CSP compatibility during implementation. Require TLS, private/no-store API caching, frame-ancestors none, nosniff and referrer controls. Document CORS origin handling; it is not an authorization boundary.

Log no authorization headers, cookies, invitation/recovery tokens, connection URLs, SMTP credentials, descriptions or raw personal export data. Redact at entry and provider SDK integration; keep correlation IDs. Review provider retention, regional processing and data deletion separately before claiming any compliance. No legal regime or certification is assumed.

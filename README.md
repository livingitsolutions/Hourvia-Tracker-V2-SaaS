# Hourvia V2

Sprint 1.1 implemented an isolated application foundation. Authentication, organization data, tracking, approvals, billing and monitoring were not enabled.

## Local setup

Use Node.js 22. Install the locked dependencies with `npm ci`, then run `npm run dev` for the static application. Use `netlify dev --port 8889` when local Functions emulation is needed. No provider credentials are required or read by the foundation.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
```

The production build command is `npm run build`. The implementation environment prohibited executing it; the GitHub quality workflow configured it for a future CI run. No build or deployment success was claimed.

Read the [Sprint 1.1 implementation notes](docs/sprint-1/foundation.md) for API boundaries, safety controls and outstanding gates. The [Sprint 0 blueprint](docs/sprint-0/README.md) remained the architecture reference. No database schema, migration or provider SDK was introduced.

import type { problemCodes } from '../../shared/contracts/api';
export type ProblemCode = (typeof problemCodes)[number];
const errors: Record<ProblemCode, { status: number; detail: string }> = {
  VALIDATION_ERROR: { status: 400, detail: 'The request is invalid.' },
  UNAUTHENTICATED: { status: 401, detail: 'Verified identity is required.' },
  FORBIDDEN: { status: 403, detail: 'Permission is required.' },
  NOT_FOUND: { status: 404, detail: 'Resource not found.' },
  METHOD_NOT_ALLOWED: { status: 405, detail: 'Method not allowed.' },
  INTEGRATION_DISABLED: {
    status: 503,
    detail: 'Required integrations are disabled in this foundation.',
  },
  INTERNAL_ERROR: { status: 500, detail: 'An unexpected error occurred.' },
};
export class ApiError extends Error {
  constructor(readonly code: ProblemCode) {
    super(errors[code].detail);
  }
}
export function publicProblem(error: unknown, requestId: string) {
  const code = error instanceof ApiError ? error.code : 'INTERNAL_ERROR';
  return { code, ...errors[code], requestId };
}

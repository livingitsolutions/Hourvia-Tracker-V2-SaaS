import { describe, expect, it } from 'vitest';
import {
  requireOrganization,
  type AuthorizationService,
} from '../server/security/authorization';
import {
  availabilitySchema,
  organizationParams,
} from '../shared/contracts/api';
import { sanitizedLogger } from '../server/platform/logging';
import { vi } from 'vitest';

const organizationId = '00000000-0000-4000-8000-000000000001';
const actor = { userId: 'synthetic-user', sessionId: 'synthetic-session' };
const valid = {
  organizationId,
  userId: actor.userId,
  active: true,
  sessionActive: true,
  permissions: ['foundation:read'] as const,
};
describe('organization authorization', () => {
  it.each([
    null,
    { ...valid, active: false },
    { ...valid, sessionActive: false },
    { ...valid, organizationId: 'another-org' },
    { ...valid, userId: 'another-user' },
  ])(
    'denies absent, suspended, revoked or mismatched authority %j',
    async (decision) => {
      const auth: AuthorizationService = {
        async resolve() {
          return decision;
        },
      };
      await expect(
        requireOrganization(actor, organizationId, auth),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    },
  );
  it('denies known membership without permission', async () => {
    await expect(
      requireOrganization(actor, organizationId, {
        async resolve() {
          return { ...valid, permissions: [] };
        },
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
  it('creates context only after authority checks', async () => {
    expect(
      await requireOrganization(actor, organizationId, {
        async resolve() {
          return valid;
        },
      }),
    ).toMatchObject({ organizationId, actor });
  });
});
it('rejects client privilege injection and invalid org IDs', () => {
  expect(
    organizationParams.safeParse({
      organizationId,
      module: 'projects',
      role: 'owner',
    }).success,
  ).toBe(false);
  expect(
    organizationParams.safeParse({
      organizationId: 'invalid',
      module: 'projects',
    }).success,
  ).toBe(false);
});
it('rejects accidentally enabled response contracts', () => {
  expect(
    availabilitySchema.safeParse({
      module: 'billing',
      available: true,
      reason: 'INTEGRATION_DISABLED',
    }).success,
  ).toBe(false);
});
it('logs only allowlisted fields', () => {
  const output = vi.spyOn(console, 'info').mockImplementation(() => {});
  sanitizedLogger.write({
    requestId: organizationId,
    status: 503,
    code: 'INTEGRATION_DISABLED',
    token: 'synthetic-do-not-log',
  } as Parameters<typeof sanitizedLogger.write>[0]);
  expect(output).toHaveBeenCalledWith(
    JSON.stringify({
      requestId: organizationId,
      status: 503,
      code: 'INTEGRATION_DISABLED',
    }),
  );
  output.mockRestore();
});

// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { createApi } from '../server/api';
import { createDisabledDependencies } from '../server/application';
import {
  foundationSchema,
  modules,
  problemSchema,
} from '../shared/contracts/api';
import { ApiError } from '../server/platform/errors';
import type { MembershipDecision } from '../server/security/authorization';

const org = '00000000-0000-4000-8000-000000000001';
const actor = { userId: 'synthetic-user', sessionId: 'synthetic-session' };
const path = '/api/v1/orgs/' + org + '/projects';
const logger = { write: vi.fn() };
function request(pathname: string, method = 'GET') {
  return new Request('https://synthetic.invalid' + pathname, {
    method,
    headers: {
      Authorization: 'Bearer synthetic-only',
      'X-Request-ID': 'untrusted-input',
    },
  });
}
beforeEach(() => {
  vi.clearAllMocks();
});
it('exposes only disabled public capability metadata', async () => {
  const response = await createApi(
    createDisabledDependencies(),
    logger,
  )(request('/api/v1/platform/foundation'));
  expect(response.status).toBe(200);
  expect(
    foundationSchema.parse(await response.json()).integrationsEnabled,
  ).toBe(false);
});
it.each(modules)(
  'fails closed for %s in the default composition',
  async (module) => {
    const response = await createApi(
      createDisabledDependencies(),
      logger,
    )(request('/api/v1/orgs/' + org + '/' + module));
    expect(response.status).toBe(503);
    const problem = problemSchema.parse(await response.json());
    expect(problem.code).toBe('INTEGRATION_DISABLED');
    expect(problem.requestId).toBe(response.headers.get('x-request-id'));
    expect(problem.requestId).not.toBe('untrusted-input');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  },
);
it.each([
  ['/api/v1/orgs/invalid/projects', 'GET', 400],
  [path + '?role=owner', 'GET', 400],
  [path, 'POST', 405],
  ['/api/v1/orgs/' + org + '/unknown', 'GET', 400],
  ['/api/v1/unknown', 'GET', 404],
])('rejects invalid boundary %s %s', async (url, method, status) => {
  const dependencies = createDisabledDependencies();
  const verify = vi.spyOn(dependencies.identity, 'verify');
  const response = await createApi(dependencies, logger)(request(url, method));
  expect(response.status).toBe(status);
  expect(verify).not.toHaveBeenCalled();
});
it('does not authorize when identity fails', async () => {
  const dependencies = createDisabledDependencies();
  dependencies.identity.verify = async () => {
    throw new ApiError('UNAUTHENTICATED');
  };
  const resolve = vi.spyOn(dependencies.authorization, 'resolve');
  const response = await createApi(dependencies, logger)(request(path));
  expect(response.status).toBe(401);
  expect(resolve).not.toHaveBeenCalled();
});
it.each([
  null,
  {
    organizationId: org,
    userId: actor.userId,
    active: false,
    sessionActive: true,
    permissions: ['foundation:read'],
  },
])('never calls service on denied membership', async (decision) => {
  const dependencies = createDisabledDependencies();
  dependencies.identity.verify = async () => actor;
  dependencies.authorization.resolve = async () =>
    decision as MembershipDecision | null;
  const service = vi.spyOn(dependencies.services.projects, 'availability');
  const response = await createApi(dependencies, logger)(request(path));
  expect(response.status).toBe(404);
  expect(service).not.toHaveBeenCalled();
});
it('passes verified org context to an injected application service', async () => {
  const dependencies = createDisabledDependencies();
  dependencies.identity.verify = async () => actor;
  dependencies.authorization.resolve = async () => ({
    organizationId: org,
    userId: actor.userId,
    active: true,
    sessionActive: true,
    permissions: ['foundation:read'],
  });
  const service = vi
    .spyOn(dependencies.services.projects, 'availability')
    .mockResolvedValue({
      module: 'projects',
      available: false,
      reason: 'INTEGRATION_DISABLED',
    });
  const response = await createApi(dependencies, logger)(request(path));
  expect(response.status).toBe(200);
  expect(service).toHaveBeenCalledWith(
    expect.objectContaining({ organizationId: org, actor }),
  );
});
it('sanitizes unexpected exceptions and logs', async () => {
  const dependencies = createDisabledDependencies();
  dependencies.identity.verify = async () => {
    throw new Error('synthetic-sensitive-internals');
  };
  const response = await createApi(dependencies, logger)(request(path));
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain('synthetic-sensitive');
  expect(JSON.stringify(logger.write.mock.calls)).not.toContain(
    'synthetic-sensitive',
  );
});

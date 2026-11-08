import {
  availabilitySchema,
  foundationSchema,
  modules,
  organizationParams,
  problemSchema,
} from '../shared/contracts/api';
import type { Dependencies } from './application';
import { ApiError, publicProblem } from './platform/errors';
import type { Logger } from './platform/logging';
import { requireOrganization } from './security/authorization';

export function createApi(dependencies: Dependencies, logger: Logger) {
  return async (request: Request): Promise<Response> => {
    // Generate locally; never echo arbitrary caller-controlled correlation values.
    const requestId = crypto.randomUUID();
    const headers = {
      'X-Request-ID': requestId,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    };
    try {
      const pathname = new URL(request.url).pathname;
      const orgRoute = /^\/api\/v1\/orgs\/([^/]+)\/([^/]+)$/.exec(pathname);
      if (pathname !== '/api/v1/platform/foundation' && !orgRoute)
        throw new ApiError('NOT_FOUND');
      if (request.method !== 'GET') throw new ApiError('METHOD_NOT_ALLOWED');
      if (new URL(request.url).search) throw new ApiError('VALIDATION_ERROR');
      let payload: unknown;
      if (pathname === '/api/v1/platform/foundation') {
        // Public build capability metadata only; no platform-admin operations.
        payload = foundationSchema.parse({
          mode: 'isolated',
          integrationsEnabled: false,
          modules: [...modules],
        });
      } else {
        const parsed = organizationParams.safeParse({
          organizationId: orgRoute?.[1],
          module: orgRoute?.[2],
        });
        if (!parsed.success) throw new ApiError('VALIDATION_ERROR');
        const actor = await dependencies.identity.verify(request);
        const context = await requireOrganization(
          actor,
          parsed.data.organizationId,
          dependencies.authorization,
        );
        payload = availabilitySchema.parse(
          await dependencies.services[parsed.data.module].availability(context),
        );
      }
      logger.write({ requestId, status: 200, code: 'OK' });
      return Response.json(payload, { headers });
    } catch (error) {
      const problem = problemSchema.parse(publicProblem(error, requestId));
      logger.write({ requestId, status: problem.status, code: problem.code });
      return Response.json(problem, {
        status: problem.status,
        headers: {
          ...headers,
          'Content-Type': 'application/problem+json',
          ...(problem.status === 405 ? { Allow: 'GET' } : {}),
        },
      });
    }
  };
}

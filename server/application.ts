import { ApiError } from './platform/errors';
import type { ApplicationServices } from './modules/ports';
import type {
  AuthorizationService,
  IdentityVerifier,
} from './security/authorization';
import { createIdentityService } from './modules/identity/service';
import { createOrganizationsService } from './modules/organizations/service';
import { createMembershipsService } from './modules/memberships/service';
import { createProjectsService } from './modules/projects/service';
import { createTrackingService } from './modules/tracking/service';
import { createTimesheetsService } from './modules/timesheets/service';
import { createBillingService } from './modules/billing/service';
import { createEntitlementsService } from './modules/entitlements/service';
import { createAuditService } from './modules/audit/service';
export interface Dependencies {
  identity: IdentityVerifier;
  authorization: AuthorizationService;
  services: ApplicationServices;
}
// No environment toggle can turn this composition into a production integration.
export function createDisabledDependencies(): Dependencies {
  return {
    identity: {
      async verify() {
        throw new ApiError('INTEGRATION_DISABLED');
      },
    },
    authorization: {
      async resolve() {
        throw new ApiError('INTEGRATION_DISABLED');
      },
    },
    services: {
      identity: createIdentityService(),
      organizations: createOrganizationsService(),
      memberships: createMembershipsService(),
      projects: createProjectsService(),
      tracking: createTrackingService(),
      timesheets: createTimesheetsService(),
      billing: createBillingService(),
      entitlements: createEntitlementsService(),
      audit: createAuditService(),
    },
  };
}

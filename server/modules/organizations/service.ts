import type { ModuleService } from '../ports';
export function createOrganizationsService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'organizations',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

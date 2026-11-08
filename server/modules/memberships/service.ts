import type { ModuleService } from '../ports';
export function createMembershipsService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'memberships',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

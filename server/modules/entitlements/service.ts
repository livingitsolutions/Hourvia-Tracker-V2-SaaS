import type { ModuleService } from '../ports';
export function createEntitlementsService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'entitlements',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

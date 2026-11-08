import type { ModuleService } from '../ports';
export function createBillingService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'billing',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

import type { ModuleService } from '../ports';
export function createTrackingService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'tracking',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

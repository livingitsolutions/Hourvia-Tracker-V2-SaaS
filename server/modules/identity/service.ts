import type { ModuleService } from '../ports';
export function createIdentityService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'identity',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

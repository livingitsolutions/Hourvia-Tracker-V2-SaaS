import type { ModuleService } from '../ports';
export function createAuditService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'audit',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

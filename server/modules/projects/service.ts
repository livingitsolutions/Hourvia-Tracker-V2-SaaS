import type { ModuleService } from '../ports';
export function createProjectsService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'projects',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

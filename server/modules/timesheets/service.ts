import type { ModuleService } from '../ports';
export function createTimesheetsService(): ModuleService {
  return {
    async availability(context) {
      void context;
      return {
        module: 'timesheets',
        available: false,
        reason: 'INTEGRATION_DISABLED',
      };
    },
  };
}

import type { Availability, modules } from '../../shared/contracts/api';
import type { OrganizationContext } from '../security/authorization';
export interface ModuleService {
  availability(context: OrganizationContext): Promise<Availability>;
}
export type ApplicationServices = Record<
  (typeof modules)[number],
  ModuleService
>;

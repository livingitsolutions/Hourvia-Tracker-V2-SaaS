import { z } from 'zod';

export const modules = [
  'identity',
  'organizations',
  'memberships',
  'projects',
  'tracking',
  'timesheets',
  'billing',
  'entitlements',
  'audit',
] as const;
export const moduleSchema = z.enum(modules);
export const organizationParams = z
  .object({ organizationId: z.uuid(), module: moduleSchema })
  .strict();
export const availabilitySchema = z
  .object({
    module: moduleSchema,
    available: z.literal(false),
    reason: z.literal('INTEGRATION_DISABLED'),
  })
  .strict();
export const problemCodes = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'METHOD_NOT_ALLOWED',
  'INTEGRATION_DISABLED',
  'INTERNAL_ERROR',
] as const;
export const problemSchema = z
  .object({
    code: z.enum(problemCodes),
    status: z.number().int(),
    detail: z.string(),
    requestId: z.uuid(),
  })
  .strict();
export type Availability = z.infer<typeof availabilitySchema>;
export const foundationSchema = z
  .object({
    mode: z.literal('isolated'),
    integrationsEnabled: z.literal(false),
    modules: z.array(moduleSchema),
  })
  .strict();

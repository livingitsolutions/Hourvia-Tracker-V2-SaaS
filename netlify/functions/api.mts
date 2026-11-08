import type { Config } from '@netlify/functions';
import { createApi } from '../../server/api';
import { createDisabledDependencies } from '../../server/application';
import { sanitizedLogger } from '../../server/platform/logging';
export default async (request: Request) =>
  createApi(createDisabledDependencies(), sanitizedLogger)(request);
export const config: Config = { path: '/api/v1/*' };

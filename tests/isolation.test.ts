// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { modules } from '../shared/contracts/api';
import { createDisabledDependencies } from '../server/application';
it('contains no schema, migration artifacts or provider dependencies', () => {
  for (const path of [
    'db',
    'netlify/database',
    'drizzle',
    'supabase',
    '.env',
    '.env.local',
  ]) {
    expect(existsSync(path), path).toBe(false);
  }
  const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const dependencies = Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
  });
  expect(
    dependencies.some((name) =>
      /supabase|resend|drizzle|@netlify\/database|@netlify\/blobs|^pg$/.test(
        name,
      ),
    ),
  ).toBe(false);
});
it('keeps every domain boundary explicitly unavailable', async () => {
  const services = createDisabledDependencies().services;
  // Context exists solely as a synthetic test fixture; no service stores data.
  const context = {
    organizationId: 'synthetic-org',
    actor: { userId: 'synthetic-user', sessionId: 'synthetic-session' },
  } as Parameters<typeof services.projects.availability>[0];
  for (const module of modules) {
    expect(await services[module].availability(context)).toEqual({
      module,
      available: false,
      reason: 'INTEGRATION_DISABLED',
    });
  }
});

// src/__tests__/mocks/leads-id.test.ts
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { leadHandlers } from '@/mocks/handlers/leads';
import { leadsStore } from '@/mocks/data/leads';

const server = setupServer(...leadHandlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const BASE = 'http://localhost';

describe('GET /api/leads/:id', () => {
  it('returns a full Lead (bare object, no envelope)', async () => {
    const id = leadsStore[0].id;
    const res = await fetch(`${BASE}/api/leads/${id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(id);
    expect(body).toHaveProperty('vehiclesOfInterest');
    expect(body).toHaveProperty('budget');
    expect(body).toHaveProperty('clientProfile');
    expect(body).not.toHaveProperty('data');
  });

  it('returns 404 for unknown id', async () => {
    const res = await fetch(`${BASE}/api/leads/does-not-exist`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Lead not found' });
  });
});

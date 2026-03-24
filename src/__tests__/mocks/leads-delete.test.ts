// src/__tests__/mocks/leads-delete.test.ts
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { leadHandlers } from '@/mocks/handlers/leads';
import { leadsStore } from '@/mocks/data/leads';

const server = setupServer(...leadHandlers);
const initialLength = leadsStore.length;
const initialSnapshots = leadsStore.map((l) => ({ ...l }));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const BASE = 'http://localhost';

// Restore the store to its original state before each test so deletions don't bleed.
// We rebuild from scratch because deletions shift indices and cause Object.assign to fail.
beforeEach(() => {
  leadsStore.splice(0, leadsStore.length, ...initialSnapshots.map((s) => ({ ...s })));
});

describe('DELETE /api/leads/:id', () => {
  it('returns 204 No Content on success', async () => {
    const id = leadsStore[0].id;
    const res = await fetch(`${BASE}/api/leads/${id}`, { method: 'DELETE' });
    expect(res.status).toBe(204);
    expect(res.headers.get('content-type')).toBeNull();
  });

  it('removes the lead from the store', async () => {
    const id = leadsStore[0].id;
    expect(leadsStore.some((l) => l.id === id)).toBe(true);

    await fetch(`${BASE}/api/leads/${id}`, { method: 'DELETE' });

    expect(leadsStore.some((l) => l.id === id)).toBe(false);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await fetch(`${BASE}/api/leads/does-not-exist`, { method: 'DELETE' });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('does not remove other leads when one is deleted', async () => {
    const countBefore = leadsStore.length;
    const id = leadsStore[0].id;
    await fetch(`${BASE}/api/leads/${id}`, { method: 'DELETE' });
    expect(leadsStore.length).toBe(countBefore - 1);
  });

  it('deleted lead no longer appears in GET /api/leads', async () => {
    const id = leadsStore[0].id;
    await fetch(`${BASE}/api/leads/${id}`, { method: 'DELETE' });

    const listRes = await fetch(`${BASE}/api/leads`);
    const body = await listRes.json();
    expect(body.data.some((l: { id: string }) => l.id === id)).toBe(false);
  });

  it('deleted lead returns 404 on direct GET', async () => {
    const id = leadsStore[0].id;
    await fetch(`${BASE}/api/leads/${id}`, { method: 'DELETE' });

    const getRes = await fetch(`${BASE}/api/leads/${id}`);
    expect(getRes.status).toBe(404);
  });

  it('deleting the same id twice returns 404 on the second call', async () => {
    const id = leadsStore[0].id;
    const first = await fetch(`${BASE}/api/leads/${id}`, { method: 'DELETE' });
    expect(first.status).toBe(204);

    const second = await fetch(`${BASE}/api/leads/${id}`, { method: 'DELETE' });
    expect(second.status).toBe(404);
  });
});

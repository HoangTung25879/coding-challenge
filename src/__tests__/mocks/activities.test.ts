// src/__tests__/mocks/activities.test.ts
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { activityHandlers } from '@/mocks/handlers/activities';
import { activitiesStore } from '@/mocks/data/activities';
import { leadsStore } from '@/mocks/data/leads';

const server = setupServer(...activityHandlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const BASE = 'http://localhost';
const initialLength = activitiesStore.length;

// IDs from seeded store
const lead0Id = leadsStore[0].id;
const lead1Id = leadsStore[1].id;
// Index 21 (22nd lead) is seeded with no activities
const lead21Id = leadsStore[21].id;

beforeEach(() => {
  // Reset store to initial seed — removes any mutations added by tests
  activitiesStore.splice(initialLength);
});

describe('GET /api/leads/:id/activities', () => {
  it('returns activities for a lead as { data: Activity[] }', async () => {
    const res = await fetch(`${BASE}/api/leads/${lead0Id}/activities`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.every((a: { leadId: string }) => a.leadId === lead0Id)).toBe(true);
  });

  it('returns activities sorted by createdAt ascending', async () => {
    const res = await fetch(`${BASE}/api/leads/${lead0Id}/activities`);
    const body = await res.json();
    const dates: string[] = body.data.map((a: { createdAt: string }) => a.createdAt);
    expect(dates).toEqual([...dates].sort());
  });

  it('returns empty data array for lead with no activities', async () => {
    const res = await fetch(`${BASE}/api/leads/${lead21Id}/activities`);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});

describe('POST /api/leads/:id/activities', () => {
  it('creates a new activity and returns 201', async () => {
    const res = await fetch(`${BASE}/api/leads/${lead0Id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'call',
        subject: 'Follow-up call',
        note: 'Discussed delivery options.',
        createdBy: 'salesperson-1',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.leadId).toBe(lead0Id);
    expect(body.type).toBe('call');
    expect(body.subject).toBe('Follow-up call');
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
  });

  it('persists the new activity to the store', async () => {
    const countBefore = activitiesStore.filter((a) => a.leadId === lead0Id).length;
    await fetch(`${BASE}/api/leads/${lead0Id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'email',
        subject: 'Sent quote',
        note: 'PDF attached',
        createdBy: 'salesperson-1',
      }),
    });
    const countAfter = activitiesStore.filter((a) => a.leadId === lead0Id).length;
    expect(countAfter).toBe(countBefore + 1);
  });

  it('injects leadId from URL — ignores leadId in body', async () => {
    const res = await fetch(`${BASE}/api/leads/${lead1Id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'note',
        subject: 'Note',
        note: 'Test',
        createdBy: 'salesperson-1',
        leadId: 'WRONG',
      }),
    });
    const body = await res.json();
    expect(body.leadId).toBe(lead1Id);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await fetch(`${BASE}/api/leads/${lead0Id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'call' }), // missing subject, note, createdBy
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 for invalid activity type', async () => {
    const res = await fetch(`${BASE}/api/leads/${lead0Id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'meeting',
        subject: 'Meeting',
        note: 'Test',
        createdBy: 'salesperson-1',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown lead', async () => {
    const res = await fetch(`${BASE}/api/leads/does-not-exist/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'call',
        subject: 'Test',
        note: 'Test',
        createdBy: 'salesperson-1',
      }),
    });
    expect(res.status).toBe(404);
  });
});

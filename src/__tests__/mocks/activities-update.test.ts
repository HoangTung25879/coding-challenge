// src/__tests__/mocks/activities-update.test.ts
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { activityHandlers } from '@/mocks/handlers/activities';
import { activitiesStore } from '@/mocks/data/activities';
import { leadsStore } from '@/mocks/data/leads';
import type { Activity } from '@/types';

const server = setupServer(...activityHandlers);
const initialLength = activitiesStore.length;
const initialSnapshots = activitiesStore.map((a) => ({ ...a }));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const BASE = 'http://localhost';

beforeEach(() => {
  // Restore any mutations made by previous tests
  activitiesStore.splice(initialLength);
  initialSnapshots.forEach((snap, i) => {
    activitiesStore[i] = { ...snap };
  });
});

// Pick an activity that is initially pending (completedAt === null)
function getPendingActivity(): Activity {
  const pending = activitiesStore.find((a) => a.completedAt === null);
  if (!pending) throw new Error('No pending activity found in seed data');
  return pending;
}

describe('PATCH /api/leads/:leadId/activities/:activityId — mark complete', () => {
  it('returns 200 with updated activity', async () => {
    const activity = getPendingActivity();
    const completedAt = new Date().toISOString();

    const res = await fetch(`${BASE}/api/leads/${activity.leadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(activity.id);
    expect(body.completedAt).toBe(completedAt);
  });

  it('persists completedAt in the store', async () => {
    const activity = getPendingActivity();
    const completedAt = new Date().toISOString();

    await fetch(`${BASE}/api/leads/${activity.leadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt }),
    });

    const stored = activitiesStore.find((a) => a.id === activity.id);
    expect(stored?.completedAt).toBe(completedAt);
  });

  it('can update the note field', async () => {
    const activity = getPendingActivity();
    const updatedNote = 'Updated follow-up note';

    const res = await fetch(`${BASE}/api/leads/${activity.leadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: updatedNote }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.note).toBe(updatedNote);
  });

  it('returns 404 for unknown activity id', async () => {
    const leadId = leadsStore[0].id;
    const res = await fetch(`${BASE}/api/leads/${leadId}/activities/nonexistent-activity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt: new Date().toISOString() }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 404 when activityId belongs to a different lead', async () => {
    // Find an activity and use the wrong leadId
    const activity = activitiesStore[0];
    const wrongLeadId = leadsStore.find((l) => l.id !== activity.leadId)!.id;

    const res = await fetch(`${BASE}/api/leads/${wrongLeadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt: new Date().toISOString() }),
    });

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/leads/:leadId/activities/:activityId — read-only field guards', () => {
  it('silently ignores id in patch body', async () => {
    const activity = getPendingActivity();
    const originalId = activity.id;

    const res = await fetch(`${BASE}/api/leads/${activity.leadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'hacked-id', note: 'legit update' }),
    });

    const body = await res.json();
    expect(body.id).toBe(originalId);
    expect(body.note).toBe('legit update');
  });

  it('silently ignores leadId in patch body', async () => {
    const activity = getPendingActivity();
    const originalLeadId = activity.leadId;

    const res = await fetch(`${BASE}/api/leads/${activity.leadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: 'injected-lead', note: 'update' }),
    });

    const body = await res.json();
    expect(body.leadId).toBe(originalLeadId);
  });

  it('silently ignores createdAt in patch body', async () => {
    const activity = getPendingActivity();
    const originalCreatedAt = activity.createdAt;

    const res = await fetch(`${BASE}/api/leads/${activity.leadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createdAt: '1970-01-01T00:00:00Z' }),
    });

    const body = await res.json();
    expect(body.createdAt).toBe(originalCreatedAt);
  });

  it('silently ignores createdBy in patch body', async () => {
    const activity = getPendingActivity();
    const originalCreatedBy = activity.createdBy;

    const res = await fetch(`${BASE}/api/leads/${activity.leadId}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createdBy: 'hacker', note: 'update' }),
    });

    const body = await res.json();
    expect(body.createdBy).toBe(originalCreatedBy);
  });
});

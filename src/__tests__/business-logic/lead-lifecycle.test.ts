/**
 * Lead Lifecycle Integration Tests
 *
 * These tests exercise the complete business flows a salesperson performs:
 *   1. Create a new lead
 *   2. Update the lead's status as it progresses
 *   3. Log follow-up activities against the lead
 *   4. Complete (resolve) an activity
 *   5. Delete a lead
 *
 * All tests run against MSW handlers + in-memory stores — no React involved.
 * This validates that the persistence layer correctly enforces business rules
 * end-to-end, independent of UI concerns.
 */
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { leadHandlers } from '@/mocks/handlers/leads';
import { activityHandlers } from '@/mocks/handlers/activities';
import { leadsStore } from '@/mocks/data/leads';
import { activitiesStore } from '@/mocks/data/activities';
import type { Lead, Activity } from '@/types';

const server = setupServer(...leadHandlers, ...activityHandlers);

const initialLeadLength = leadsStore.length;
const initialLeadSnapshots = leadsStore.map((l) => ({ ...l }));
const initialActivityLength = activitiesStore.length;
const initialActivitySnapshots = activitiesStore.map((a) => ({ ...a }));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  // Restore lead store
  leadsStore.splice(initialLeadLength);
  initialLeadSnapshots.forEach((snap, i) => {
    leadsStore[i] = { ...snap };
  });
  // Restore activity store
  activitiesStore.splice(initialActivityLength);
  initialActivitySnapshots.forEach((snap, i) => {
    activitiesStore[i] = { ...snap };
  });
});

const BASE = 'http://localhost';

async function createLead(overrides: Partial<{
  fullName: string;
  email: string;
  source: string;
  leadType: string;
  status: string;
}> = {}): Promise<Lead> {
  const res = await fetch(`${BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Jane Prospect',
      email: 'jane@example.com',
      source: 'website',
      leadType: 'cold',
      status: 'new',
      ...overrides,
    }),
  });
  expect(res.status).toBe(201);
  return res.json() as Promise<Lead>;
}

async function logActivity(
  leadId: string,
  overrides: Partial<{
    type: string;
    subject: string;
    note: string;
    createdBy: string;
    scheduledAt: string;
  }> = {}
): Promise<Activity> {
  const res = await fetch(`${BASE}/api/leads/${leadId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'call',
      subject: 'Initial contact',
      note: 'Left voicemail',
      createdBy: 'rep-001',
      ...overrides,
    }),
  });
  expect(res.status).toBe(201);
  return res.json() as Promise<Activity>;
}

async function patchLead(id: string, patch: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`${BASE}/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  expect(res.status).toBe(200);
  return res.json() as Promise<Lead>;
}

async function completeActivity(leadId: string, activityId: string): Promise<Activity> {
  const completedAt = new Date().toISOString();
  const res = await fetch(`${BASE}/api/leads/${leadId}/activities/${activityId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completedAt }),
  });
  expect(res.status).toBe(200);
  return res.json() as Promise<Activity>;
}

// ---------------------------------------------------------------------------
// 1. Lead creation
// ---------------------------------------------------------------------------
describe('Lead creation', () => {
  it('new lead starts with status "new"', async () => {
    const lead = await createLead();
    expect(lead.status).toBe('new');
  });

  it('new lead has empty vehiclesOfInterest', async () => {
    const lead = await createLead();
    expect(lead.vehiclesOfInterest).toEqual([]);
  });

  it('new lead has null clientProfile', async () => {
    const lead = await createLead();
    expect(lead.clientProfile).toBeNull();
  });

  it('new lead appears in the inbox immediately', async () => {
    const lead = await createLead({ fullName: 'Lifecycle Test Lead' });

    const res = await fetch(`${BASE}/api/leads?search=Lifecycle+Test+Lead`);
    const body = await res.json();
    expect(body.data.some((l: Lead) => l.id === lead.id)).toBe(true);
  });

  it('creation fails with invalid email', async () => {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bad Email',
        email: 'not-an-email',
        source: 'website',
        leadType: 'cold',
        status: 'new',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('creation fails with unknown lead type', async () => {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bad Type',
        email: 'ok@example.com',
        source: 'website',
        leadType: 'lukewarm', // invalid
        status: 'new',
      }),
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 2. Lead status progression
// ---------------------------------------------------------------------------
describe('Lead status progression', () => {
  it('status advances from "new" to "contacted"', async () => {
    const lead = await createLead();
    const updated = await patchLead(lead.id, { status: 'contacted' });
    expect(updated.status).toBe('contacted');
  });

  it('status advances from "contacted" to "qualified"', async () => {
    const lead = await createLead();
    await patchLead(lead.id, { status: 'contacted' });
    const qualified = await patchLead(lead.id, { status: 'qualified' });
    expect(qualified.status).toBe('qualified');
  });

  it('status can be set to "unqualified"', async () => {
    const lead = await createLead();
    const unqualified = await patchLead(lead.id, { status: 'unqualified' });
    expect(unqualified.status).toBe('unqualified');
  });

  it('updatedAt changes after a status patch', async () => {
    const lead = await createLead();
    const originalUpdatedAt = lead.updatedAt;

    // Ensure at least 1 ms passes
    await new Promise((r) => setTimeout(r, 5));
    const updated = await patchLead(lead.id, { status: 'contacted' });

    expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    expect(new Date(updated.updatedAt) > new Date(originalUpdatedAt)).toBe(true);
  });

  it('status change is reflected in GET /api/leads/:id', async () => {
    const lead = await createLead();
    await patchLead(lead.id, { status: 'qualified' });

    const res = await fetch(`${BASE}/api/leads/${lead.id}`);
    const fetched: Lead = await res.json();
    expect(fetched.status).toBe('qualified');
  });
});

// ---------------------------------------------------------------------------
// 3. Activity logging
// ---------------------------------------------------------------------------
describe('Activity logging', () => {
  it('newly logged activity starts as pending (completedAt === null)', async () => {
    const lead = await createLead();
    const activity = await logActivity(lead.id);
    expect(activity.completedAt).toBeNull();
  });

  it('activity is associated with the correct lead', async () => {
    const lead = await createLead();
    const activity = await logActivity(lead.id);
    expect(activity.leadId).toBe(lead.id);
  });

  it('multiple activities can be logged for the same lead', async () => {
    const lead = await createLead();
    await logActivity(lead.id, { type: 'call', subject: 'First call', note: 'No answer', createdBy: 'rep-001' });
    await logActivity(lead.id, { type: 'email', subject: 'Follow-up email', note: 'Sent brochure', createdBy: 'rep-001' });

    const res = await fetch(`${BASE}/api/leads/${lead.id}/activities`);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.data.every((a: Activity) => a.leadId === lead.id)).toBe(true);
  });

  it('activities are returned in chronological order (oldest first)', async () => {
    const lead = await createLead();
    await logActivity(lead.id, { subject: 'First', note: 'First note', createdBy: 'rep-001' });
    await new Promise((r) => setTimeout(r, 5));
    await logActivity(lead.id, { subject: 'Second', note: 'Second note', createdBy: 'rep-001' });

    const res = await fetch(`${BASE}/api/leads/${lead.id}/activities`);
    const body = await res.json();
    const mine: Activity[] = body.data.filter((a: Activity) => a.leadId === lead.id);
    const dates = mine.map((a) => a.createdAt);
    expect(dates).toEqual([...dates].sort());
  });

  it('all valid activity types are accepted', async () => {
    const lead = await createLead();
    const types = ['call', 'email', 'text', 'appointment', 'note', 'walk-in'] as const;

    for (const type of types) {
      const activity = await logActivity(lead.id, { type, subject: `${type} subject`, note: `${type} note`, createdBy: 'rep-001' });
      expect(activity.type).toBe(type);
    }
  });

  it('logging activity with scheduledAt stores the value', async () => {
    const lead = await createLead();
    const scheduledAt = new Date(Date.now() + 86400000).toISOString(); // tomorrow
    const activity = await logActivity(lead.id, { scheduledAt });
    expect(activity.scheduledAt).toBe(scheduledAt);
  });

  it('rejects activity logged against non-existent lead', async () => {
    const res = await fetch(`${BASE}/api/leads/ghost-lead/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'call', subject: 'Test', note: 'Test', createdBy: 'rep-001' }),
    });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 4. Activity completion
// ---------------------------------------------------------------------------
describe('Activity completion', () => {
  it('marking an activity complete sets a non-null completedAt', async () => {
    const lead = await createLead();
    const activity = await logActivity(lead.id);
    expect(activity.completedAt).toBeNull();

    const completed = await completeActivity(lead.id, activity.id);
    expect(completed.completedAt).not.toBeNull();
    expect(typeof completed.completedAt).toBe('string');
  });

  it('completed activity appears in the feed with completedAt set', async () => {
    const lead = await createLead();
    const activity = await logActivity(lead.id);
    await completeActivity(lead.id, activity.id);

    const res = await fetch(`${BASE}/api/leads/${lead.id}/activities`);
    const body = await res.json();
    const found = body.data.find((a: Activity) => a.id === activity.id);
    expect(found).toBeDefined();
    expect(found.completedAt).not.toBeNull();
  });

  it('completing does not change leadId or type', async () => {
    const lead = await createLead();
    const activity = await logActivity(lead.id, { type: 'email', subject: 'Quote', note: 'Sent PDF', createdBy: 'rep-001' });

    const completed = await completeActivity(lead.id, activity.id);
    expect(completed.leadId).toBe(lead.id);
    expect(completed.type).toBe('email');
  });

  it('completing an activity on a different lead returns 404', async () => {
    const lead1 = await createLead({ email: 'lead1@example.com' });
    const lead2 = await createLead({ email: 'lead2@example.com' });
    const activity = await logActivity(lead1.id);

    const res = await fetch(`${BASE}/api/leads/${lead2.id}/activities/${activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt: new Date().toISOString() }),
    });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 5. Full lifecycle (create → contact → qualify → log activity → complete → delete)
// ---------------------------------------------------------------------------
describe('Full lead lifecycle', () => {
  it('covers the complete salesperson workflow end-to-end', async () => {
    // Step 1: New lead arrives
    const lead = await createLead({ fullName: 'Full Lifecycle Lead', email: 'full@example.com', leadType: 'warm' });
    expect(lead.status).toBe('new');

    // Step 2: Salesperson contacts the lead
    const contacted = await patchLead(lead.id, { status: 'contacted' });
    expect(contacted.status).toBe('contacted');

    // Step 3: Log a call activity
    const callActivity = await logActivity(lead.id, {
      type: 'call',
      subject: 'Initial call',
      note: 'Discussed needs, interested in SUV',
      createdBy: 'rep-001',
    });
    expect(callActivity.completedAt).toBeNull();

    // Step 4: Complete the call activity
    const completedCall = await completeActivity(lead.id, callActivity.id);
    expect(completedCall.completedAt).not.toBeNull();

    // Step 5: Qualify the lead after successful call
    const qualified = await patchLead(lead.id, { status: 'qualified' });
    expect(qualified.status).toBe('qualified');

    // Step 6: Log a follow-up email
    const emailActivity = await logActivity(lead.id, {
      type: 'email',
      subject: 'Quote sent',
      note: 'Sent pricing sheet for X5 and Tiguan',
      createdBy: 'rep-001',
    });

    // Verify both activities appear in the feed
    const feedRes = await fetch(`${BASE}/api/leads/${lead.id}/activities`);
    const feed = await feedRes.json();
    const myActivities: Activity[] = feed.data.filter((a: Activity) => a.leadId === lead.id);
    expect(myActivities.length).toBeGreaterThanOrEqual(2);
    expect(myActivities.some((a) => a.id === callActivity.id && a.completedAt !== null)).toBe(true);
    expect(myActivities.some((a) => a.id === emailActivity.id && a.completedAt === null)).toBe(true);

    // Step 7: Delete the lead (e.g., duplicate record)
    const deleteRes = await fetch(`${BASE}/api/leads/${lead.id}`, { method: 'DELETE' });
    expect(deleteRes.status).toBe(204);

    // Lead is gone from the inbox
    const listRes = await fetch(`${BASE}/api/leads?search=Full+Lifecycle+Lead`);
    const list = await listRes.json();
    expect(list.data.some((l: Lead) => l.id === lead.id)).toBe(false);

    // Direct fetch also returns 404
    const directRes = await fetch(`${BASE}/api/leads/${lead.id}`);
    expect(directRes.status).toBe(404);
  });
});

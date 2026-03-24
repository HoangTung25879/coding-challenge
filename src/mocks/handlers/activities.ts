// src/mocks/handlers/activities.ts
import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { activitiesStore } from '@/mocks/data/activities';
import { leadsStore } from '@/mocks/data/leads';
import { logger } from '@/lib/logger';

const MOCK_DELAY_MS = 100;

const ActivityBodySchema = z.object({
  type: z.enum(['call', 'email', 'text', 'appointment', 'note', 'walk-in']),
  subject: z.string().min(1),
  note: z.string().min(1),
  createdBy: z.string().min(1),
  scheduledAt: z.string().optional(),
});

export const activityHandlers = [
  http.get('*/api/leads/:id/activities', async ({ params }) => {
    await delay(MOCK_DELAY_MS);
    const activities = activitiesStore
      .filter((a) => a.leadId === params.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    logger.info(
      {
        method: 'GET',
        path: '/api/leads/:id/activities',
        leadId: params.id,
        count: activities.length,
      },
      'activities fetched'
    );
    return HttpResponse.json({ data: activities });
  }),

  http.post('*/api/leads/:id/activities', async ({ request, params }) => {
    await delay(MOCK_DELAY_MS);
    const leadId = params.id as string;

    const leadExists = leadsStore.some((l) => l.id === leadId);
    if (!leadExists) {
      return HttpResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = ActivityBodySchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const activity = {
      id: crypto.randomUUID(),
      leadId, // injected from URL — not from body
      ...parsed.data,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    activitiesStore.push(activity);

    logger.info(
      {
        method: 'POST',
        path: '/api/leads/:id/activities',
        leadId,
        type: parsed.data.type,
        status: 201,
      },
      'activity created'
    );
    return HttpResponse.json(activity, { status: 201 });
  }),

  http.patch('*/api/leads/:leadId/activities/:activityId', async ({ request, params }) => {
    await delay(MOCK_DELAY_MS);
    const { leadId, activityId } = params as {
      leadId: string;
      activityId: string;
    };
    const idx = activitiesStore.findIndex((a) => a.id === activityId && a.leadId === leadId);
    if (idx === -1) {
      return HttpResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return HttpResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    // Strip read-only fields
    const { id: _id, leadId: _lid, createdAt: _ca, createdBy: _cb, ...writable } = body;
    activitiesStore[idx] = { ...activitiesStore[idx], ...writable };
    return HttpResponse.json(activitiesStore[idx]);
  }),
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

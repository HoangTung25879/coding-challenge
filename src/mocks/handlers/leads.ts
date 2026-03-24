// src/mocks/handlers/leads.ts
import { http, HttpResponse } from 'msw';
import { get } from 'lodash-es';
import { z } from 'zod';
import { leadsStore } from '@/mocks/data/leads';
import { logger } from '@/lib/logger';
import type { Lead } from '@/types';

const MOCK_DELAY_MS = 100;

export const leadHandlers = [
  http.get('*/api/leads', async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const limit = Math.max(1, Number(url.searchParams.get('limit') ?? 10));
    const search = url.searchParams.get('search');
    const source = url.searchParams.get('source');
    const budgetMin = url.searchParams.get('budgetMin');
    const budgetMax = url.searchParams.get('budgetMax');
    const currency = url.searchParams.get('currency');
    const timeline = url.searchParams.get('timeline');
    const financing = url.searchParams.get('financing');
    const leadType = url.searchParams.get('leadType');
    const status = url.searchParams.get('status');
    const sort = url.searchParams.get('sort') ?? 'createdAt';
    const order = url.searchParams.get('order') ?? 'desc';

    let filtered: Lead[] = leadsStore;

    // Text search across multiple fields
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q)
      );
    }

    if (source) filtered = filtered.filter((l) => l.source === source);

    // Budget range
    if (budgetMin) {
      const min = Number(budgetMin);
      filtered = filtered.filter((l) => l.budget.max >= min);
    }
    if (budgetMax) {
      const max = Number(budgetMax);
      filtered = filtered.filter((l) => l.budget.max <= max);
    }

    if (currency) filtered = filtered.filter((l) => l.budget.currency === currency);
    if (timeline) filtered = filtered.filter((l) => l.purchaseTimeline === timeline);
    if (financing) filtered = filtered.filter((l) => l.financingPreference === financing);
    if (leadType) filtered = filtered.filter((l) => l.leadType === leadType);
    if (status) filtered = filtered.filter((l) => l.status === status);

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aVal = get(a, sort);
      const bVal = get(b, sort);
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const data = filtered.slice((page - 1) * limit, page * limit);

    logger.info(
      { method: 'GET', path: '/api/leads', page, status: 200, resultCount: data.length },
      'leads fetched'
    );

    return HttpResponse.json({
      data,
      pagination: { page, limit, total, totalPages },
    });
  }),

  http.get('*/api/leads/:id', async ({ params }) => {
    await delay(MOCK_DELAY_MS);
    const lead = leadsStore.find((l) => l.id === params.id);
    if (!lead) {
      logger.warn(
        { method: 'GET', path: '/api/leads/:id', id: params.id, status: 404 },
        'lead not found'
      );
      return HttpResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    logger.info(
      { method: 'GET', path: '/api/leads/:id', id: params.id, status: 200 },
      'lead fetched'
    );
    return HttpResponse.json(lead);
  }),

  http.post('*/api/leads', async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    const body = (await request.json()) as Record<string, unknown>;

    const schema = z.object({
      fullName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      source: z.enum([
        'website',
        'referral',
        'walk-in',
        'phone',
        'social-media',
        'dealer-event',
        'other',
      ]),
      leadType: z.enum(['cold', 'warm', 'hot']),
      status: z.enum(['new', 'contacted', 'qualified', 'unqualified']),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? '',
      bestTimeToContact: '',
      address: { street: '', city: '', state: '', country: '', postalCode: '' },
      leadType: parsed.data.leadType,
      status: parsed.data.status,
      clientProfile: null,
      source: parsed.data.source,
      salesModel: 'direct',
      preferredCommunication: [],
      notes: '',
      vehiclesOfInterest: [],
      budget: { max: 0, monthlyPaymentTarget: 0, currency: 'USD' },
      financingPreference: 'undecided',
      purchaseTimeline: 'exploring',
      assignedSalesRepId: '',
      createdAt: now,
      updatedAt: now,
    };

    leadsStore.push(newLead);
    logger.info(
      { method: 'POST', path: '/api/leads', id: newLead.id, status: 201 },
      'lead created'
    );
    return HttpResponse.json(newLead, { status: 201 });
  }),

  http.patch('*/api/leads/:id', async ({ params, request }) => {
    await delay(MOCK_DELAY_MS);
    const idx = leadsStore.findIndex((l) => l.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const patch = (await request.json()) as Record<string, unknown>;

    // Strip read-only / system fields silently
    const {
      id: _id,
      createdAt: _ca,
      updatedAt: _ua,
      ...writablePatch
    } = patch;

    leadsStore[idx] = {
      ...leadsStore[idx],
      ...writablePatch,
      updatedAt: new Date().toISOString(),
    } as Lead;

    logger.info(
      { method: 'PATCH', path: '/api/leads/:id', id: params.id, status: 200 },
      'lead updated'
    );
    return HttpResponse.json(leadsStore[idx]);
  }),

  http.delete('*/api/leads/:id', async ({ params }) => {
    await delay(MOCK_DELAY_MS);
    const id = params.id as string;
    const idx = leadsStore.findIndex((l) => l.id === id);
    if (idx === -1) {
      return HttpResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    leadsStore.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

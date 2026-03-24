// src/__tests__/mocks/leads-filters.test.ts
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { leadHandlers } from '@/mocks/handlers/leads';
import { leadsStore } from '@/mocks/data/leads';
import type { Lead } from '@/types';

const server = setupServer(...leadHandlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const BASE = 'http://localhost';

async function fetchLeads(
  params: Record<string, string> = {}
): Promise<{
  data: Lead[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/leads${qs ? `?${qs}` : ''}`);
  expect(res.status).toBe(200);
  return res.json();
}

describe('GET /api/leads — search', () => {
  it('searches by fullName (case-insensitive)', async () => {
    const name = leadsStore[0].fullName.split(' ')[0].toLowerCase();
    const body = await fetchLeads({ search: name });
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((l) => l.fullName.toLowerCase().includes(name))).toBe(true);
  });

  it('searches by email', async () => {
    const email = leadsStore[0].email.split('@')[0];
    const body = await fetchLeads({ search: email });
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((l) => l.email.toLowerCase().includes(email.toLowerCase()))).toBe(true);
  });

  it('returns empty for non-matching search', async () => {
    const body = await fetchLeads({ search: 'zzz_nonexistent_zzz' });
    expect(body.data).toHaveLength(0);
    expect(body.pagination.total).toBe(0);
  });
});

describe('GET /api/leads — budget range', () => {
  it('filters by budgetMin', async () => {
    const min = 200000;
    const body = await fetchLeads({ budgetMin: String(min) });
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((l) => l.budget.max >= min)).toBe(true);
  });

  it('filters by budgetMax', async () => {
    const max = 150000;
    const body = await fetchLeads({ budgetMax: String(max) });
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((l) => l.budget.max <= max)).toBe(true);
  });

  it('filters by budget range (min + max)', async () => {
    const min = 100000;
    const max = 300000;
    const body = await fetchLeads({ budgetMin: String(min), budgetMax: String(max) });
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((l) => l.budget.max >= min && l.budget.max <= max)).toBe(true);
  });
});

describe('GET /api/leads — enum filters', () => {
  it('filters by timeline', async () => {
    const body = await fetchLeads({ timeline: 'immediate' });
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((l) => l.purchaseTimeline === 'immediate')).toBe(true);
  });

  it('filters by financing', async () => {
    const financing = leadsStore.find((l) => l.financingPreference)?.financingPreference ?? 'cash';
    const body = await fetchLeads({ financing });
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((l) => l.financingPreference === financing)).toBe(true);
  });

  it('filters by lead type', async () => {
    const body = await fetchLeads({ leadType: 'hot' });
    const expected = leadsStore.filter((l) => l.leadType === 'hot').length;
    expect(body.pagination.total).toBe(expected);
    expect(body.data.every((l) => l.leadType === 'hot')).toBe(true);
  });
});

describe('GET /api/leads — combined filters', () => {
  it('combines leadType + source filters', async () => {
    const body = await fetchLeads({ leadType: 'hot', source: 'website' });
    expect(body.data.every((l) => l.leadType === 'hot' && l.source === 'website')).toBe(true);
    const expected = leadsStore.filter(
      (l) => l.leadType === 'hot' && l.source === 'website'
    ).length;
    expect(body.pagination.total).toBe(expected);
  });

  it('combines search + source filter', async () => {
    const body = await fetchLeads({ search: 'a', source: 'website' });
    expect(
      body.data.every(
        (l) =>
          l.source === 'website' &&
          (l.fullName.toLowerCase().includes('a') ||
            l.email.toLowerCase().includes('a') ||
            l.phone.toLowerCase().includes('a') ||
            l.notes.toLowerCase().includes('a'))
      )
    ).toBe(true);
  });
});

describe('GET /api/leads — sorting', () => {
  it('sorts by fullName ascending', async () => {
    const body = await fetchLeads({ sort: 'fullName', order: 'asc', limit: '50' });
    const names = body.data.map((l) => l.fullName);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('sorts by fullName descending', async () => {
    const body = await fetchLeads({ sort: 'fullName', order: 'desc', limit: '50' });
    const names = body.data.map((l) => l.fullName);
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  it('sorts by nested field budget.max ascending', async () => {
    const body = await fetchLeads({ sort: 'budget.max', order: 'asc', limit: '50' });
    const budgets = body.data.map((l) => l.budget.max);
    for (let i = 1; i < budgets.length; i++) {
      expect(budgets[i]).toBeGreaterThanOrEqual(budgets[i - 1]);
    }
  });

  it('sorts by createdAt descending by default', async () => {
    const body = await fetchLeads({ limit: '50' });
    const dates = body.data.map((l) => l.createdAt);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] <= dates[i - 1]).toBe(true);
    }
  });
});

describe('GET /api/leads — pagination', () => {
  it('respects custom page size', async () => {
    const body = await fetchLeads({ limit: '3' });
    expect(body.data).toHaveLength(3);
    expect(body.pagination.limit).toBe(3);
    expect(body.pagination.totalPages).toBe(Math.ceil(leadsStore.length / 3));
  });

  it('returns correct page of results', async () => {
    const page1 = await fetchLeads({ limit: '5', page: '1', sort: 'fullName', order: 'asc' });
    const page2 = await fetchLeads({ limit: '5', page: '2', sort: 'fullName', order: 'asc' });
    const ids1 = page1.data.map((l) => l.id);
    const ids2 = page2.data.map((l) => l.id);
    expect(ids1).not.toEqual(ids2);
    expect(ids1.some((id) => ids2.includes(id))).toBe(false);
  });

  it('returns empty data for page beyond total', async () => {
    const body = await fetchLeads({ page: '999', limit: '10' });
    expect(body.data).toHaveLength(0);
  });
});

// src/__tests__/mocks/leads.test.ts
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { leadHandlers } from '@/mocks/handlers/leads'
import { leadsStore } from '@/mocks/data/leads'

const server = setupServer(...leadHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const BASE = 'http://localhost'

describe('GET /api/leads', () => {
  it('returns paginated LeadSummary list with pagination meta', async () => {
    const res = await fetch(`${BASE}/api/leads?page=1&limit=10`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('pagination')
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeLessThanOrEqual(10)
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.limit).toBe(10)
    expect(body.pagination.total).toBe(leadsStore.length)
  })

  it('filters by source', async () => {
    const res = await fetch(`${BASE}/api/leads?source=website`)
    const body = await res.json()
    expect(body.data.every((l: { source: string }) => l.source === 'website')).toBe(true)
  })

  it('returns full Lead shape (includes vehiclesOfInterest and budget)', async () => {
    const res = await fetch(`${BASE}/api/leads?limit=1`)
    const body = await res.json()
    const lead = body.data[0]
    expect(lead).toHaveProperty('id')
    expect(lead).toHaveProperty('fullName')
    expect(lead).toHaveProperty('vehiclesOfInterest')
    expect(lead).toHaveProperty('budget')
    expect(lead).toHaveProperty('email')
    expect(lead).toHaveProperty('phone')
    expect(lead).toHaveProperty('address')
    expect(lead).toHaveProperty('leadType')
  })

  it('paginates correctly', async () => {
    const res = await fetch(`${BASE}/api/leads?page=2&limit=5`)
    const body = await res.json()
    expect(body.pagination.page).toBe(2)
    expect(body.data.length).toBeLessThanOrEqual(5)
  })
})

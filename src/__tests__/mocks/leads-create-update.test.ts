import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { leadHandlers } from '@/mocks/handlers/leads'
import { leadsStore } from '@/mocks/data/leads'

const server = setupServer(...leadHandlers)
// Deep-clone store state at module load so we can fully restore after each test
const initialSnapshots = leadsStore.map(l => ({ ...l }))
const initialLength = leadsStore.length

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  // Remove any leads added by POST tests
  leadsStore.splice(initialLength)
  // Restore any fields mutated by PATCH tests
  initialSnapshots.forEach((snapshot, i) => {
    Object.assign(leadsStore[i], snapshot)
  })
})
afterAll(() => server.close())

const BASE = 'http://localhost'

describe('POST /api/leads', () => {
  it('creates a lead and returns a full Lead object', async () => {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        status: 'new',
        source: 'website',
        leadType: 'cold',
      }),
    })
    expect(res.status).toBe(201)
    const lead = await res.json()
    expect(lead.fullName).toBe('Test User')
    expect(lead.email).toBe('test@example.com')
    expect(lead.id).toBeTruthy()
    expect(lead.clientProfile).toBeNull()
    expect(lead.vehiclesOfInterest).toEqual([])
    expect(lead.budget).toEqual({ max: 0, monthlyPaymentTarget: 0, currency: 'USD' })
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'No Email' }),
    })
    expect(res.status).toBe(400)
  })

  it('persists the lead so it appears in GET /api/leads', async () => {
    await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Persisted Lead',
        email: 'persist@example.com',
        status: 'new',
        source: 'referral',
        leadType: 'warm',
      }),
    })
    const listRes = await fetch(`${BASE}/api/leads?search=Persisted+Lead`)
    const body = await listRes.json()
    expect(body.data.some((l: { fullName: string }) => l.fullName === 'Persisted Lead')).toBe(true)
  })
})

describe('PATCH /api/leads/:id', () => {
  it('updates a single field and returns the updated lead', async () => {
    const id = leadsStore[0].id
    const res = await fetch(`${BASE}/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'qualified' }),
    })
    expect(res.status).toBe(200)
    const lead = await res.json()
    expect(lead.id).toBe(id)
    expect(lead.status).toBe('qualified')
  })

  it('returns 404 for unknown id', async () => {
    const res = await fetch(`${BASE}/api/leads/nonexistent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'qualified' }),
    })
    expect(res.status).toBe(404)
  })

  it('silently ignores read-only fields (id, createdAt, vehiclesOfInterest)', async () => {
    const original = leadsStore[0]
    const originalId = original.id
    const originalCreatedAt = original.createdAt
    const originalVehicles = [...original.vehiclesOfInterest]
    const res = await fetch(`${BASE}/api/leads/${originalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'hacked',
        createdAt: '1970-01-01',
        vehiclesOfInterest: [{ id: 'injected', name: 'Fake', brand: 'X', model: 'Y', condition: 'new' }],
        status: 'new',
      }),
    })
    const lead = await res.json()
    expect(lead.id).toBe(originalId)
    expect(lead.createdAt).toBe(originalCreatedAt)
    expect(lead.vehiclesOfInterest).toEqual(originalVehicles)
    expect(lead.status).toBe('new')
  })
})

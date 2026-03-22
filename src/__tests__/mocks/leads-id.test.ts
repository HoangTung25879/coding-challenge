// src/__tests__/mocks/leads-id.test.ts
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { leadHandlers } from '@/mocks/handlers/leads'

const server = setupServer(...leadHandlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const BASE = 'http://localhost'

describe('GET /api/leads/:id', () => {
  it('returns a full Lead (bare object, no envelope)', async () => {
    const res = await fetch(`${BASE}/api/leads/lead-001`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('lead-001')
    expect(body).toHaveProperty('vehiclesOfInterest')
    expect(body).toHaveProperty('budget')
    expect(body).toHaveProperty('clientProfile')
    expect(body).not.toHaveProperty('data')
  })

  it('returns 404 for unknown id', async () => {
    const res = await fetch(`${BASE}/api/leads/does-not-exist`)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({ error: 'Lead not found' })
  })
})

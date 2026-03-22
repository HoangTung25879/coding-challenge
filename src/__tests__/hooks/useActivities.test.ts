import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '@/mocks/node'
import { useActivities } from '@/hooks/useActivities'
import { createWrapper } from './test-utils'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useActivities', () => {
  it('fetches activities for a lead', async () => {
    const { result } = renderHook(() => useActivities('lead-001'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Array.isArray(result.current.data?.data)).toBe(true)
    expect(result.current.data?.data.every(a => a.leadId === 'lead-001')).toBe(true)
  })
})

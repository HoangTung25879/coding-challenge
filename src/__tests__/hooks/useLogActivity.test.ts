import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '@/mocks/node'
import { useLogActivity } from '@/hooks/useLogActivity'
import { activitiesStore } from '@/mocks/data/activities'
import { createWrapper } from './test-utils'

const initialLength = activitiesStore.length
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); activitiesStore.splice(initialLength) })
afterAll(() => server.close())

describe('useLogActivity', () => {
  it('posts a new activity and resolves with created activity', async () => {
    const { result } = renderHook(() => useLogActivity(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({
        leadId: 'lead-001',
        type: 'call',
        subject: 'Hook test call',
        note: 'Testing the hook',
        createdBy: 'salesperson-1',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.leadId).toBe('lead-001')
    expect(result.current.data?.type).toBe('call')
  })
})

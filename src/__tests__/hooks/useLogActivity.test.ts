import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '@/mocks/node'
import { useLogActivity } from '@/hooks/useLogActivity'
import { activitiesStore } from '@/mocks/data/activities'
import { leadsStore } from '@/mocks/data/leads'
import { createWrapper } from './test-utils'

const initialLength = activitiesStore.length
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); activitiesStore.splice(initialLength) })
afterAll(() => server.close())

describe('useLogActivity', () => {
  it('posts a new activity and resolves with created activity', async () => {
    const leadId = leadsStore[0].id
    const { result } = renderHook(() => useLogActivity(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({
        leadId,
        type: 'call',
        subject: 'Hook test call',
        note: 'Testing the hook',
        createdBy: 'salesperson-1',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.leadId).toBe(leadId)
    expect(result.current.data?.type).toBe('call')
  })
})

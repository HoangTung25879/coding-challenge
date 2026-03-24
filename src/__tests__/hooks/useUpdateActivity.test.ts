import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { useUpdateActivity } from '@/hooks/useUpdateActivity'
import { createWrapper } from './test-utils'
import { server } from '@/mocks/node'
import { activitiesStore } from '@/mocks/data/activities'

const originalCompletedAt = activitiesStore[0].completedAt

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  activitiesStore[0].completedAt = originalCompletedAt
})
afterAll(() => server.close())

describe('useUpdateActivity', () => {
  it('calls PATCH and resolves with updated activity', async () => {
    const activity = activitiesStore[0]
    const { result } = renderHook(
      () => useUpdateActivity(activity.leadId),
      { wrapper: createWrapper() }
    )

    const completedAt = new Date().toISOString()
    act(() => {
      result.current.mutate({ activityId: activity.id, patch: { completedAt } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(activitiesStore.find(a => a.id === activity.id)?.completedAt).toBe(completedAt)
  })
})

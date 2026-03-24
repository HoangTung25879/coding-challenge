import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { server } from '@/mocks/node'
import { useUpdateLead } from '@/hooks/useUpdateLead'
import { leadsStore } from '@/mocks/data/leads'
import { createWrapper } from './test-utils'
import type { Lead } from '@/types'

// Deep-clone store state so we can fully restore after each test
const initialSnapshots = leadsStore.map(l => ({ ...l }))
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  initialSnapshots.forEach((snapshot, i) => {
    Object.assign(leadsStore[i], snapshot)
  })
})
afterAll(() => server.close())

describe('useUpdateLead', () => {
  it('patches a field and returns the updated lead', async () => {
    const targetId = leadsStore[0].id
    const { result } = renderHook(() => useUpdateLead(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ id: targetId, patch: { status: 'won' } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('won')
  })

  it('sets isError when lead not found', async () => {
    const { result } = renderHook(() => useUpdateLead(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ id: 'nonexistent', patch: { status: 'won' } })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('rolls back optimistic update on error', async () => {
    const target = leadsStore[0]
    const originalStatus = target.status
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

    // Pre-populate the cache with the current lead
    queryClient.setQueryData(['lead', target.id], { ...target })

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useUpdateLead(), { wrapper })

    await act(async () => {
      result.current.mutate({ id: 'nonexistent-rollback', patch: { status: 'won' } })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // The lead that WAS in cache should be unchanged (rollback worked)
    const cached = queryClient.getQueryData<Lead>(['lead', target.id])
    expect(cached?.status).toBe(originalStatus)
  })
})

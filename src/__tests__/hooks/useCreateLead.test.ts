import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '@/mocks/node'
import { useCreateLead } from '@/hooks/useCreateLead'
import { leadsStore } from '@/mocks/data/leads'
import { createWrapper } from './test-utils'

const initialLength = leadsStore.length
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); leadsStore.splice(initialLength) })
afterAll(() => server.close())

describe('useCreateLead', () => {
  it('creates a lead and returns the new lead', async () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({
        fullName: 'Hook Test',
        email: 'hook@test.com',
        status: 'new',
        source: 'website',
        leadType: 'cold',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.fullName).toBe('Hook Test')
    expect(result.current.data?.id).toBeTruthy()
  })

  it('sets isError on validation failure', async () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({ fullName: '', email: 'bad', status: 'new', source: 'website', leadType: 'cold' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

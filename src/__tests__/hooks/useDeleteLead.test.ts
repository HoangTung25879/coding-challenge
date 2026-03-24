import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { useDeleteLead } from '@/hooks/useDeleteLead'
import { createWrapper } from './test-utils'
import { server } from '@/mocks/node'
import { leadsStore } from '@/mocks/data/leads'

const initialLength = leadsStore.length
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => { server.resetHandlers(); leadsStore.length = initialLength })
afterAll(() => server.close())

describe('useDeleteLead', () => {
  it('calls DELETE /api/leads/:id and invalidates leads query', async () => {
    const firstLeadId = leadsStore[0].id
    const { result } = renderHook(() => useDeleteLead(), { wrapper: createWrapper() })
    expect(result.current.isPending).toBe(false)

    act(() => { result.current.mutate(firstLeadId) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(leadsStore.find(l => l.id === firstLeadId)).toBeUndefined()
  })
})

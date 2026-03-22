import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '@/mocks/node'
import { useLead } from '@/hooks/useLead'
import { createWrapper } from './test-utils'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useLead', () => {
  it('fetches full lead by id', async () => {
    const { result } = renderHook(() => useLead('lead-001'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('lead-001')
    expect(result.current.data?.vehiclesOfInterest).toBeDefined()
  })

  it('sets isError on 404', async () => {
    const { result } = renderHook(() => useLead('does-not-exist'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

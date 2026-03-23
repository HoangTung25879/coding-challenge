import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useDataTable } from '@/hooks/useDataTable'
import type { Lead } from '@/types'

const col = createColumnHelper<Lead>()
const columns: ColumnDef<Lead, unknown>[] = [
  col.accessor('fullName', { header: 'Name' }),
  col.accessor('status', { header: 'Status' }),
  col.accessor('email', { header: 'Email' }),
] as ColumnDef<Lead, unknown>[]

const mockLead: Lead = {
  id: 'lead-001',
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '555-0100',
  bestTimeToContact: 'morning',
  address: { street: '123 Main', city: 'Austin', state: 'TX', country: 'US', postalCode: '78701' },
  leadType: 'warm',
  clientProfile: { type: 'individual', jobTitle: 'Engineer' },
  source: 'website',
  salesModel: 'direct',
  preferredCommunication: ['email'],
  notes: '',
  vehiclesOfInterest: [],
  budget: { max: 50000, monthlyPaymentTarget: 800, currency: 'USD' },
  financingPreference: 'cash',
  purchaseTimeline: 'within-3-months',
  status: 'new',
  assignedSalesRepId: 'rep-001',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const defaultPagination = { page: 1, limit: 10, total: 1, totalPages: 1 }

function setup(overrides?: Partial<Parameters<typeof useDataTable>[0]>) {
  const onStateChange = vi.fn()
  return renderHook(() =>
    useDataTable({
      columns,
      data: [mockLead],
      pagination: defaultPagination,
      isLoading: false,
      isError: false,
      error: null,
      onStateChange,
      ...overrides,
    }),
  )
}

describe('useDataTable', () => {
  it('returns table instance and initial state', () => {
    const { result } = setup()
    expect(result.current.table).toBeDefined()
    expect(result.current.filters.search).toBe('')
    expect(result.current.sorting).toEqual([])
    expect(result.current.pageSize).toBe(10)
    expect(result.current.isLoading).toBe(false)
  })

  it('setFilter updates filter and calls onStateChange', () => {
    const onStateChange = vi.fn()
    const { result } = setup({ onStateChange })

    act(() => result.current.setFilter('status', 'qualified'))

    expect(result.current.filters.status).toBe('qualified')
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'qualified', page: 1, limit: 10 }),
    )
  })

  it('setFilter with search calls onStateChange with search param', () => {
    const onStateChange = vi.fn()
    const { result } = setup({ onStateChange })

    act(() => result.current.setFilter('search', 'hello'))

    expect(result.current.filters.search).toBe('hello')
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'hello' }),
    )
  })

  it('setFilter with budgetMin sends numeric value', () => {
    const onStateChange = vi.fn()
    const { result } = setup({ onStateChange })

    act(() => result.current.setFilter('budgetMin', 50000))

    expect(result.current.filters.budgetMin).toBe(50000)
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ budgetMin: 50000 }),
    )
  })

  it('clearFilters resets all filters and calls onStateChange', () => {
    const onStateChange = vi.fn()
    const { result } = setup({ onStateChange })

    act(() => result.current.setFilter('status', 'qualified'))
    act(() => result.current.setFilter('search', 'test'))
    act(() => result.current.clearFilters())

    expect(result.current.filters.search).toBe('')
    expect(result.current.filters.status).toBe('')
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    )
    // Should not contain filter keys when cleared
    const lastCall = onStateChange.mock.calls[onStateChange.mock.calls.length - 1][0]
    expect(lastCall.status).toBeUndefined()
    expect(lastCall.search).toBeUndefined()
  })

  it('sorting change calls onStateChange with sort + order', () => {
    const onStateChange = vi.fn()
    const { result } = setup({ onStateChange })

    act(() => {
      result.current.table.setSorting([{ id: 'fullName', desc: false }])
    })

    expect(result.current.sorting).toEqual([{ id: 'fullName', desc: false }])
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'fullName', order: 'asc' }),
    )
  })

  it('sorting descending sends order desc', () => {
    const onStateChange = vi.fn()
    const { result } = setup({ onStateChange })

    act(() => {
      result.current.table.setSorting([{ id: 'status', desc: true }])
    })

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'status', order: 'desc' }),
    )
  })

  it('column visibility toggling', () => {
    const { result } = setup()

    act(() => result.current.setColumnVisibility({ email: false }))

    expect(result.current.columnVisibility).toEqual({ email: false })
  })

  it('sticky column state', () => {
    const { result } = setup()

    // Default sticky is fullName
    expect(result.current.stickyColumns).toEqual(['fullName'])

    act(() => result.current.setStickyColumns(['status']))

    expect(result.current.stickyColumns).toEqual(['status'])
  })

  it('setPageSize updates page size and calls onStateChange', () => {
    const onStateChange = vi.fn()
    const { result } = setup({ onStateChange })

    act(() => result.current.setPageSize(25))

    expect(result.current.pageSize).toBe(25)
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 25, page: 1 }),
    )
  })

  it('passes through isLoading and isError states', () => {
    const { result } = setup({ isLoading: true, isError: false })
    expect(result.current.isLoading).toBe(true)

    const { result: result2 } = setup({ isError: true, error: new Error('fail') })
    expect(result2.current.isError).toBe(true)
    expect(result2.current.error?.message).toBe('fail')
  })

  it('table is configured with manual modes', () => {
    const { result } = setup()
    const table = result.current.table
    expect(table.options.manualSorting).toBe(true)
    expect(table.options.manualFiltering).toBe(true)
    expect(table.options.manualPagination).toBe(true)
  })
})

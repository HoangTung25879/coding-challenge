import { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table'
import type { Lead } from '@/types'
import { VirtualizedTableBody } from '@/components/data-table/VirtualizedTableBody'

const col = createColumnHelper<Lead>()
const columns = [
  col.accessor('fullName', { header: 'Name' }),
  col.accessor('status', { header: 'Status' }),
]

function makeLead(id: string, name: string): Lead {
  return {
    id,
    fullName: name,
    email: `${name.toLowerCase().replace(' ', '.')}@test.com`,
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
}

function TestBody({
  data = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  onClearFilters,
}: {
  data?: Lead[]
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
  onRetry?: () => void
  onClearFilters?: () => void
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div ref={parentRef} style={{ height: 500, overflow: 'auto' }}>
      <VirtualizedTableBody
        table={table}
        stickyColumns={[]}
        isLoading={isLoading}
        isError={isError}
        error={error}
        pageSize={10}
        parentRef={parentRef}
        onRetry={onRetry}
        onClearFilters={onClearFilters}
      />
    </div>
  )
}

describe('VirtualizedTableBody', () => {
  it('shows shimmer rows when loading', () => {
    const { container } = render(<TestBody isLoading />)
    const tbody = container.querySelector('tbody')
    expect(tbody).toHaveAttribute('aria-busy', 'true')
    const shimmerRows = tbody?.querySelectorAll('tr')
    expect(shimmerRows?.length).toBe(10) // matches pageSize
  })

  it('shows error message and retry button', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<TestBody isError error={new Error('Network error')} onRetry={onRetry} />)

    expect(screen.getByText('Failed to load leads')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()

    await user.click(screen.getByText('Retry'))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows empty state with clear filters button', async () => {
    const user = userEvent.setup()
    const onClearFilters = vi.fn()
    render(<TestBody data={[]} onClearFilters={onClearFilters} />)

    expect(screen.getByText('No leads match your filters')).toBeInTheDocument()

    await user.click(screen.getByText('Clear filters'))
    expect(onClearFilters).toHaveBeenCalledOnce()
  })

  it('renders tbody when data is provided (not loading/error/empty)', () => {
    const data = [makeLead('1', 'Alice'), makeLead('2', 'Bob')]
    const { container } = render(<TestBody data={data} />)

    // A tbody is rendered (virtualizer manages row positioning)
    const tbody = container.querySelector('tbody')
    expect(tbody).toBeInTheDocument()
    // No error/empty/loading state shown
    expect(screen.queryByText('Failed to load leads')).not.toBeInTheDocument()
    expect(screen.queryByText('No leads match your filters')).not.toBeInTheDocument()
  })
})

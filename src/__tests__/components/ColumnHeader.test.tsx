import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table'
import type { Lead } from '@/types'
import { ColumnHeader } from '@/components/data-table/ColumnHeader'

const col = createColumnHelper<Lead>()
const columns = [
  col.accessor('fullName', { header: 'Name', enableSorting: true, enableResizing: true }),
  col.accessor('status', { header: 'Status', enableSorting: true }),
]

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

function TestTable({ onToggleSticky }: { onToggleSticky?: (id: string) => void }) {
  const table = useReactTable({
    data: [mockLead],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    columnResizeMode: 'onChange',
  })

  const headerGroup = table.getHeaderGroups()[0]
  return (
    <table>
      <thead>
        <tr>
          {headerGroup.headers.map((header) => (
            <ColumnHeader
              key={header.id}
              header={header}
              isSticky={header.column.id === 'fullName'}
              onToggleSticky={onToggleSticky}
            />
          ))}
        </tr>
      </thead>
    </table>
  )
}

describe('ColumnHeader', () => {
  it('renders column header text', () => {
    render(<TestTable />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('has aria-sort="none" by default for sortable columns', () => {
    render(<TestTable />)
    const nameTh = screen.getByText('Name').closest('th')
    expect(nameTh).toHaveAttribute('aria-sort', 'none')
  })

  it('renders resize separator on resizable columns', () => {
    render(<TestTable />)
    const separators = screen.getAllByRole('separator')
    expect(separators.length).toBeGreaterThan(0)
    expect(separators[0]).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('calls onToggleSticky when pin button clicked', async () => {
    const user = userEvent.setup()
    const onToggleSticky = vi.fn()
    render(<TestTable onToggleSticky={onToggleSticky} />)

    const pinButtons = screen.getAllByTitle(/pin/i)
    await user.click(pinButtons[0])
    expect(onToggleSticky).toHaveBeenCalledWith('fullName')
  })

  it('applies sticky positioning to sticky column', () => {
    render(<TestTable />)
    const nameTh = screen.getByText('Name').closest('th')
    expect(nameTh?.style.position).toBe('sticky')
  })
})

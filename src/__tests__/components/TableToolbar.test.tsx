import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { GlobalSearch } from '@/components/data-table/GlobalSearch'
import { FilterMenu } from '@/components/data-table/FilterMenu'
import { ColumnVisibilityToggle } from '@/components/data-table/ColumnVisibilityToggle'
import { PageSizeSelector } from '@/components/data-table/PageSizeSelector'
import { TableToolbar } from '@/components/data-table/TableToolbar'
import type { FilterState } from '@/hooks/useDataTable'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table'
import type { Lead } from '@/types'

const defaultFilters: FilterState = {
  search: '',
  source: '',
  budgetMin: undefined,
  budgetMax: undefined,
  currency: '',
  timeline: '',
  financing: '',
  leadType: '',
}

describe('GlobalSearch', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces onChange by 300ms', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<GlobalSearch value="" onChange={onChange} />)
    const input = screen.getByRole('searchbox')

    fireEvent.change(input, { target: { value: 'h' } })
    expect(onChange).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(200) })
    expect(onChange).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(100) })
    expect(onChange).toHaveBeenCalledWith('h')
  })

  it('has correct ARIA attributes', () => {
    render(<GlobalSearch value="" onChange={vi.fn()} />)
    const input = screen.getByRole('searchbox')
    expect(input).toHaveAttribute('aria-label', 'Search leads')
  })
})

describe('FilterMenu', () => {
  it('opens filter menu and shows filter categories', async () => {
    const user = userEvent.setup()
    const setFilter = vi.fn()
    render(<FilterMenu filters={defaultFilters} setFilter={setFilter} />)

    await user.click(screen.getByLabelText('Filter leads'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Financing')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Budget')).toBeInTheDocument()
  })

  it('expands a category and selects a filter option', async () => {
    const user = userEvent.setup()
    const setFilter = vi.fn()
    render(<FilterMenu filters={defaultFilters} setFilter={setFilter} />)

    await user.click(screen.getByLabelText('Filter leads'))
    await user.click(screen.getByText('Source'))
    await user.click(screen.getByText('Website'))
    expect(setFilter).toHaveBeenCalledWith('source', 'website')
  })

  it('shows active filter count badge', () => {
    const activeFilters = { ...defaultFilters, source: 'website', leadType: 'hot' }
    render(<FilterMenu filters={activeFilters} setFilter={vi.fn()} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})

describe('ColumnVisibilityToggle', () => {
  const col = createColumnHelper<Lead>()
  const columns = [
    col.accessor('fullName', { header: 'Name' }),
    col.accessor('status', { header: 'Status' }),
  ]

  function TestToggle() {
    const table = useReactTable({
      data: [],
      columns,
      getCoreRowModel: getCoreRowModel(),
    })
    return <ColumnVisibilityToggle table={table} />
  }

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<TestToggle />)

    expect(screen.queryByText('Name')).not.toBeInTheDocument()
    await user.click(screen.getByText('Columns'))
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<TestToggle />)

    await user.click(screen.getByText('Columns'))
    expect(screen.getByText('Name')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText('Name')).not.toBeInTheDocument()
  })
})

describe('PageSizeSelector', () => {
  it('calls onChange with selected page size', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PageSizeSelector pageSize={10} onChange={onChange} />)

    const select = screen.getByLabelText('Rows per page')
    await user.selectOptions(select, '25')
    expect(onChange).toHaveBeenCalledWith(25)
  })

  it('shows current page size as selected', () => {
    render(<PageSizeSelector pageSize={50} onChange={vi.fn()} />)
    const select = screen.getByLabelText('Rows per page') as HTMLSelectElement
    expect(select.value).toBe('50')
  })
})

// Minimal table stub — TableToolbar only calls table.getAllColumns() for ColumnVisibilityToggle
function makeStubTable() {
  return {
    getAllColumns: () => [],
    getAllLeafColumns: () => [],
    getState: () => ({ columnVisibility: {} }),
  } as unknown as import('@tanstack/react-table').Table<import('@/types').Lead>
}

describe('TableToolbar integration', () => {
  const defaultFilters: FilterState = {
    search: '', source: '',
    budgetMin: undefined, budgetMax: undefined,
    currency: '', timeline: '', financing: '', leadType: '',
  }

  it('never renders a Create Lead button (button moved to header)', () => {
    render(
      <TableToolbar
        table={makeStubTable()}
        filters={defaultFilters}
        setFilter={vi.fn()}
        pageSize={10}
        onPageSizeChange={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /create lead/i })).not.toBeInTheDocument()
  })
})

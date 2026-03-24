import type { Table } from '@tanstack/react-table'
import type { Lead } from '@/types'
import type { FilterState } from '@/hooks/useDataTable'
import { GlobalSearch } from './GlobalSearch'
import { FilterMenu } from './FilterMenu'
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle'
import { PageSizeSelector } from './PageSizeSelector'
import { Button } from '@/components/ui/Button'
import { Bookmark } from 'lucide-react'

type Props = {
  table: Table<Lead>
  filters: FilterState
  setFilter: (key: string, value: unknown) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  isModified?: boolean
  hasSavedView?: boolean
  onSave?: () => void
  onReset?: () => void
}

export function TableToolbar({
  table,
  filters,
  setFilter,
  pageSize,
  onPageSizeChange,
  isModified = false,
  hasSavedView = false,
  onSave,
  onReset,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <GlobalSearch
        value={filters.search}
        onChange={(v) => setFilter('search', v)}
      />
      <FilterMenu filters={filters} setFilter={setFilter} />
      <div className="ml-auto flex items-center gap-3">
        {hasSavedView && !isModified && (
          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-200">
            <Bookmark className="h-3.5 w-3.5" />
            Saved view
          </span>
        )}
        {hasSavedView && onReset && (
          <Button variant="ghost" size="md" onClick={onReset}>
            Reset
          </Button>
        )}
        {isModified && onSave && (
          <Button variant="primary" size="md" onClick={onSave}>
            Save View
          </Button>
        )}
        <PageSizeSelector pageSize={pageSize} onChange={onPageSizeChange} />
        <ColumnVisibilityToggle table={table} />
      </div>
    </div>
  )
}

import type { Table } from '@tanstack/react-table'
import type { Lead } from '@/types'
import type { FilterState } from '@/hooks/useDataTable'
import { GlobalSearch } from './GlobalSearch'
import { FilterMenu } from './FilterMenu'
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle'
import { PageSizeSelector } from './PageSizeSelector'
import { Button } from '@/components/ui/Button'

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
        {(isModified || hasSavedView) && onReset && (
          <Button variant="ghost" size="md" onClick={onReset}>
            Reset
          </Button>
        )}
        {onSave && (
          <Button
            variant="primary"
            size="md"
            onClick={onSave}
            disabled={!isModified}
          >
            Save View
          </Button>
        )}
        <PageSizeSelector pageSize={pageSize} onChange={onPageSizeChange} />
        <ColumnVisibilityToggle table={table} />
      </div>
    </div>
  )
}

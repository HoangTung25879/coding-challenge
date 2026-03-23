import { useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLeads } from '@/hooks/useLeads'
import { useDataTable } from '@/hooks/useDataTable'
import { useSavedView, type TableStateSnapshot } from '@/hooks/useSavedView'
import { allColumns, defaultColumnVisibility } from './lead-columns'
import { TableToolbar } from '@/components/data-table/TableToolbar'
import { TableContainer } from '@/components/data-table/TableContainer'
import { TableHeader } from '@/components/data-table/TableHeader'
import { VirtualizedTableBody } from '@/components/data-table/VirtualizedTableBody'
import { PaginationControls } from '@/components/leads/PaginationControls'
import type { LeadsParams } from '@/lib/api'

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 0 }

export default function LeadsPage() {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const currentParams: LeadsParams = {
    page: Math.max(1, Number(searchParams.get('page') ?? 1)),
    limit: Number(searchParams.get('limit') ?? 10),
    search: searchParams.get('search') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    source: searchParams.get('source') ?? undefined,
    budgetMin: searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined,
    budgetMax: searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined,
    timeline: searchParams.get('timeline') ?? undefined,
    financing: searchParams.get('financing') ?? undefined,
    leadType: searchParams.get('leadType') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    order: (searchParams.get('order') as 'asc' | 'desc') ?? undefined,
  }

  const { data, isLoading, isError, error, isFetching, refetch } = useLeads(currentParams)

  const onStateChange = useCallback(
    (params: LeadsParams) => {
      setSearchParams(() => {
        const qs = new URLSearchParams()
        if (params.page && params.page > 1) qs.set('page', String(params.page))
        if (params.limit && params.limit !== 10) qs.set('limit', String(params.limit))
        if (params.search) qs.set('search', params.search)
        if (params.status) qs.set('status', params.status)
        if (params.source) qs.set('source', params.source)
        if (params.budgetMin != null) qs.set('budgetMin', String(params.budgetMin))
        if (params.budgetMax != null) qs.set('budgetMax', String(params.budgetMax))
        if (params.timeline) qs.set('timeline', params.timeline)
        if (params.financing) qs.set('financing', params.financing)
        if (params.leadType) qs.set('leadType', params.leadType)
        if (params.sort) qs.set('sort', params.sort)
        if (params.order) qs.set('order', params.order)
        return qs
      })
    },
    [setSearchParams],
  )

  const dt = useDataTable({
    columns: allColumns,
    data: data?.data ?? [],
    pagination: data?.pagination ?? DEFAULT_PAGINATION,
    isLoading,
    isError,
    error: error as Error | null,
    onStateChange,
  })

  if (Object.keys(dt.columnVisibility).length === 0 && Object.keys(defaultColumnVisibility).length > 0) {
    dt.setColumnVisibility(defaultColumnVisibility)
  }

  const currentSnapshot: TableStateSnapshot = {
    filters: dt.filters,
    sorting: dt.sorting,
    columnVisibility: dt.columnVisibility,
    stickyColumns: dt.stickyColumns,
    pageSize: dt.pageSize,
  }

  const savedView = useSavedView(currentSnapshot)

  // On mount, restore saved view if one exists
  const hasRestoredRef = useRef(false)
  useEffect(() => {
    if (hasRestoredRef.current) return
    hasRestoredRef.current = true
    if (savedView.savedSnapshot) {
      const s = savedView.savedSnapshot
      dt.setFilters(s.filters)
      dt.setSorting(s.sorting)
      dt.setColumnVisibility(s.columnVisibility)
      dt.setStickyColumns(s.stickyColumns)
      dt.setPageSize(s.pageSize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSave() {
    savedView.save(currentSnapshot)
  }

  function handleReset() {
    savedView.reset()
    const d = savedView.defaults
    dt.setFilters(d.filters)
    dt.setSorting(d.sorting)
    dt.setColumnVisibility(d.columnVisibility)
    dt.setStickyColumns(d.stickyColumns)
    dt.setPageSize(d.pageSize)
    onStateChange({ page: 1, limit: d.pageSize })
  }

  function handleToggleSticky(columnId: string) {
    dt.setStickyColumns(
      dt.stickyColumns.includes(columnId)
        ? dt.stickyColumns.filter((id) => id !== columnId)
        : [...dt.stickyColumns, columnId],
    )
  }

  const pagination = data?.pagination ?? DEFAULT_PAGINATION

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Lead Inbox</h2>

      <TableToolbar
        table={dt.table}
        filters={dt.filters}
        setFilter={dt.setFilter}
        pageSize={dt.pageSize}
        onPageSizeChange={dt.setPageSize}
        isModified={savedView.isModified}
        hasSavedView={savedView.hasSavedView}
        onSave={handleSave}
        onReset={handleReset}
      />

      <TableContainer ref={tableContainerRef} isRefetching={isFetching && !isLoading}>
        <table className="w-full" style={{ tableLayout: 'fixed', minWidth: dt.table.getTotalSize() }}>
          <TableHeader
            table={dt.table}
            stickyColumns={dt.stickyColumns}
            onToggleSticky={handleToggleSticky}
          />
          <VirtualizedTableBody
            table={dt.table}
            stickyColumns={dt.stickyColumns}
            isLoading={dt.isLoading}
            isError={dt.isError}
            error={dt.error}
            pageSize={dt.pageSize}
            parentRef={tableContainerRef}
            onRetry={() => refetch()}
            onClearFilters={dt.clearFilters}
          />
        </table>
      </TableContainer>

      <p className="text-sm text-gray-500">
        {pagination.total} lead{pagination.total !== 1 ? 's' : ''} found
      </p>

      {pagination.totalPages > 1 && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          params={currentParams}
          onPageChange={(p) => onStateChange({ ...currentParams, page: p })}
        />
      )}
    </div>
  )
}

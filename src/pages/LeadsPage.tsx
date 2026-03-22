// src/pages/LeadsPage.tsx
import { useSearchParams } from 'react-router-dom'
import { useLeads } from '@/hooks/useLeads'
import { LeadList } from '@/components/leads/LeadList'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { PaginationControls } from '@/components/leads/PaginationControls'
import { LeadCardSkeleton } from '@/components/ui/Skeleton'

export default function LeadsPage() {
  const [searchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const status = searchParams.get('status') ?? undefined
  const source = searchParams.get('source') ?? undefined

  const { data, isLoading, isError, error } = useLeads({ page, limit: 10, status, source })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Lead Inbox</h2>
        <LeadFilters />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <LeadCardSkeleton key={i} />)}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Failed to load leads</p>
          <p className="text-sm mt-1">{(error as Error).message}</p>
        </div>
      )}

      {data && (
        <>
          <p className="text-sm text-gray-500">
            {data.pagination.total} lead{data.pagination.total !== 1 ? 's' : ''} found
          </p>
          <LeadList leads={data.data} />
          {data.pagination.totalPages > 1 && (
            <PaginationControls
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          )}
        </>
      )}
    </div>
  )
}

// src/components/leads/PaginationControls.tsx
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchLeads, type LeadsParams } from '@/lib/api'

type Props = {
  page: number
  totalPages: number
}

export function PaginationControls({ page, totalPages }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // Read current filter params so prefetch query key matches useLeads exactly
  const status = searchParams.get('status') ?? undefined
  const source = searchParams.get('source') ?? undefined
  const limit = 10

  function goTo(nextPage: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(nextPage))
      return next
    })
  }

  // Prefetch adjacent pages using same query key shape as useLeads
  useEffect(() => {
    function prefetch(targetPage: number) {
      const params: LeadsParams = { page: targetPage, limit, status, source }
      void queryClient.prefetchQuery({
        queryKey: ['leads', params],
        queryFn: () => fetchLeads(params),
      })
    }
    if (page > 1) prefetch(page - 1)
    if (page < totalPages) prefetch(page + 1)
  }, [page, totalPages, limit, status, source, queryClient])

  return (
    <div className="flex items-center gap-3 justify-center mt-6">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  )
}

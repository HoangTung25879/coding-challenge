// src/components/leads/PaginationControls.tsx
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchLeads, type LeadsParams } from '@/lib/api'
import { Button } from '@/components/ui/Button'

type Props = {
  page: number
  totalPages: number
  params: LeadsParams
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, totalPages, params, onPageChange }: Props) {
  const queryClient = useQueryClient()

  // Prefetch adjacent pages using same query key shape as useLeads
  useEffect(() => {
    function prefetch(targetPage: number) {
      const p: LeadsParams = { ...params, page: targetPage }
      void queryClient.prefetchQuery({
        queryKey: ['leads', p],
        queryFn: () => fetchLeads(p),
      })
    }
    if (page > 1) prefetch(page - 1)
    if (page < totalPages) prefetch(page + 1)
  }, [page, totalPages, params, queryClient])

  return (
    <nav aria-label="Pagination" className="flex items-center gap-3 justify-center mt-6">
      <Button
        variant="secondary"
        size="lg"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page <span aria-current="page" className="font-medium">{page}</span> of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next
      </Button>
    </nav>
  )
}

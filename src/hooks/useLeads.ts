import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchLeads, type LeadsParams } from '@/lib/api'

export function useLeads(params: LeadsParams) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
    placeholderData: keepPreviousData,
  })
}

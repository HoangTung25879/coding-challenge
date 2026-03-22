import { useQuery } from '@tanstack/react-query'
import { fetchActivities } from '@/lib/api'

export function useActivities(leadId: string) {
  return useQuery({
    queryKey: ['activities', leadId],
    queryFn: () => fetchActivities(leadId),
    enabled: !!leadId,
  })
}
